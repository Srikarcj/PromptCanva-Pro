import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from flask import current_app
import logging
from datetime import datetime, timedelta
import io
from PIL import Image

logger = logging.getLogger(__name__)

class S3Service:
    """Service for handling AWS S3 operations"""
    
    def __init__(self):
        self.bucket_name = current_app.config.get('S3_BUCKET_NAME')
        self.region = current_app.config.get('S3_BUCKET_REGION', 'us-east-1')
        
        if not self.bucket_name:
            raise ValueError("S3_BUCKET_NAME is required")
        
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=current_app.config.get('AWS_SECRET_ACCESS_KEY'),
                region_name=self.region
            )
            
            # Test connection
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            raise ValueError("AWS credentials are required")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                logger.error(f"S3 bucket '{self.bucket_name}' not found")
                raise ValueError(f"S3 bucket '{self.bucket_name}' not found")
            else:
                logger.error(f"S3 connection error: {str(e)}")
                raise ValueError(f"S3 connection failed: {str(e)}")
    
    def upload_image(self, image_data, filename, content_type='image/png'):
        """Upload image to S3"""
        try:
            # Create file-like object from image data
            image_file = io.BytesIO(image_data)
            
            # Upload to S3
            self.s3_client.upload_fileobj(
                image_file,
                self.bucket_name,
                f"images/{filename}",
                ExtraArgs={
                    'ContentType': content_type,
                    'CacheControl': 'max-age=31536000',  # 1 year cache
                    'ACL': 'public-read'  # Make images publicly readable
                }
            )
            
            # Generate public URL
            url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/images/{filename}"
            
            logger.info(f"Image uploaded successfully: {filename}")
            
            return {
                'success': True,
                'url': url,
                'filename': filename,
                'size': len(image_data)
            }
            
        except ClientError as e:
            logger.error(f"S3 upload error: {str(e)}")
            return {
                'success': False,
                'error': f"Upload failed: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Image upload error: {str(e)}")
            return {
                'success': False,
                'error': f"Upload failed: {str(e)}"
            }
    
    def delete_image(self, filename):
        """Delete image from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=f"images/{filename}"
            )
            
            logger.info(f"Image deleted successfully: {filename}")
            return True
            
        except ClientError as e:
            logger.error(f"S3 delete error: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Image delete error: {str(e)}")
            return False
    
    def generate_download_url(self, filename, expiration=3600):
        """Generate presigned URL for downloading image"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': f"images/{filename}",
                    'ResponseContentDisposition': f'attachment; filename="{filename}"'
                },
                ExpiresIn=expiration
            )
            
            return url
            
        except ClientError as e:
            logger.error(f"S3 presigned URL error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Download URL generation error: {str(e)}")
            return None
    
    def upload_thumbnail(self, image_data, filename, max_size=(300, 300)):
        """Upload thumbnail version of image"""
        try:
            # Create thumbnail
            image = Image.open(io.BytesIO(image_data))
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Save thumbnail to bytes
            thumbnail_io = io.BytesIO()
            image.save(thumbnail_io, format='JPEG', quality=85, optimize=True)
            thumbnail_data = thumbnail_io.getvalue()
            
            # Generate thumbnail filename
            name, ext = filename.rsplit('.', 1)
            thumbnail_filename = f"{name}_thumb.jpg"
            
            # Upload thumbnail
            thumbnail_file = io.BytesIO(thumbnail_data)
            
            self.s3_client.upload_fileobj(
                thumbnail_file,
                self.bucket_name,
                f"thumbnails/{thumbnail_filename}",
                ExtraArgs={
                    'ContentType': 'image/jpeg',
                    'CacheControl': 'max-age=31536000',
                    'ACL': 'public-read'
                }
            )
            
            # Generate thumbnail URL
            thumbnail_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/thumbnails/{thumbnail_filename}"
            
            logger.info(f"Thumbnail uploaded successfully: {thumbnail_filename}")
            
            return {
                'success': True,
                'url': thumbnail_url,
                'filename': thumbnail_filename,
                'size': len(thumbnail_data)
            }
            
        except Exception as e:
            logger.error(f"Thumbnail upload error: {str(e)}")
            return {
                'success': False,
                'error': f"Thumbnail upload failed: {str(e)}"
            }
    
    def check_bucket_exists(self):
        """Check if S3 bucket exists and is accessible"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            return True
        except ClientError:
            return False
    
    def get_bucket_policy(self):
        """Get bucket policy for public read access"""
        return {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{self.bucket_name}/images/*"
                },
                {
                    "Sid": "PublicReadGetThumbnail",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{self.bucket_name}/thumbnails/*"
                }
            ]
        }
    
    def setup_bucket_cors(self):
        """Set up CORS configuration for the bucket"""
        cors_configuration = {
            'CORSRules': [
                {
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['GET', 'HEAD'],
                    'AllowedOrigins': ['*'],
                    'ExposeHeaders': ['ETag'],
                    'MaxAgeSeconds': 3000
                }
            ]
        }
        
        try:
            self.s3_client.put_bucket_cors(
                Bucket=self.bucket_name,
                CORSConfiguration=cors_configuration
            )
            logger.info("CORS configuration applied successfully")
            return True
        except ClientError as e:
            logger.error(f"Failed to set CORS configuration: {str(e)}")
            return False
    
    def get_storage_usage(self, user_id=None):
        """Get storage usage statistics"""
        try:
            prefix = f"images/{user_id}_" if user_id else "images/"
            
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(Bucket=self.bucket_name, Prefix=prefix)
            
            total_size = 0
            object_count = 0
            
            for page in pages:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        total_size += obj['Size']
                        object_count += 1
            
            return {
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'object_count': object_count
            }
            
        except ClientError as e:
            logger.error(f"Failed to get storage usage: {str(e)}")
            return None
