"""
Persistent Storage Service - Never Lose Data
Ensures all images and user data persist across server restarts
"""

import os
import json
import threading
from datetime import datetime
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class PersistentStorage:
    """
    Persistent storage service that ensures data is never lost
    Uses local JSON files with atomic writes and backup system
    """
    
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'persistent')
        self.images_file = os.path.join(self.data_dir, 'images.json')
        self.users_file = os.path.join(self.data_dir, 'users.json')
        self.generations_file = os.path.join(self.data_dir, 'generations.json')
        self.backup_dir = os.path.join(self.data_dir, 'backups')
        
        # Thread lock for atomic operations
        self._lock = threading.Lock()
        
        # Ensure directories exist
        self._ensure_directories()
        
        # Initialize files if they don't exist
        self._initialize_files()
    
    def _ensure_directories(self):
        """Create necessary directories"""
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.backup_dir, exist_ok=True)
    
    def _initialize_files(self):
        """Initialize JSON files if they don't exist"""
        files_to_init = [
            (self.images_file, []),
            (self.users_file, {}),
            (self.generations_file, [])
        ]
        
        for file_path, default_data in files_to_init:
            if not os.path.exists(file_path):
                self._write_json_atomic(file_path, default_data)
                logger.info(f"📁 Initialized persistent storage file: {file_path}")
    
    def _write_json_atomic(self, file_path: str, data: Any):
        """Write JSON data atomically to prevent corruption"""
        temp_path = f"{file_path}.tmp"
        try:
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            # Atomic move
            if os.path.exists(file_path):
                backup_path = f"{file_path}.backup"
                os.replace(file_path, backup_path)
            
            os.replace(temp_path, file_path)
            
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e
    
    def _read_json_safe(self, file_path: str, default: Any = None):
        """Read JSON file safely with backup recovery"""
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read {file_path}: {e}")
            
            # Try backup
            backup_path = f"{file_path}.backup"
            if os.path.exists(backup_path):
                try:
                    with open(backup_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        logger.info(f"Recovered data from backup: {backup_path}")
                        return data
                except Exception as backup_error:
                    logger.error(f"Backup recovery failed: {backup_error}")
        
        return default if default is not None else []
    
    def save_image(self, image_metadata: Dict[str, Any]):
        """Save image metadata to persistent storage"""
        with self._lock:
            try:
                # Load existing images
                images = self._read_json_safe(self.images_file, [])
                
                # Add new image
                images.append(image_metadata)
                
                # Save back to file
                self._write_json_atomic(self.images_file, images)
                
                logger.info(f"💾 Image saved to persistent storage: {image_metadata.get('id', 'unknown')}")
                
                # Create backup every 10 images
                if len(images) % 10 == 0:
                    self._create_backup()
                
            except Exception as e:
                logger.error(f"❌ Failed to save image to persistent storage: {e}")
                raise e
    
    def get_all_images(self) -> List[Dict[str, Any]]:
        """Get all images from persistent storage"""
        with self._lock:
            images = self._read_json_safe(self.images_file, [])
            logger.info(f"📸 Retrieved {len(images)} images from persistent storage")
            return images
    
    def get_user_images(self, user_id: str) -> List[Dict[str, Any]]:
        """Get images for a specific user"""
        all_images = self.get_all_images()
        user_images = [img for img in all_images if img.get('user_id') == user_id]
        logger.info(f"👤 Retrieved {len(user_images)} images for user {user_id}")
        return user_images
    
    def update_image_favorite(self, image_id: str, user_id: str, is_favorite: bool):
        """Update image favorite status"""
        with self._lock:
            try:
                images = self._read_json_safe(self.images_file, [])
                
                for img in images:
                    if img.get('id') == image_id and img.get('user_id') == user_id:
                        img['is_favorite'] = is_favorite
                        self._write_json_atomic(self.images_file, images)
                        logger.info(f"⭐ Updated favorite status for {image_id}: {is_favorite}")
                        return True
                
                logger.warning(f"Image not found for favorite update: {image_id}")
                return False
                
            except Exception as e:
                logger.error(f"Failed to update favorite status: {e}")
                return False
    
    def save_generation_record(self, user_id: str, image_id: str, params: Dict[str, Any]):
        """Save generation record"""
        with self._lock:
            try:
                generations = self._read_json_safe(self.generations_file, [])
                
                generation_record = {
                    'id': f"{user_id}#{datetime.utcnow().isoformat()}",
                    'user_id': user_id,
                    'image_id': image_id,
                    'timestamp': datetime.utcnow().isoformat(),
                    'parameters': params
                }
                
                generations.append(generation_record)
                self._write_json_atomic(self.generations_file, generations)
                
                logger.info(f"📝 Generation record saved: {image_id}")
                
            except Exception as e:
                logger.error(f"Failed to save generation record: {e}")
    
    def _create_backup(self):
        """Create timestamped backup of all data"""
        try:
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            
            # Backup images
            images = self._read_json_safe(self.images_file, [])
            backup_images_path = os.path.join(self.backup_dir, f'images_{timestamp}.json')
            self._write_json_atomic(backup_images_path, images)
            
            # Backup generations
            generations = self._read_json_safe(self.generations_file, [])
            backup_gen_path = os.path.join(self.backup_dir, f'generations_{timestamp}.json')
            self._write_json_atomic(backup_gen_path, generations)
            
            logger.info(f"💾 Created backup: {timestamp}")
            
            # Clean old backups (keep last 10)
            self._cleanup_old_backups()
            
        except Exception as e:
            logger.error(f"Backup creation failed: {e}")
    
    def _cleanup_old_backups(self):
        """Keep only the last 10 backups"""
        try:
            backup_files = [f for f in os.listdir(self.backup_dir) if f.endswith('.json')]
            backup_files.sort(reverse=True)
            
            # Remove old backups
            for old_backup in backup_files[20:]:  # Keep 20 files (10 images + 10 generations)
                os.remove(os.path.join(self.backup_dir, old_backup))
                
        except Exception as e:
            logger.error(f"Backup cleanup failed: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        with self._lock:
            images = self._read_json_safe(self.images_file, [])
            generations = self._read_json_safe(self.generations_file, [])
            
            # Count unique users
            unique_users = set()
            for img in images:
                if img.get('user_id'):
                    unique_users.add(img['user_id'])
            
            return {
                'total_images': len(images),
                'total_generations': len(generations),
                'unique_users': len(unique_users),
                'storage_healthy': True
            }
