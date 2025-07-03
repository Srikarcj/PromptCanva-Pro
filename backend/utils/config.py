import os
from datetime import timedelta

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    TESTING = False
    
    # CORS settings
    CORS_ORIGINS = [origin.strip() for origin in os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:5177').split(',')]
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = os.getenv('REDIS_URL', 'memory://')
    
    # Clerk authentication
    CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY')
    CLERK_PUBLISHABLE_KEY = os.getenv('CLERK_PUBLISHABLE_KEY')
    
    # Together AI configuration
    TOGETHER_AI_API_KEY = os.getenv('TOGETHER_AI_API_KEY')
    TOGETHER_AI_BASE_URL = os.getenv('TOGETHER_AI_BASE_URL', 'https://api.together.xyz')
    FLUX_MODEL_NAME = os.getenv('FLUX_MODEL_NAME', 'black-forest-labs/FLUX.1-schnell-Free')
    
    # AWS configuration
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
    
    # S3 configuration
    S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
    S3_BUCKET_REGION = os.getenv('S3_BUCKET_REGION', 'us-east-1')
    S3_PUBLIC_URL_PREFIX = os.getenv('S3_PUBLIC_URL_PREFIX')
    
    # DynamoDB configuration
    DYNAMODB_TABLE_USERS = os.getenv('DYNAMODB_TABLE_USERS', 'promptcanvaspro-users')
    DYNAMODB_TABLE_IMAGES = os.getenv('DYNAMODB_TABLE_IMAGES', 'promptcanvaspro-images')
    DYNAMODB_TABLE_GENERATIONS = os.getenv('DYNAMODB_TABLE_GENERATIONS', 'promptcanvaspro-generations')
    
    # File upload settings
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    
    # Image generation settings
    MAX_PROMPT_LENGTH = int(os.getenv('MAX_PROMPT_LENGTH', 500))
    DEFAULT_IMAGE_WIDTH = int(os.getenv('DEFAULT_IMAGE_WIDTH', 1024))
    DEFAULT_IMAGE_HEIGHT = int(os.getenv('DEFAULT_IMAGE_HEIGHT', 1024))
    SUPPORTED_RESOLUTIONS = os.getenv('SUPPORTED_RESOLUTIONS', '512x512,1024x1024,1024x768,768x1024').split(',')
    MAX_IMAGES_PER_USER = int(os.getenv('MAX_IMAGES_PER_USER', 100))
    MAX_GENERATIONS_PER_DAY = int(os.getenv('MAX_GENERATIONS_PER_DAY', 5))
    
    # Logging configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = os.getenv('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Cache configuration
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', 300))
    
    # Production settings
    PRODUCTION_MODE = os.getenv('PRODUCTION_MODE', 'False').lower() == 'true'
    
    @classmethod
    def validate_config(cls):
        """Validate required configuration"""
        required_vars = [
            'CLERK_SECRET_KEY',
            'TOGETHER_AI_API_KEY',
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'S3_BUCKET_NAME'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    # Use in-memory storage for testing
    RATELIMIT_STORAGE_URL = 'memory://'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Use Redis for rate limiting in production
    RATELIMIT_STORAGE_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
