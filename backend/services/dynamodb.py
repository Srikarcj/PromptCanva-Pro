import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from flask import current_app
import logging
from datetime import datetime, timedelta
from decimal import Decimal
import json

logger = logging.getLogger(__name__)

class DynamoDBService:
    """Service for handling DynamoDB operations"""
    
    def __init__(self):
        self.region = current_app.config.get('AWS_REGION', 'us-east-1')
        self.images_table = current_app.config.get('DYNAMODB_TABLE_IMAGES')
        self.users_table = current_app.config.get('DYNAMODB_TABLE_USERS')
        self.generations_table = current_app.config.get('DYNAMODB_TABLE_GENERATIONS')
        
        if not all([self.images_table, self.users_table, self.generations_table]):
            raise ValueError("DynamoDB table names are required")
        
        try:
            self.dynamodb = boto3.resource(
                'dynamodb',
                aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=current_app.config.get('AWS_SECRET_ACCESS_KEY'),
                region_name=self.region
            )
            
            # Get table references
            self.images = self.dynamodb.Table(self.images_table)
            self.users = self.dynamodb.Table(self.users_table)
            self.generations = self.dynamodb.Table(self.generations_table)
            
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            raise ValueError("AWS credentials are required")
        except Exception as e:
            logger.error(f"DynamoDB connection error: {str(e)}")
            raise ValueError(f"DynamoDB connection failed: {str(e)}")
    
    def save_image_metadata(self, metadata):
        """Save image metadata to DynamoDB"""
        try:
            # Convert float values to Decimal for DynamoDB
            item = self._convert_floats_to_decimal(metadata)
            
            self.images.put_item(Item=item)
            
            logger.info(f"Image metadata saved: {metadata['id']}")
            
            return {'success': True}
            
        except ClientError as e:
            logger.error(f"DynamoDB save error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to save metadata: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Metadata save error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to save metadata: {str(e)}"
            }
    
    def get_image_by_id(self, image_id, user_id):
        """Get image metadata by ID"""
        try:
            response = self.images.get_item(
                Key={'id': image_id}
            )
            
            if 'Item' not in response:
                return {
                    'success': False,
                    'error': 'Image not found'
                }
            
            item = response['Item']
            
            # Check if user owns the image
            if item.get('user_id') != user_id:
                return {
                    'success': False,
                    'error': 'Image not found'
                }
            
            # Convert Decimal values back to float
            image_data = self._convert_decimals_to_float(item)
            
            return {
                'success': True,
                'data': image_data
            }
            
        except ClientError as e:
            logger.error(f"DynamoDB get error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to fetch image: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Image fetch error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to fetch image: {str(e)}"
            }
    
    def get_user_images(self, user_id, page=1, limit=20, sort='newest', filter_type='all', search=''):
        """Get user's images with pagination and filtering"""
        try:
            # Calculate pagination
            offset = (page - 1) * limit

            # Use scan instead of query since we might not have GSI set up
            filter_expression = 'user_id = :user_id'
            expression_values = {':user_id': user_id}

            # Add filter for favorites
            if filter_type == 'favorites':
                filter_expression += ' AND is_favorite = :is_favorite'
                expression_values[':is_favorite'] = True
            elif filter_type == 'recent':
                # Filter for last 7 days
                from datetime import datetime, timedelta
                week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
                filter_expression += ' AND created_at >= :week_ago'
                expression_values[':week_ago'] = week_ago

            # Add search filter
            if search:
                filter_expression += ' AND contains(prompt, :search)'
                expression_values[':search'] = search

            # Scan the table with filters
            response = self.images.scan(
                FilterExpression=filter_expression,
                ExpressionAttributeValues=expression_values,
                Limit=limit * 3  # Get more items to account for filtering
            )
            
            items = response.get('Items', [])
            
            # Apply filtering
            if filter_type == 'favorites':
                items = [item for item in items if item.get('is_favorite', False)]
            elif filter_type == 'recent':
                week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
                items = [item for item in items if item.get('created_at', '') > week_ago]
            elif filter_type == 'this-month':
                month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
                items = [item for item in items if item.get('created_at', '') > month_start]
            
            # Apply search filter
            if search:
                search_lower = search.lower()
                items = [
                    item for item in items 
                    if search_lower in item.get('prompt', '').lower()
                ]
            
            # Apply sorting
            if sort == 'oldest':
                items.sort(key=lambda x: x.get('created_at', ''))
            elif sort == 'prompt':
                items.sort(key=lambda x: x.get('prompt', '').lower())
            elif sort == 'favorites':
                items.sort(key=lambda x: (not x.get('is_favorite', False), x.get('created_at', '')), reverse=True)
            
            # Apply pagination
            total_count = len(items)
            paginated_items = items[offset:offset + limit]
            
            # Convert Decimal values
            images = [self._convert_decimals_to_float(item) for item in paginated_items]
            
            return {
                'success': True,
                'data': {
                    'images': images,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total_count,
                        'total_pages': (total_count + limit - 1) // limit
                    }
                }
            }
            
        except ClientError as e:
            logger.error(f"DynamoDB query error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to fetch images: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Images fetch error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to fetch images: {str(e)}"
            }
    
    def delete_image(self, image_id, user_id):
        """Delete image metadata"""
        try:
            # First verify the image belongs to the user
            get_result = self.get_image_by_id(image_id, user_id)
            if not get_result['success']:
                return get_result
            
            # Delete the item
            self.images.delete_item(
                Key={'id': image_id}
            )
            
            logger.info(f"Image metadata deleted: {image_id}")
            
            return {'success': True}
            
        except ClientError as e:
            logger.error(f"DynamoDB delete error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to delete image: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Image delete error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to delete image: {str(e)}"
            }
    
    def update_image_favorite(self, image_id, user_id, is_favorite):
        """Update image favorite status"""
        try:
            # First verify the image belongs to the user
            get_result = self.get_image_by_id(image_id, user_id)
            if not get_result['success']:
                return get_result
            
            # Update favorite status
            self.images.update_item(
                Key={'id': image_id},
                UpdateExpression='SET is_favorite = :is_favorite',
                ExpressionAttributeValues={':is_favorite': is_favorite}
            )
            
            logger.info(f"Image favorite status updated: {image_id} -> {is_favorite}")
            
            return {'success': True}
            
        except ClientError as e:
            logger.error(f"DynamoDB update error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to update favorite: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Favorite update error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to update favorite: {str(e)}"
            }
    
    def record_generation(self, user_id, image_id, params):
        """Record image generation in history"""
        try:
            generation_record = {
                'id': f"{user_id}#{datetime.utcnow().isoformat()}",
                'user_id': user_id,
                'image_id': image_id,
                'prompt': params['prompt'],
                'parameters': self._convert_floats_to_decimal(params),
                'created_at': datetime.utcnow().isoformat()
            }
            
            self.generations.put_item(Item=generation_record)
            
            return {'success': True}
            
        except Exception as e:
            logger.error(f"Generation record error: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_user_generation_history(self, user_id, page=1, limit=20):
        """Get user's generation history with pagination"""
        try:
            # Calculate pagination
            offset = (page - 1) * limit

            # Use scan instead of query since we might not have GSI set up
            response = self.generations.scan(
                FilterExpression='user_id = :user_id',
                ExpressionAttributeValues={':user_id': user_id},
                Limit=limit * 2  # Get more items to account for filtering
            )

            items = response.get('Items', [])

            # Sort by created_at (newest first)
            items.sort(key=lambda x: x.get('created_at', ''), reverse=True)

            # Apply offset and limit
            paginated_items = items[offset:offset + limit]

            # Convert Decimal to float for JSON serialization
            history = []
            for item in paginated_items:
                history_item = self._convert_decimals_to_float(item)
                history.append(history_item)

            # Calculate pagination info
            total_count = len(items)
            has_more = len(items) > offset + limit

            return {
                'success': True,
                'data': {
                    'history': history,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total_count,
                        'has_more': has_more,
                        'total_pages': (total_count + limit - 1) // limit
                    }
                }
            }

        except ClientError as e:
            logger.error(f"DynamoDB query error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to fetch generation history: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Generation history fetch error: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to fetch generation history: {str(e)}"
            }
    
    def get_user_daily_generation_count(self, user_id):
        """Get user's generation count for today"""
        try:
            today = datetime.utcnow().date().isoformat()
            
            response = self.generations.query(
                IndexName='user-id-created-at-index',
                KeyConditionExpression='user_id = :user_id AND begins_with(created_at, :today)',
                ExpressionAttributeValues={
                    ':user_id': user_id,
                    ':today': today
                }
            )
            
            return len(response.get('Items', []))
            
        except Exception as e:
            logger.error(f"Daily count error: {str(e)}")
            return 0
    
    def _convert_floats_to_decimal(self, obj):
        """Convert float values to Decimal for DynamoDB"""
        if isinstance(obj, dict):
            return {k: self._convert_floats_to_decimal(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_floats_to_decimal(v) for v in obj]
        elif isinstance(obj, float):
            return Decimal(str(obj))
        else:
            return obj
    
    def _convert_decimals_to_float(self, obj):
        """Convert Decimal values back to float"""
        if isinstance(obj, dict):
            return {k: self._convert_decimals_to_float(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_decimals_to_float(v) for v in obj]
        elif isinstance(obj, Decimal):
            return float(obj)
        else:
            return obj

    def get_all_images_admin(self):
        """Get all images from all users for admin panel"""
        try:
            # Scan the entire images table (admin only)
            response = self.images.scan()

            images = []
            for item in response['Items']:
                # Convert DynamoDB item to standard format
                image_data = {
                    'id': item.get('id', ''),
                    'user_id': item.get('user_id', ''),
                    'user_email': item.get('user_email', f"{item.get('user_id', 'unknown')}@user.com"),
                    'prompt': item.get('prompt', ''),
                    'width': int(item.get('width', 1024)),
                    'height': int(item.get('height', 1024)),
                    'model': item.get('model', 'FLUX.1-schnell'),
                    'created_at': item.get('created_at', item.get('timestamp', '')),
                    'file_url': item.get('file_url', item.get('url', '')),
                    'thumbnail_url': item.get('thumbnail_url', item.get('url', '')),
                    'is_favorite': item.get('is_favorite', False),
                    'file_size_mb': float(item.get('file_size', 0)) / (1024 * 1024) if item.get('file_size') else 2.0,
                    'success': True
                }
                images.append(image_data)

            # Handle pagination for large datasets
            while 'LastEvaluatedKey' in response:
                response = self.images.scan(
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                for item in response['Items']:
                    image_data = {
                        'id': item.get('id', ''),
                        'user_id': item.get('user_id', ''),
                        'user_email': item.get('user_email', f"{item.get('user_id', 'unknown')}@user.com"),
                        'prompt': item.get('prompt', ''),
                        'width': int(item.get('width', 1024)),
                        'height': int(item.get('height', 1024)),
                        'model': item.get('model', 'FLUX.1-schnell'),
                        'created_at': item.get('created_at', item.get('timestamp', '')),
                        'file_url': item.get('file_url', item.get('url', '')),
                        'thumbnail_url': item.get('thumbnail_url', item.get('url', '')),
                        'is_favorite': item.get('is_favorite', False),
                        'file_size_mb': float(item.get('file_size', 0)) / (1024 * 1024) if item.get('file_size') else 2.0,
                        'success': True
                    }
                    images.append(image_data)

            logger.info(f"Retrieved {len(images)} images for admin panel")
            return images

        except ClientError as e:
            logger.error(f"DynamoDB admin images scan error: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Admin images retrieval error: {str(e)}")
            return []
