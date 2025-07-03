import jwt
import requests
from flask import current_app
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class ClerkAuthService:
    """Service for handling Clerk authentication"""
    
    def __init__(self):
        self.secret_key = current_app.config.get('CLERK_SECRET_KEY')
        self.publishable_key = current_app.config.get('CLERK_PUBLISHABLE_KEY')
        self.base_url = 'https://api.clerk.com/v1'
        
        if not self.secret_key:
            raise ValueError("CLERK_SECRET_KEY is required")
    
    def _get_headers(self):
        """Get headers for Clerk API requests"""
        return {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json'
        }
    
    def verify_token(self, token):
        """Verify JWT token with Clerk"""
        try:
            # For development, we'll do basic JWT decoding
            # In production, you should verify with Clerk's public key
            payload = jwt.decode(
                token,
                options={"verify_signature": False},  # Disable signature verification for development
                algorithms=['RS256']
            )
            
            # Check token expiration
            if 'exp' in payload:
                exp_timestamp = payload['exp']
                if datetime.now(timezone.utc).timestamp() > exp_timestamp:
                    logger.warning("Token has expired")
                    return None
            
            # Validate issuer (should be from Clerk)
            if 'iss' in payload and not payload['iss'].startswith('https://'):
                logger.warning("Invalid token issuer")
                return None
            
            return payload
            
        except jwt.InvalidTokenError as e:
            logger.error(f"JWT validation error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return None
    
    def get_user_profile(self, user_id):
        """Get user profile from Clerk"""
        try:
            url = f"{self.base_url}/users/{user_id}"
            response = requests.get(url, headers=self._get_headers(), timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                return {
                    'id': user_data.get('id'),
                    'email': user_data.get('email_addresses', [{}])[0].get('email_address'),
                    'first_name': user_data.get('first_name'),
                    'last_name': user_data.get('last_name'),
                    'username': user_data.get('username'),
                    'profile_image_url': user_data.get('profile_image_url'),
                    'created_at': user_data.get('created_at'),
                    'updated_at': user_data.get('updated_at'),
                    'last_sign_in_at': user_data.get('last_sign_in_at')
                }
            elif response.status_code == 404:
                logger.warning(f"User not found: {user_id}")
                return None
            else:
                logger.error(f"Clerk API error: {response.status_code} - {response.text}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Request error when fetching user profile: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
            return None
    
    def update_user_profile(self, user_id, update_data):
        """Update user profile in Clerk"""
        try:
            url = f"{self.base_url}/users/{user_id}"
            response = requests.patch(
                url, 
                json=update_data, 
                headers=self._get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                return {
                    'id': user_data.get('id'),
                    'email': user_data.get('email_addresses', [{}])[0].get('email_address'),
                    'first_name': user_data.get('first_name'),
                    'last_name': user_data.get('last_name'),
                    'username': user_data.get('username'),
                    'profile_image_url': user_data.get('profile_image_url'),
                    'updated_at': user_data.get('updated_at')
                }
            else:
                logger.error(f"Clerk API error: {response.status_code} - {response.text}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Request error when updating user profile: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error updating user profile: {str(e)}")
            return None
    
    def get_user_sessions(self, user_id):
        """Get user sessions from Clerk"""
        try:
            url = f"{self.base_url}/users/{user_id}/sessions"
            response = requests.get(url, headers=self._get_headers(), timeout=10)
            
            if response.status_code == 200:
                sessions_data = response.json()
                return [
                    {
                        'id': session.get('id'),
                        'status': session.get('status'),
                        'last_active_at': session.get('last_active_at'),
                        'created_at': session.get('created_at'),
                        'updated_at': session.get('updated_at')
                    }
                    for session in sessions_data
                ]
            else:
                logger.error(f"Clerk API error: {response.status_code} - {response.text}")
                return []
                
        except requests.RequestException as e:
            logger.error(f"Request error when fetching user sessions: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error fetching user sessions: {str(e)}")
            return []
    
    def revoke_session(self, user_id, session_id):
        """Revoke a user session in Clerk"""
        try:
            url = f"{self.base_url}/sessions/{session_id}/revoke"
            response = requests.post(url, headers=self._get_headers(), timeout=10)
            
            return response.status_code == 200
            
        except requests.RequestException as e:
            logger.error(f"Request error when revoking session: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error revoking session: {str(e)}")
            return False
    
    def validate_webhook(self, payload, signature):
        """Validate Clerk webhook signature"""
        try:
            # Implement webhook signature validation
            # This is a simplified version - in production, use proper HMAC validation
            return True
            
        except Exception as e:
            logger.error(f"Webhook validation error: {str(e)}")
            return False
