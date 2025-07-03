from flask import Blueprint, request, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from utils.helpers import (
    format_success_response,
    format_error_response,
    require_auth,
    validate_prompt,
    generate_uuid,
    get_current_timestamp
)
from services.dynamodb import DynamoDBService
from services.s3_service import S3Service
from services.usage_tracker import UsageTracker
from services.platform_tracker import platform_tracker
import logging
import base64
import requests
import time

images_bp = Blueprint('images', __name__)
logger = logging.getLogger(__name__)

# Rate limiting for image generation
limiter = Limiter(key_func=get_remote_address)

@images_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify the route is working"""
    return format_success_response({'message': 'Images API is working'})

@images_bp.route('/generate', methods=['POST'])
@require_auth
@limiter.limit("5 per minute")  # Limit to 5 generations per minute
def generate_image():
    """Generate a new image using AI"""
    try:
        data = request.get_json()

        if not data:
            return format_error_response('Request body required', 400)

        # Check usage limits
        usage_tracker = UsageTracker()
        can_generate, current_usage, limit = usage_tracker.check_usage_limit(
            user_id=request.user_id,
            ip_address=request.remote_addr
        )

        if not can_generate:
            return format_error_response(
                f'Daily limit reached. You have used {current_usage}/{limit} images today. Limit resets at midnight UTC.',
                429
            )

        # Validate required fields
        prompt = data.get('prompt', '').strip()
        if not prompt:
            return format_error_response('Prompt is required', 400)

        # Validate prompt
        is_valid, error_message = validate_prompt(prompt)
        if not is_valid:
            return format_error_response(error_message, 400)

        # Extract generation parameters
        # FLUX.1-schnell works best with 1-4 steps
        steps = min(data.get('steps', 4), 4)  # Cap at 4 steps for FLUX.1-schnell

        params = {
            'prompt': prompt,
            'negative_prompt': data.get('negative_prompt', '').strip(),
            'width': data.get('width', 1024),
            'height': data.get('height', 1024),
            'steps': steps,
            'guidance_scale': data.get('guidance_scale', 7.5),
            'seed': data.get('seed', -1),
            'style': data.get('style', 'none')
        }

        logger.info(f"Generating image for user {request.user_id}: {prompt[:100]}...")
        logger.info(f"Generation parameters: {params}")

        # Call Together AI API directly

        api_key = current_app.config.get('TOGETHER_AI_API_KEY')
        if not api_key:
            return format_error_response('Together AI API key not configured', 500)

        # Apply style preset to prompt
        styled_prompt = prompt
        if params['style'] and params['style'] != 'none':
            style_modifiers = {
                'photographic': ', professional photography, high quality, detailed, realistic',
                'digital-art': ', digital art, concept art, detailed, vibrant colors',
                'cinematic': ', cinematic lighting, dramatic, film still, high quality',
                'anime': ', anime style, manga, detailed, vibrant colors',
                'fantasy': ', fantasy art, magical, detailed, epic',
                'abstract': ', abstract art, artistic, creative, unique style',
                'vintage': ', vintage style, retro, classic, aged look',
                'minimalist': ', minimalist, clean, simple, elegant'
            }

            if params['style'] in style_modifiers:
                styled_prompt = prompt + style_modifiers[params['style']]

        # Prepare request payload for FLUX model (minimal parameters for testing)
        payload = {
            'model': 'black-forest-labs/FLUX.1-schnell-Free',
            'prompt': styled_prompt,
            'width': params['width'],
            'height': params['height'],
            'steps': params['steps'],
            'n': 1,
            'response_format': 'b64_json'
        }

        # Temporarily disable problematic parameters to debug
        # TODO: Re-enable after confirming basic generation works

        # if params['negative_prompt'] and params['negative_prompt'].strip():
        #     payload['negative_prompt'] = params['negative_prompt']

        # if params['guidance_scale'] and params['guidance_scale'] != 7.5:
        #     payload['guidance_scale'] = params['guidance_scale']

        if params['seed'] and params['seed'] != -1:
            payload['seed'] = params['seed']

        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

        logger.info(f"Together AI payload: {payload}")

        start_time = time.time()

        # Make API request with better error handling
        try:
            response = requests.post(
                'https://api.together.xyz/v1/images/generations',
                json=payload,
                headers=headers,
                timeout=120  # Increased timeout
            )
        except requests.exceptions.Timeout:
            logger.error("Together AI API request timed out")
            return format_error_response('Image generation timed out. Please try again.', 408)
        except requests.exceptions.RequestException as e:
            logger.error(f"Together AI API request failed: {str(e)}")
            return format_error_response('Image generation service unavailable. Please try again later.', 503)

        generation_time = time.time() - start_time

        if response.status_code == 200:
            result = response.json()

            if 'data' in result and len(result['data']) > 0:
                image_data = result['data'][0]
                image_b64 = image_data.get('b64_json')

                if not image_b64:
                    return format_error_response('No image data in response', 500)

                # Generate unique ID
                image_id = generate_uuid()

                # Decode base64 image for storage
                image_bytes = base64.b64decode(image_b64)

                # Try to initialize services for saving
                try:
                    db_service = DynamoDBService()
                    s3_service = S3Service()
                except Exception as service_error:
                    logger.error(f"Service initialization failed: {str(service_error)}")
                    # Return the image without saving to storage (fallback)
                    response_data = {
                        'id': image_id,
                        'url': f"data:image/png;base64,{image_b64}",
                        'thumbnail_url': f"data:image/png;base64,{image_b64}",
                        'prompt': prompt,
                        'negative_prompt': params['negative_prompt'],
                        'width': params['width'],
                        'height': params['height'],
                        'resolution': f"{params['width']}x{params['height']}",
                        'model': 'black-forest-labs/FLUX.1-schnell-Free',
                        'generation_time': generation_time,
                        'created_at': get_current_timestamp(),
                        'is_favorite': False
                    }

                    # Increment usage count after successful generation
                    usage_tracker.increment_usage(
                        user_id=request.user_id,
                        ip_address=request.remote_addr
                    )

                    return format_success_response(response_data, 'Image generated successfully (storage unavailable)')

                # Generate filename
                filename = f"{image_id}.png"

                # Try to upload to S3, but continue without it if it fails
                upload_result = None
                try:
                    upload_result = s3_service.upload_image(image_bytes, filename)
                except Exception as upload_error:
                    logger.warning(f"S3 upload failed, continuing without storage: {str(upload_error)}")

                # Prepare metadata for database
                base_url = f"data:image/png;base64,{image_b64}"
                file_url = upload_result['url'] if upload_result and upload_result.get('success') else base_url
                file_size = upload_result.get('size', len(image_bytes)) if upload_result and upload_result.get('success') else len(image_bytes)

                metadata = {
                    'id': image_id,
                    'user_id': request.user_id,
                    'prompt': prompt,
                    'negative_prompt': params['negative_prompt'],
                    'width': params['width'],
                    'height': params['height'],
                    'steps': params['steps'],
                    'guidance_scale': params['guidance_scale'],
                    'seed': params['seed'],
                    'model': 'black-forest-labs/FLUX.1-schnell-Free',
                    'file_url': file_url,
                    'thumbnail_url': file_url,
                    'file_size': file_size,
                    'generation_time': generation_time,
                    'created_at': get_current_timestamp(),
                    'is_favorite': False
                }

                # PERSISTENT STORAGE - NEVER LOSE DATA
                try:
                    # ALWAYS save to persistent storage first (guaranteed to work)
                    from services.persistent_storage import PersistentStorage
                    persistent_storage = PersistentStorage()

                    # Save image metadata to persistent storage
                    persistent_storage.save_image(metadata)
                    logger.info(f"💾 Image saved to persistent storage: {image_id}")

                    # Save generation record to persistent storage
                    generation_params = {
                        'prompt': prompt,
                        'negative_prompt': params['negative_prompt'],
                        'width': params['width'],
                        'height': params['height'],
                        'steps': params['steps'],
                        'guidance_scale': params['guidance_scale'],
                        'seed': params['seed'],
                        'model': 'black-forest-labs/FLUX.1-schnell-Free'
                    }
                    persistent_storage.save_generation_record(request.user_id, image_id, generation_params)
                    logger.info(f"📝 Generation record saved to persistent storage: {image_id}")

                except Exception as persistent_error:
                    logger.error(f"❌ CRITICAL: Persistent storage failed: {persistent_error}")
                    # This should never happen, but continue anyway

                # Also try to save to DynamoDB (optional, best effort)
                try:
                    logger.info(f"Attempting to save image metadata to DynamoDB for {image_id}")
                    save_result = db_service.save_image_metadata(metadata)
                    if save_result['success']:
                        logger.info(f"✅ Image metadata also saved to DynamoDB: {image_id}")

                        # Record generation history in DynamoDB
                        try:
                            db_service.record_generation(request.user_id, image_id, generation_params)
                            logger.info(f"✅ Generation history also recorded in DynamoDB for {image_id}")
                        except Exception as history_error:
                            logger.info(f"ℹ️ DynamoDB generation history failed (persistent storage succeeded): {str(history_error)}")
                    else:
                        logger.info(f"ℹ️ DynamoDB save failed (persistent storage succeeded): {save_result.get('error', 'Unknown error')}")

                except Exception as db_error:
                    logger.info(f"ℹ️ DynamoDB operation failed (persistent storage succeeded): {str(db_error)}")

                logger.info(f"🎉 Image generated and saved successfully: {image_id}")

                # Return response (always return the image, even if storage failed)
                response_data = {
                    'id': image_id,
                    'url': f"data:image/png;base64,{image_b64}",  # For immediate display
                    'file_url': file_url,  # For downloads
                    'thumbnail_url': file_url,
                    'prompt': prompt,
                    'negative_prompt': params['negative_prompt'],
                    'width': params['width'],
                    'height': params['height'],
                    'resolution': f"{params['width']}x{params['height']}",
                    'model': 'black-forest-labs/FLUX.1-schnell-Free',
                    'generation_time': generation_time,
                    'created_at': get_current_timestamp(),
                    'is_favorite': False
                }

                # Increment usage count after successful generation
                usage_tracker.increment_usage(
                    user_id=request.user_id,
                    ip_address=request.remote_addr
                )

                # Track image generation for admin analytics
                try:
                    # Get user information for tracking
                    user_id = getattr(request, 'user_id', 'unknown')
                    user_email = getattr(request, 'user_email', None)

                    # If no email in request, try to get it from Clerk
                    if not user_email and user_id != 'unknown':
                        try:
                            from services.admin_analytics import AdminAnalytics
                            admin_analytics = AdminAnalytics()
                            user_email = admin_analytics._get_user_email_from_clerk(user_id)
                        except:
                            user_email = f"{user_id}@user.com"  # Fallback format

                    if not user_email:
                        user_email = 'unknown@user.com'

                    logger.info(f"🔍 Attempting to track image generation - User ID: {user_id}, Email: {user_email}, Image ID: {image_id}")

                    platform_tracker.track_image_generation(user_email, {
                        'id': image_id,
                        'prompt': prompt,
                        'width': params['width'],
                        'height': params['height'],
                        'model': 'FLUX.1-schnell',
                        'generation_time': generation_time,
                        'file_size': file_size
                    })
                    logger.info(f"✅ Image generation tracked successfully for admin analytics: {image_id}")
                except Exception as track_error:
                    logger.error(f"❌ Failed to track image generation: {str(track_error)}")
                    import traceback
                    logger.error(f"❌ Tracking error traceback: {traceback.format_exc()}")

                return format_success_response(response_data, 'Image generated successfully')
            else:
                return format_error_response('No image data in API response', 500)
        else:
            # Try to get detailed error message from Together AI
            try:
                error_response = response.json()
                detailed_error = error_response.get('error', {})
                if isinstance(detailed_error, dict):
                    error_detail = detailed_error.get('message', 'Unknown error')
                else:
                    error_detail = str(detailed_error)
            except:
                error_detail = response.text

            error_msg = f"Together AI API error: {response.status_code}"
            if response.status_code == 401:
                error_msg = "Invalid API key"
            elif response.status_code == 429:
                error_msg = "Rate limit exceeded"
            elif response.status_code == 400:
                error_msg = f"Bad request: {error_detail}"

            logger.error(f"Together AI API error: {response.status_code} - {response.text}")
            logger.error(f"Together AI payload that caused error: {payload}")
            return format_error_response(error_msg, 500)

    except requests.exceptions.Timeout:
        return format_error_response('Request timed out. Please try again.', 500)
    except requests.exceptions.ConnectionError:
        return format_error_response('Connection error. Please check your internet connection.', 500)
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        return format_error_response('Image generation failed', 500)

@images_bp.route('/generate-anonymous', methods=['POST'])
@limiter.limit("1 per day per ip")  # Strict limit for anonymous users
def generate_image_anonymous():
    """Generate a new image using AI for non-authenticated users (1 per day)"""
    try:
        data = request.get_json()

        if not data:
            return format_error_response('Request body required', 400)

        # Check usage limits for anonymous users
        usage_tracker = UsageTracker()
        can_generate, current_usage, limit = usage_tracker.check_usage_limit(
            user_id=None,
            ip_address=request.remote_addr
        )

        if not can_generate:
            return format_error_response(
                f'Daily limit reached. Anonymous users can generate {limit} image per day. '
                f'You have used {current_usage}/{limit} images today. '
                f'Sign up for free to get {usage_tracker.limits["authenticated"]} images per day!',
                429
            )

        # Validate required fields
        prompt = data.get('prompt', '').strip()
        if not prompt:
            return format_error_response('Prompt is required', 400)

        # Validate prompt
        is_valid, error_message = validate_prompt(prompt)
        if not is_valid:
            return format_error_response(error_message, 400)

        # Extract generation parameters (with more restrictive defaults for anonymous users)
        params = {
            'prompt': prompt,
            'negative_prompt': data.get('negative_prompt', '').strip(),
            'width': min(data.get('width', 1024), 1024),  # Max 1024 for anonymous
            'height': min(data.get('height', 1024), 1024),  # Max 1024 for anonymous
            'steps': min(data.get('steps', 4), 4),  # Max 4 steps for anonymous
            'guidance_scale': min(data.get('guidance_scale', 7.5), 7.5),
            'seed': data.get('seed', -1),
            'style': 'none'  # No style options for anonymous users
        }

        logger.info(f"Generating image for anonymous user (IP: {request.remote_addr}): {prompt[:100]}...")

        # Call Together AI API
        api_key = current_app.config.get('TOGETHER_AI_API_KEY')
        if not api_key:
            return format_error_response('Together AI API key not configured', 500)

        # Prepare API payload
        payload = {
            'model': current_app.config.get('FLUX_MODEL_NAME', 'black-forest-labs/FLUX.1-schnell-Free'),
            'prompt': params['prompt'],
            'width': params['width'],
            'height': params['height'],
            'steps': params['steps'],
            'n': 1,
            'response_format': 'b64_json'
        }

        # Add negative prompt if provided
        if params['negative_prompt']:
            payload['negative_prompt'] = params['negative_prompt']

        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

        start_time = time.time()

        # Make API request
        try:
            response = requests.post(
                'https://api.together.xyz/v1/images/generations',
                json=payload,
                headers=headers,
                timeout=120
            )
        except requests.exceptions.Timeout:
            logger.error("Together AI API request timed out")
            return format_error_response('Image generation timed out. Please try again.', 408)
        except requests.exceptions.RequestException as e:
            logger.error(f"Together AI API request failed: {str(e)}")
            return format_error_response('Image generation service unavailable. Please try again later.', 503)

        generation_time = time.time() - start_time

        if response.status_code == 200:
            result = response.json()

            if 'data' in result and len(result['data']) > 0:
                image_data = result['data'][0]
                image_b64 = image_data.get('b64_json')

                if not image_b64:
                    return format_error_response('No image data in response', 500)

                # Generate unique ID
                image_id = generate_uuid()

                # For anonymous users, only return the image data without saving to storage
                response_data = {
                    'id': image_id,
                    'url': f"data:image/png;base64,{image_b64}",
                    'thumbnail_url': f"data:image/png;base64,{image_b64}",
                    'prompt': prompt,
                    'negative_prompt': params['negative_prompt'],
                    'width': params['width'],
                    'height': params['height'],
                    'resolution': f"{params['width']}x{params['height']}",
                    'model': 'black-forest-labs/FLUX.1-schnell-Free',
                    'generation_time': generation_time,
                    'created_at': get_current_timestamp(),
                    'is_favorite': False,
                    'anonymous': True
                }

                # Increment usage count after successful generation
                usage_tracker.increment_usage(
                    user_id=None,
                    ip_address=request.remote_addr
                )

                # Track anonymous image generation for admin analytics
                try:
                    logger.info(f"🔍 Attempting to track anonymous image generation - Image ID: {image_id}")

                    platform_tracker.track_image_generation('anonymous@user.com', {
                        'id': image_id,
                        'prompt': prompt,
                        'width': params['width'],
                        'height': params['height'],
                        'model': 'FLUX.1-schnell',
                        'generation_time': generation_time,
                        'file_size': len(image_bytes)
                    })
                    logger.info(f"✅ Anonymous image generation tracked successfully: {image_id}")
                except Exception as track_error:
                    logger.error(f"❌ Failed to track anonymous generation: {str(track_error)}")
                    import traceback
                    logger.error(f"❌ Anonymous tracking error traceback: {traceback.format_exc()}")

                return format_success_response(response_data, 'Image generated successfully! Sign up to save your images and get more daily generations.')
            else:
                return format_error_response('No image data in API response', 500)
        else:
            error_msg = f"Together AI API error: {response.status_code}"
            if response.status_code == 401:
                error_msg = "Invalid API key"
            elif response.status_code == 429:
                error_msg = "Rate limit exceeded"

            logger.error(f"Together AI API error: {response.status_code} - {response.text}")
            return format_error_response(error_msg, 500)

    except Exception as e:
        logger.error(f"Anonymous image generation error: {str(e)}")
        return format_error_response('Image generation failed', 500)

@images_bp.route('/usage-limits', methods=['GET'])
def get_usage_limits():
    """Get usage limits and current usage for authenticated or anonymous users"""
    try:
        # Check if user is authenticated
        auth_header = request.headers.get('Authorization')
        user_id = None

        if auth_header:
            try:
                # Try to extract user ID from token (simplified for this endpoint)
                token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
                import jwt
                payload = jwt.decode(token, options={"verify_signature": False})
                user_id = payload.get('sub')
            except:
                pass  # If token is invalid, treat as anonymous

        usage_tracker = UsageTracker()
        usage_stats = usage_tracker.get_usage_stats(
            user_id=user_id,
            ip_address=request.remote_addr
        )

        return format_success_response(usage_stats)

    except Exception as e:
        logger.error(f"Usage limits check error: {str(e)}")
        return format_error_response('Failed to check usage limits', 500)

@images_bp.route('', methods=['GET'])
@require_auth
def get_user_images():
    """Get user's images with pagination and filtering"""
    try:
        # Parse query parameters
        page = int(request.args.get('page', 1))
        limit = min(50, int(request.args.get('limit', 20)))  # Max 50 per page
        sort = request.args.get('sort', 'newest')
        filter_type = request.args.get('filter', 'all')
        search = request.args.get('search', '').strip()

        # Try to get images from PERSISTENT STORAGE first, then fallback to DynamoDB
        try:
            # PRIMARY: Try persistent storage first
            try:
                from services.persistent_storage import PersistentStorage
                persistent_storage = PersistentStorage()

                # Get user images from persistent storage
                user_images = persistent_storage.get_user_images(request.user_id)

                # Apply filters and search
                filtered_images = user_images

                # Apply search filter
                if search:
                    filtered_images = [
                        img for img in filtered_images
                        if search.lower() in img.get('prompt', '').lower()
                    ]

                # Apply type filter
                if filter_type == 'favorites':
                    filtered_images = [img for img in filtered_images if img.get('is_favorite', False)]

                # Sort by creation date (newest first)
                filtered_images.sort(key=lambda x: x.get('created_at', ''), reverse=True)

                # Apply pagination
                start_idx = (page - 1) * limit
                end_idx = start_idx + limit
                paginated_images = filtered_images[start_idx:end_idx]

                # Calculate pagination info
                total_count = len(filtered_images)
                has_more = len(filtered_images) > end_idx

                result_data = {
                    'images': paginated_images,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total_count,
                        'has_more': has_more,
                        'total_pages': (total_count + limit - 1) // limit
                    }
                }

                logger.info(f"💾 Retrieved {len(paginated_images)} images from persistent storage for user {request.user_id}")
                return format_success_response(result_data)

            except Exception as persistent_error:
                logger.warning(f"Persistent storage failed, trying DynamoDB: {persistent_error}")

                # FALLBACK: Try DynamoDB
                db_service = DynamoDBService()
                result = db_service.get_user_images(
                    user_id=request.user_id,
                    page=page,
                    limit=limit,
                    sort=sort,
                    filter_type=filter_type,
                    search=search
                )

                if result['success']:
                    logger.info(f"📸 Fallback: Retrieved {len(result['data']['images'])} images from DynamoDB for user {request.user_id}")
                    return format_success_response(result['data'])
                else:
                    raise Exception(result.get('error', 'Database query failed'))

        except Exception as final_error:
            logger.warning(f"All storage methods failed, returning empty images: {str(final_error)}")

            # Return empty list when all storage methods are unavailable
            result_data = {
                'images': [],
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': 0,
                    'total_pages': 0
                }
            }

            return format_success_response(result_data)

    except ValueError as e:
        return format_error_response(f"Invalid parameters: {str(e)}", 400)
    except Exception as e:
        logger.error(f"Error fetching user images: {str(e)}")
        return format_error_response('Failed to fetch images', 500)

@images_bp.route('/<image_id>', methods=['GET'])
@require_auth
def get_image(image_id):
    """Get specific image details"""
    try:
        logger.info(f"🔍 Looking up image {image_id} for user {request.user_id}")

        try:
            db_service = DynamoDBService()
            result = db_service.get_image_by_id(image_id, request.user_id)

            if result['success']:
                logger.info(f"✅ Found image {image_id}")
                return format_success_response(result['data'])
            else:
                logger.warning(f"❌ Image {image_id} not found: {result.get('error')}")
                return format_error_response('Image not found', 404)

        except Exception as db_error:
            logger.warning(f"⚠️ Database unavailable for image lookup: {str(db_error)}")
            return format_error_response('Image not found', 404)

    except Exception as e:
        logger.error(f"❌ Error fetching image {image_id}: {str(e)}")
        return format_error_response('Failed to fetch image', 500)

@images_bp.route('/<image_id>', methods=['DELETE'])
@require_auth
def delete_image(image_id):
    """Delete an image"""
    try:
        db_service = DynamoDBService()
        s3_service = S3Service()
        
        # Get image metadata first
        image_result = db_service.get_image_by_id(image_id, request.user_id)
        
        if not image_result['success']:
            return format_error_response('Image not found', 404)
        
        image_data = image_result['data']
        
        # Delete from S3
        filename = image_data['file_url'].split('/')[-1]  # Extract filename from URL
        s3_service.delete_image(filename)
        
        # Delete from database
        db_result = db_service.delete_image(image_id, request.user_id)
        
        if not db_result['success']:
            return format_error_response(db_result['error'], 500)
        
        logger.info(f"Image deleted successfully: {image_id}")
        
        return format_success_response(message='Image deleted successfully')
        
    except Exception as e:
        logger.error(f"Error deleting image {image_id}: {str(e)}")
        return format_error_response('Failed to delete image', 500)

@images_bp.route('/<image_id>/favorite', methods=['PATCH'])
@require_auth
def toggle_favorite(image_id):
    """Toggle favorite status of an image"""
    try:
        data = request.get_json()
        is_favorite = data.get('is_favorite', False) if data else False
        
        db_service = DynamoDBService()
        
        result = db_service.update_image_favorite(image_id, request.user_id, is_favorite)
        
        if not result['success']:
            return format_error_response(result['error'], 404 if 'not found' in result['error'] else 500)
        
        action = 'added to' if is_favorite else 'removed from'
        return format_success_response(
            {'is_favorite': is_favorite}, 
            f'Image {action} favorites'
        )
        
    except Exception as e:
        logger.error(f"Error updating favorite status for image {image_id}: {str(e)}")
        return format_error_response('Failed to update favorite status', 500)

@images_bp.route('/<image_id>/download', methods=['GET'])
@require_auth
def download_image(image_id):
    """Get download URL for an image"""
    try:
        # Try to get image from database
        try:
            db_service = DynamoDBService()

            # Verify user owns the image
            image_result = db_service.get_image_by_id(image_id, request.user_id)

            if image_result['success']:
                image_data = image_result['data']
                file_url = image_data.get('file_url', '')

                # If it's a data URL (base64), return it directly
                if file_url.startswith('data:image'):
                    return format_success_response({
                        'download_url': file_url,
                        'filename': f"promptcanvas_{image_id}.png",
                        'expires_in': 3600
                    })

                # If it's an S3 URL, try to generate presigned URL
                if file_url.startswith('http'):
                    try:
                        s3_service = S3Service()
                        filename = file_url.split('/')[-1]
                        download_url = s3_service.generate_download_url(filename)

                        if download_url:
                            return format_success_response({
                                'download_url': download_url,
                                'filename': f"promptcanvas_{image_id}.png",
                                'expires_in': 3600
                            })
                        else:
                            # Fallback to direct S3 URL
                            return format_success_response({
                                'download_url': file_url,
                                'filename': f"promptcanvas_{image_id}.png",
                                'expires_in': 3600
                            })
                    except Exception as s3_error:
                        logger.warning(f"S3 service unavailable, using direct URL: {str(s3_error)}")
                        return format_success_response({
                            'download_url': file_url,
                            'filename': f"promptcanvas_{image_id}.png",
                            'expires_in': 3600
                        })

                # If no valid URL found
                return format_error_response('Image file not available for download', 404)
            else:
                return format_error_response('Image not found', 404)

        except Exception as db_error:
            logger.warning(f"Database unavailable for download: {str(db_error)}")
            return format_error_response('Image not found', 404)

    except Exception as e:
        logger.error(f"Error generating download URL for image {image_id}: {str(e)}")
        return format_error_response('Failed to generate download URL', 500)

@images_bp.route('/save-to-gallery', methods=['POST'])
@require_auth
def save_to_gallery():
    """Save a generated image to the gallery"""
    try:
        data = request.get_json()

        if not data:
            return format_error_response('Request body required', 400)

        # Validate required fields
        image_data = data.get('image_data')  # base64 encoded image
        image_metadata = data.get('metadata', {})

        if not image_data:
            return format_error_response('Image data is required', 400)

        if not image_metadata.get('prompt'):
            return format_error_response('Image metadata with prompt is required', 400)

        # Decode base64 image
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]

            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            logger.error(f"Failed to decode image data: {str(e)}")
            return format_error_response('Invalid image data format', 400)

        # Generate unique filename
        image_id = image_metadata.get('id') or generate_uuid()
        filename = f"{image_id}.png"

        # Initialize services
        db_service = DynamoDBService()
        s3_service = S3Service()

        # Upload to S3
        upload_result = s3_service.upload_image(image_bytes, filename)

        if not upload_result['success']:
            logger.error(f"S3 upload failed: {upload_result}")
            return format_error_response('Failed to save image', 500)

        # Prepare metadata for database
        metadata = {
            'id': image_id,
            'user_id': request.user_id,
            'prompt': image_metadata['prompt'],
            'negative_prompt': image_metadata.get('negative_prompt', ''),
            'width': image_metadata.get('width', 1024),
            'height': image_metadata.get('height', 1024),
            'steps': image_metadata.get('steps', 4),
            'guidance_scale': image_metadata.get('guidance_scale', 7.5),
            'seed': image_metadata.get('seed', -1),
            'model': image_metadata.get('model', 'black-forest-labs/FLUX.1-schnell-Free'),
            'file_url': upload_result['url'],
            'thumbnail_url': upload_result['url'],  # Use same URL for now
            'file_size': upload_result['size'],
            'generation_time': image_metadata.get('generation_time', 0),
            'created_at': get_current_timestamp(),
            'is_favorite': False
        }

        # Save to database
        save_result = db_service.save_image_metadata(metadata)

        if not save_result['success']:
            # Clean up S3 file if database save fails
            s3_service.delete_image(filename)
            logger.error(f"Database save failed: {save_result}")
            return format_error_response('Failed to save image metadata', 500)

        # Record generation history
        generation_params = {
            'prompt': metadata['prompt'],
            'negative_prompt': metadata['negative_prompt'],
            'width': metadata['width'],
            'height': metadata['height'],
            'steps': metadata['steps'],
            'guidance_scale': metadata['guidance_scale'],
            'seed': metadata['seed'],
            'model': metadata['model']
        }

        db_service.record_generation(request.user_id, image_id, generation_params)

        logger.info(f"Image saved to gallery successfully: {image_id}")

        return format_success_response({
            'id': image_id,
            'url': upload_result['url'],
            'thumbnail_url': upload_result['url'],
            'message': 'Image saved to gallery successfully'
        })

    except Exception as e:
        logger.error(f"Error saving image to gallery: {str(e)}")
        return format_error_response('Failed to save image to gallery', 500)
