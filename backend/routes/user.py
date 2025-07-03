from flask import Blueprint, request
from utils.helpers import format_success_response, format_error_response, require_auth
from services.dynamodb import DynamoDBService
from services.s3_service import S3Service
from datetime import datetime
import logging

user_bp = Blueprint('user', __name__)
logger = logging.getLogger(__name__)

@user_bp.route('/stats', methods=['GET'])
@require_auth
def get_user_stats():
    """Get user statistics - Always return fresh zero stats for local storage based system"""
    try:
        logger.info(f"Stats requested for user: {request.user_id}")

        # Always return fresh zero stats since we're using local storage
        # The frontend will manage all stats locally
        stats = {
            'total_images': 0,
            'favorites_count': 0,
            'this_month_count': 0,
            'this_week_count': 0,
            'daily_generations_used': 0,
            'storage_usage': {
                'total_size_bytes': 0,
                'total_size_mb': 0,
                'object_count': 0
            },
            'last_updated': None,
            'source': 'backend_fresh'
        }

        logger.info(f"Returning fresh zero stats for user: {request.user_id}")
        return format_success_response(stats)

    except Exception as e:
        logger.error(f"Error in stats endpoint: {str(e)}")
        return format_error_response('Failed to fetch user stats', 500)

@user_bp.route('/stats', methods=['POST'])
@require_auth
def update_user_stats():
    """Update user statistics - Accept stats from frontend but don't store them"""
    try:
        data = request.get_json()
        logger.info(f"Stats update received for user {request.user_id}: {data}")

        # Just acknowledge the update but don't store anything
        # All stats are managed locally in the frontend
        return format_success_response({
            'message': 'Stats acknowledged',
            'user_id': request.user_id,
            'timestamp': datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.error(f"Error in stats update: {str(e)}")
        return format_error_response('Failed to update stats', 500)

@user_bp.route('/settings', methods=['GET'])
@require_auth
def get_user_settings():
    """Get user settings"""
    try:
        # For now, return default settings
        # In a real app, you'd store these in DynamoDB
        default_settings = {
            'default_resolution': '1024x1024',
            'default_steps': 4,
            'default_guidance_scale': 7.5,
            'auto_save_to_gallery': True,
            'email_notifications': True,
            'public_gallery': False,
            'theme': 'light'
        }
        
        return format_success_response(default_settings)
        
    except Exception as e:
        logger.error(f"Error fetching user settings: {str(e)}")
        return format_error_response('Failed to fetch user settings', 500)

@user_bp.route('/settings', methods=['PATCH'])
@require_auth
def update_user_settings():
    """Update user settings"""
    try:
        data = request.get_json()
        
        if not data:
            return format_error_response('Request body required', 400)
        
        # Validate settings
        allowed_settings = [
            'default_resolution',
            'default_steps',
            'default_guidance_scale',
            'auto_save_to_gallery',
            'email_notifications',
            'public_gallery',
            'theme'
        ]
        
        settings_update = {k: v for k, v in data.items() if k in allowed_settings}
        
        if not settings_update:
            return format_error_response('No valid settings to update', 400)
        
        # TODO: Save settings to DynamoDB
        # For now, just return the updated settings
        
        return format_success_response(settings_update, 'Settings updated successfully')

    except Exception as e:
        logger.error(f"Error updating user settings: {str(e)}")
        return format_error_response('Failed to update user settings', 500)

@user_bp.route('/history', methods=['GET'])
@require_auth
def get_user_history():
    """Get user's generation history"""
    try:
        page = int(request.args.get('page', 1))
        limit = min(50, int(request.args.get('limit', 20)))

        try:
            db_service = DynamoDBService()

            # Get generation history from database
            result = db_service.get_user_generation_history(
                user_id=request.user_id,
                page=page,
                limit=limit
            )

            if result['success']:
                return format_success_response(result['data'])
            else:
                raise Exception(result.get('error', 'Database query failed'))

        except Exception as db_error:
            logger.warning(f"Database unavailable, returning empty history: {str(db_error)}")

            # Return empty history when database is unavailable
            empty_data = {
                'history': [],
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': 0,
                    'has_more': False,
                    'total_pages': 0
                }
            }

            return format_success_response(empty_data)

    except ValueError as e:
        return format_error_response(f"Invalid parameters: {str(e)}", 400)
    except Exception as e:
        logger.error(f"Error fetching user history: {str(e)}")
        return format_error_response('Failed to fetch user history', 500)
