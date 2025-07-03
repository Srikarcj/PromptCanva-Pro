import requests
import base64
import io
from PIL import Image
from flask import current_app
import logging
from datetime import datetime
import time

logger = logging.getLogger(__name__)

class TogetherAIService:
    """Service for interacting with Together AI API"""
    
    def __init__(self):
        self.api_key = current_app.config.get('TOGETHER_AI_API_KEY')
        self.base_url = current_app.config.get('TOGETHER_AI_BASE_URL', 'https://api.together.xyz')
        self.model_name = current_app.config.get('FLUX_MODEL_NAME', 'black-forest-labs/FLUX.1-schnell-Free')
        
        if not self.api_key:
            raise ValueError("TOGETHER_AI_API_KEY is required")
    
    def _get_headers(self):
        """Get headers for Together AI API requests"""
        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def generate_image(self, prompt, **kwargs):
        """Generate image using Together AI Flux model"""
        try:
            # Prepare request payload
            payload = {
                'model': self.model_name,
                'prompt': prompt,
                'width': kwargs.get('width', 1024),
                'height': kwargs.get('height', 1024),
                'steps': kwargs.get('steps', 4),
                'n': 1,  # Number of images to generate
                'response_format': 'b64_json'  # Return base64 encoded image
            }
            
            # Add optional parameters
            if kwargs.get('negative_prompt'):
                payload['negative_prompt'] = kwargs['negative_prompt']
            
            if kwargs.get('guidance_scale'):
                payload['guidance_scale'] = kwargs['guidance_scale']
            
            if kwargs.get('seed') and kwargs['seed'] != -1:
                payload['seed'] = kwargs['seed']
            
            logger.info(f"Generating image with prompt: {prompt[:100]}...")
            start_time = time.time()
            
            # Make API request
            response = requests.post(
                f"{self.base_url}/v1/images/generations",
                json=payload,
                headers=self._get_headers(),
                timeout=60  # 60 seconds timeout for image generation
            )
            
            generation_time = time.time() - start_time
            logger.info(f"Image generation completed in {generation_time:.2f} seconds")
            
            if response.status_code == 200:
                result = response.json()
                
                if 'data' in result and len(result['data']) > 0:
                    image_data = result['data'][0]
                    
                    # Decode base64 image
                    image_b64 = image_data.get('b64_json')
                    if not image_b64:
                        raise ValueError("No image data in response")
                    
                    image_bytes = base64.b64decode(image_b64)
                    
                    # Validate image
                    try:
                        image = Image.open(io.BytesIO(image_bytes))
                        image.verify()  # Verify it's a valid image
                    except Exception as e:
                        raise ValueError(f"Invalid image data: {str(e)}")
                    
                    return {
                        'success': True,
                        'image_data': image_bytes,
                        'metadata': {
                            'prompt': prompt,
                            'negative_prompt': kwargs.get('negative_prompt'),
                            'width': payload['width'],
                            'height': payload['height'],
                            'steps': payload['steps'],
                            'guidance_scale': kwargs.get('guidance_scale'),
                            'seed': kwargs.get('seed'),
                            'model': self.model_name,
                            'generation_time': generation_time,
                            'created_at': datetime.utcnow().isoformat()
                        }
                    }
                else:
                    raise ValueError("No image data in API response")
            
            elif response.status_code == 400:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Bad request')
                logger.error(f"Together AI API error (400): {error_message}")
                return {
                    'success': False,
                    'error': f"Invalid request: {error_message}"
                }
            
            elif response.status_code == 401:
                logger.error("Together AI API authentication failed")
                return {
                    'success': False,
                    'error': "Authentication failed. Please check your API key."
                }
            
            elif response.status_code == 429:
                logger.error("Together AI API rate limit exceeded")
                return {
                    'success': False,
                    'error': "Rate limit exceeded. Please try again later."
                }
            
            elif response.status_code == 500:
                logger.error("Together AI API server error")
                return {
                    'success': False,
                    'error': "Server error. Please try again later."
                }
            
            else:
                logger.error(f"Together AI API error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f"API error: {response.status_code}"
                }
                
        except requests.exceptions.Timeout:
            logger.error("Together AI API request timed out")
            return {
                'success': False,
                'error': "Request timed out. Please try again."
            }
        
        except requests.exceptions.ConnectionError:
            logger.error("Together AI API connection error")
            return {
                'success': False,
                'error': "Connection error. Please check your internet connection."
            }
        
        except Exception as e:
            logger.error(f"Image generation error: {str(e)}")
            return {
                'success': False,
                'error': f"Generation failed: {str(e)}"
            }
    
    def get_model_info(self):
        """Get information about the Flux model"""
        try:
            response = requests.get(
                f"{self.base_url}/v1/models/{self.model_name}",
                headers=self._get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get model info: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting model info: {str(e)}")
            return None
    
    def validate_parameters(self, **kwargs):
        """Validate generation parameters"""
        errors = []
        
        # Validate dimensions
        width = kwargs.get('width', 1024)
        height = kwargs.get('height', 1024)
        
        if not isinstance(width, int) or width < 256 or width > 2048:
            errors.append("Width must be between 256 and 2048 pixels")
        
        if not isinstance(height, int) or height < 256 or height > 2048:
            errors.append("Height must be between 256 and 2048 pixels")
        
        # Validate steps
        steps = kwargs.get('steps', 4)
        if not isinstance(steps, int) or steps < 1 or steps > 50:
            errors.append("Steps must be between 1 and 50")
        
        # Validate guidance scale
        guidance_scale = kwargs.get('guidance_scale')
        if guidance_scale is not None:
            if not isinstance(guidance_scale, (int, float)) or guidance_scale < 1 or guidance_scale > 20:
                errors.append("Guidance scale must be between 1 and 20")
        
        # Validate seed
        seed = kwargs.get('seed')
        if seed is not None and seed != -1:
            if not isinstance(seed, int) or seed < 0 or seed > 2147483647:
                errors.append("Seed must be between 0 and 2147483647, or -1 for random")
        
        return errors
    
    def estimate_generation_time(self, **kwargs):
        """Estimate generation time based on parameters"""
        base_time = 3.0  # Base time in seconds
        
        # Adjust for resolution
        width = kwargs.get('width', 1024)
        height = kwargs.get('height', 1024)
        pixel_count = width * height
        resolution_factor = pixel_count / (1024 * 1024)  # Normalize to 1024x1024
        
        # Adjust for steps
        steps = kwargs.get('steps', 4)
        steps_factor = steps / 4  # Normalize to 4 steps
        
        estimated_time = base_time * resolution_factor * steps_factor
        
        return max(2.0, min(30.0, estimated_time))  # Clamp between 2-30 seconds
