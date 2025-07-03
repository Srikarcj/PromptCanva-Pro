import logging
import uuid
import hashlib
import base64
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify, current_app
import jwt
from PIL import Image
import io
import os

def setup_logging(name_or_app):
    """Setup application logging"""
    try:
        # Always treat as module name for simplicity
        module_name = name_or_app if isinstance(name_or_app, str) else 'app'

        # Use environment variables for configuration
        log_level = getattr(logging, os.getenv('LOG_LEVEL', 'INFO'))
        log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

        # Configure logging
        logging.basicConfig(
            level=log_level,
            format=log_format,
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler('app.log') if not os.getenv('TESTING') else logging.NullHandler()
            ]
        )

        # Set specific loggers to reduce noise
        logging.getLogger('werkzeug').setLevel(logging.WARNING)
        logging.getLogger('boto3').setLevel(logging.WARNING)
        logging.getLogger('botocore').setLevel(logging.WARNING)

        return logging.getLogger(module_name)

    except Exception as e:
        # Fallback logging setup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[logging.StreamHandler()]
        )
        logger = logging.getLogger(name_or_app if isinstance(name_or_app, str) else 'app')
        logger.warning(f"Logging setup failed, using fallback: {e}")
        return logger

def generate_uuid():
    """Generate a unique UUID"""
    return str(uuid.uuid4())

def generate_filename(original_filename, user_id):
    """Generate a unique filename for uploaded files"""
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    file_extension = os.path.splitext(original_filename)[1]
    unique_id = str(uuid.uuid4())[:8]
    return f"{user_id}_{timestamp}_{unique_id}{file_extension}"

def hash_string(text):
    """Generate SHA256 hash of a string"""
    return hashlib.sha256(text.encode()).hexdigest()

def validate_image_file(file_data):
    """Validate image file format and size"""
    try:
        image = Image.open(io.BytesIO(file_data))
        
        # Check format
        if image.format not in ['JPEG', 'PNG', 'WEBP']:
            return False, "Unsupported image format. Please use JPEG, PNG, or WEBP."
        
        # Check size (max 10MB)
        if len(file_data) > 10 * 1024 * 1024:
            return False, "Image file too large. Maximum size is 10MB."
        
        # Check dimensions (max 4096x4096)
        if image.width > 4096 or image.height > 4096:
            return False, "Image dimensions too large. Maximum size is 4096x4096 pixels."
        
        return True, None
        
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"

def resize_image(image_data, max_width=1024, max_height=1024, quality=85):
    """Resize image while maintaining aspect ratio"""
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # Calculate new dimensions
        ratio = min(max_width / image.width, max_height / image.height)
        if ratio < 1:
            new_width = int(image.width * ratio)
            new_height = int(image.height * ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Save to bytes
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=quality, optimize=True)
        return output.getvalue()
        
    except Exception as e:
        raise ValueError(f"Failed to resize image: {str(e)}")

def validate_prompt(prompt, max_length=500):
    """Validate image generation prompt"""
    if not prompt or not prompt.strip():
        return False, "Prompt is required"
    
    if len(prompt) > max_length:
        return False, f"Prompt must be {max_length} characters or less"
    
    # Check for potentially harmful content (basic filter)
    harmful_keywords = ['violence', 'explicit', 'nsfw', 'gore', 'hate']
    prompt_lower = prompt.lower()
    for keyword in harmful_keywords:
        if keyword in prompt_lower:
            return False, f"Prompt contains inappropriate content: {keyword}"
    
    return True, None

def format_error_response(message, status_code=400, details=None):
    """Format standardized error response"""
    response = {
        'error': True,
        'message': message,
        'status_code': status_code,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if details:
        response['details'] = details
    
    return jsonify(response), status_code

def format_success_response(data=None, message=None, status_code=200):
    """Format standardized success response"""
    response = {
        'success': True,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if message:
        response['message'] = message
    
    if data is not None:
        response['data'] = data
    
    return jsonify(response), status_code

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # For development, allow bypass with any token or use demo user
        if current_app.config.get('DEBUG', False):
            auth_header = request.headers.get('Authorization')

            current_app.logger.info(f"AUTH: Auth check for path: {request.path}")
            current_app.logger.info(f"AUTH: Auth header present: {bool(auth_header)}")

            if auth_header:
                try:
                    # Extract token from "Bearer <token>"
                    token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header

                    # Try to decode without verification for development
                    payload = jwt.decode(
                        token,
                        options={"verify_signature": False}
                    )

                    # Add user info to request context
                    jwt_user_id = payload.get('sub', 'demo-user-123')
                    jwt_user_email = payload.get('email', 'demo@example.com')

                    # Special case: If accessing admin panel and JWT has demo email, use admin email instead
                    if request.path.startswith('/admin') and jwt_user_email == 'demo@example.com':
                        # Use hardcoded admin email to avoid import issues
                        admin_email = 'srikarboina9999@gmail.com'
                        request.user_id = 'admin-user'
                        request.user_email = admin_email
                        current_app.logger.info(f"ADMIN: Admin panel access with demo token - using admin email: {admin_email}")
                    else:
                        request.user_id = jwt_user_id
                        request.user_email = jwt_user_email
                        current_app.logger.info(f"AUTH: JWT authenticated user: {request.user_email}")

                except Exception as e:
                    # If token decode fails, check if admin panel access
                    current_app.logger.warning(f"Token decode failed: {str(e)}")
                    if request.path.startswith('/admin'):
                        # For admin panel access, use the admin email
                        admin_email = 'srikarboina9999@gmail.com'
                        request.user_id = 'admin-user'
                        request.user_email = admin_email
                        current_app.logger.info(f"ADMIN: JWT failed but admin panel access - using admin email: {admin_email}")
                    else:
                        # For other endpoints, use demo user for development
                        request.user_id = 'demo-user-123'
                        request.user_email = 'demo@example.com'
                        current_app.logger.info(f"AUTH: JWT failed - using demo user")
            else:
                # No auth header - check if this is admin accessing admin panel
                current_app.logger.info(f"AUTH: No auth header - checking path: {request.path}")
                if request.path.startswith('/admin'):
                    # For admin panel access, use the admin email
                    admin_email = 'srikarboina9999@gmail.com'
                    request.user_id = 'admin-user'
                    request.user_email = admin_email
                    current_app.logger.info(f"ADMIN: Admin panel access detected - using admin email: {admin_email}")
                else:
                    # For other endpoints, use demo user for development
                    request.user_id = 'demo-user-123'
                    request.user_email = 'demo@example.com'
                    current_app.logger.info(f"AUTH: Non-admin path - using demo user")
        else:
            # Production authentication
            auth_header = request.headers.get('Authorization')

            if not auth_header:
                return format_error_response('Authorization header required', 401)

            try:
                # Extract token from "Bearer <token>"
                token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header

                # Verify JWT token with Clerk (proper verification needed in production)
                payload = jwt.decode(
                    token,
                    options={"verify_signature": False}  # TODO: Implement proper Clerk verification
                )

                # Add user info to request context
                request.user_id = payload.get('sub')
                request.user_email = payload.get('email')

            except jwt.InvalidTokenError:
                return format_error_response('Invalid token', 401)
            except Exception as e:
                current_app.logger.error(f"Auth error: {str(e)}")
                return format_error_response('Authentication failed', 401)

        return f(*args, **kwargs)

    return decorated_function

def rate_limit_key():
    """Generate rate limit key based on user or IP"""
    if hasattr(request, 'user_id') and request.user_id:
        return f"user:{request.user_id}"
    return f"ip:{request.remote_addr}"

def parse_resolution(resolution_string):
    """Parse resolution string like '1024x768' into width and height"""
    try:
        width, height = map(int, resolution_string.split('x'))
        return width, height
    except (ValueError, AttributeError):
        return None, None

def validate_resolution(width, height, supported_resolutions):
    """Validate if resolution is supported"""
    resolution_string = f"{width}x{height}"
    return resolution_string in supported_resolutions

def get_file_size_mb(file_size_bytes):
    """Convert file size from bytes to MB"""
    return round(file_size_bytes / (1024 * 1024), 2)

def sanitize_filename(filename):
    """Sanitize filename for safe storage"""
    # Remove or replace unsafe characters
    unsafe_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
    for char in unsafe_chars:
        filename = filename.replace(char, '_')
    
    # Limit length
    name, ext = os.path.splitext(filename)
    if len(name) > 100:
        name = name[:100]
    
    return name + ext

def encode_base64(data):
    """Encode data to base64 string"""
    return base64.b64encode(data).decode('utf-8')

def decode_base64(data_string):
    """Decode base64 string to bytes"""
    return base64.b64decode(data_string)

def get_current_timestamp():
    """Get current UTC timestamp"""
    return datetime.now(timezone.utc).isoformat()

def parse_timestamp(timestamp_string):
    """Parse ISO timestamp string to datetime object"""
    return datetime.fromisoformat(timestamp_string.replace('Z', '+00:00'))

def calculate_image_hash(image_data):
    """Calculate hash of image data for deduplication"""
    return hashlib.md5(image_data).hexdigest()

def validate_pagination(page, limit, max_limit=100):
    """Validate pagination parameters"""
    try:
        page = max(1, int(page or 1))
        limit = min(max_limit, max(1, int(limit or 20)))
        return page, limit
    except (ValueError, TypeError):
        return 1, 20

def calculate_pagination_offset(page, limit):
    """Calculate offset for pagination"""
    return (page - 1) * limit
