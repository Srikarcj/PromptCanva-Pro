from flask import Blueprint, request
from utils.helpers import format_success_response, format_error_response, require_auth
from services.dynamodb import DynamoDBService
import logging

gallery_bp = Blueprint('gallery', __name__)
logger = logging.getLogger(__name__)

@gallery_bp.route('', methods=['GET'])
@require_auth
def get_gallery():
    """Get user's gallery with advanced filtering and sorting"""
    try:
        # Parse query parameters
        page = int(request.args.get('page', 1))
        limit = min(50, int(request.args.get('limit', 20)))
        sort = request.args.get('sort', 'newest')
        filter_type = request.args.get('filter', 'all')
        search = request.args.get('search', '').strip()
        
        try:
            db_service = DynamoDBService()

            # Get images from database
            result = db_service.get_user_images(
                user_id=request.user_id,
                page=page,
                limit=limit,
                sort=sort,
                filter_type=filter_type,
                search=search
            )

            if result['success']:
                # Add gallery-specific metadata
                gallery_data = result['data']
                gallery_data['filters'] = {
                    'current_filter': filter_type,
                    'current_sort': sort,
                    'search_query': search
                }

                return format_success_response(gallery_data)
            else:
                raise Exception(result.get('error', 'Database query failed'))

        except Exception as db_error:
            logger.warning(f"Database unavailable, returning empty gallery: {str(db_error)}")

            # Return empty gallery when database is unavailable
            empty_data = {
                'images': [],
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': 0,
                    'has_more': False,
                    'total_pages': 0
                },
                'filters': {
                    'current_filter': filter_type,
                    'current_sort': sort,
                    'search_query': search
                }
            }

            return format_success_response(empty_data)
        
    except ValueError as e:
        return format_error_response(f"Invalid parameters: {str(e)}", 400)
    except Exception as e:
        logger.error(f"Error fetching gallery: {str(e)}")
        return format_error_response('Failed to fetch gallery', 500)

@gallery_bp.route('/favorites', methods=['GET'])
@require_auth
def get_favorites():
    """Get user's favorite images"""
    try:
        page = int(request.args.get('page', 1))
        limit = min(50, int(request.args.get('limit', 20)))
        
        try:
            db_service = DynamoDBService()

            result = db_service.get_user_images(
                user_id=request.user_id,
                page=page,
                limit=limit,
                sort='newest',
                filter_type='favorites'
            )

            if result['success']:
                return format_success_response(result['data'])
            else:
                raise Exception(result.get('error', 'Database query failed'))

        except Exception as db_error:
            logger.warning(f"Database unavailable, returning empty favorites: {str(db_error)}")

            # Return empty favorites when database is unavailable
            empty_data = {
                'images': [],
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
        logger.error(f"Error fetching favorites: {str(e)}")
        return format_error_response('Failed to fetch favorites', 500)

@gallery_bp.route('/recent', methods=['GET'])
@require_auth
def get_recent():
    """Get user's recent images (last 7 days)"""
    try:
        page = int(request.args.get('page', 1))
        limit = min(50, int(request.args.get('limit', 20)))
        
        db_service = DynamoDBService()
        
        result = db_service.get_user_images(
            user_id=request.user_id,
            page=page,
            limit=limit,
            sort='newest',
            filter_type='recent'
        )
        
        if not result['success']:
            return format_error_response(result['error'], 500)
        
        return format_success_response(result['data'])
        
    except ValueError as e:
        return format_error_response(f"Invalid parameters: {str(e)}", 400)
    except Exception as e:
        logger.error(f"Error fetching recent images: {str(e)}")
        return format_error_response('Failed to fetch recent images', 500)

@gallery_bp.route('/search', methods=['GET'])
@require_auth
def search_gallery():
    """Search user's gallery by prompt"""
    try:
        query = request.args.get('q', '').strip()
        page = int(request.args.get('page', 1))
        limit = min(50, int(request.args.get('limit', 20)))
        
        if not query:
            return format_error_response('Search query is required', 400)
        
        if len(query) < 2:
            return format_error_response('Search query must be at least 2 characters', 400)
        
        db_service = DynamoDBService()
        
        result = db_service.get_user_images(
            user_id=request.user_id,
            page=page,
            limit=limit,
            sort='newest',
            filter_type='all',
            search=query
        )
        
        if not result['success']:
            return format_error_response(result['error'], 500)
        
        # Add search metadata
        search_data = result['data']
        search_data['search'] = {
            'query': query,
            'results_count': len(search_data['images'])
        }
        
        return format_success_response(search_data)
        
    except ValueError as e:
        return format_error_response(f"Invalid parameters: {str(e)}", 400)
    except Exception as e:
        logger.error(f"Error searching gallery: {str(e)}")
        return format_error_response('Failed to search gallery', 500)
