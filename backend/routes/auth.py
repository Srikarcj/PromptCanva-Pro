from flask import Blueprint, request, current_app
from utils.helpers import format_success_response, format_error_response, require_auth
from services.clerk_auth import ClerkAuthService
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify authentication token"""
    try:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return format_error_response('Authorization header required', 401)
        
        # Extract token
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        
        # Verify with Clerk
        clerk_service = ClerkAuthService()
        user_data = clerk_service.verify_token(token)
        
        if not user_data:
            return format_error_response('Invalid or expired token', 401)
        
        return format_success_response({
            'user_id': user_data.get('sub'),
            'email': user_data.get('email'),
            'verified': True
        })
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return format_error_response('Token verification failed', 401)

@auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile information"""
    try:
        clerk_service = ClerkAuthService()
        profile = clerk_service.get_user_profile(request.user_id)
        
        if not profile:
            return format_error_response('User profile not found', 404)
        
        return format_success_response(profile)
        
    except Exception as e:
        logger.error(f"Profile fetch error: {str(e)}")
        return format_error_response('Failed to fetch profile', 500)

@auth_bp.route('/profile', methods=['PATCH'])
@require_auth
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        
        if not data:
            return format_error_response('Request body required', 400)
        
        # Validate allowed fields
        allowed_fields = ['first_name', 'last_name', 'username', 'profile_image_url']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return format_error_response('No valid fields to update', 400)
        
        clerk_service = ClerkAuthService()
        updated_profile = clerk_service.update_user_profile(request.user_id, update_data)
        
        if not updated_profile:
            return format_error_response('Failed to update profile', 500)
        
        return format_success_response(updated_profile, 'Profile updated successfully')
        
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        return format_error_response('Failed to update profile', 500)

@auth_bp.route('/sessions', methods=['GET'])
@require_auth
def get_sessions():
    """Get user sessions"""
    try:
        clerk_service = ClerkAuthService()
        sessions = clerk_service.get_user_sessions(request.user_id)
        
        return format_success_response(sessions)
        
    except Exception as e:
        logger.error(f"Sessions fetch error: {str(e)}")
        return format_error_response('Failed to fetch sessions', 500)

@auth_bp.route('/sessions/<session_id>', methods=['DELETE'])
@require_auth
def revoke_session(session_id):
    """Revoke a specific session"""
    try:
        clerk_service = ClerkAuthService()
        success = clerk_service.revoke_session(request.user_id, session_id)
        
        if not success:
            return format_error_response('Failed to revoke session', 500)
        
        return format_success_response(message='Session revoked successfully')
        
    except Exception as e:
        logger.error(f"Session revocation error: {str(e)}")
        return format_error_response('Failed to revoke session', 500)
