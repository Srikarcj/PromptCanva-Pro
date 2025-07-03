"""
Platform activity tracker
Tracks real user activity and image generation for accurate admin analytics
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class PlatformTracker:
    def __init__(self):
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        
        self.stats_file = self.data_dir / "platform_stats.json"
        self.activity_file = self.data_dir / "user_activity.json"
        self.images_file = self.data_dir / "generated_images.json"
        
        # Initialize files if they don't exist
        self._initialize_files()
    
    def _initialize_files(self):
        """Initialize tracking files if they don't exist"""
        try:
            if not self.stats_file.exists():
                initial_stats = {
                    "total_users": 1,  # At least the admin
                    "total_images": 0,
                    "total_storage_mb": 0.0,
                    "created_at": datetime.utcnow().isoformat(),
                    "last_updated": datetime.utcnow().isoformat()
                }
                self._save_json(self.stats_file, initial_stats)
            
            if not self.activity_file.exists():
                self._save_json(self.activity_file, [])
            
            if not self.images_file.exists():
                self._save_json(self.images_file, [])
                
            logger.info("Platform tracking files initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize tracking files: {e}")
    
    def track_image_generation(self, user_email: str, image_data: Dict[str, Any]):
        """Track a new image generation"""
        try:
            from datetime import timezone
            current_time = datetime.utcnow().replace(tzinfo=timezone.utc)

            # Record the image
            image_record = {
                "id": image_data.get("id", f"img_{int(current_time.timestamp())}"),
                "user_email": user_email,
                "prompt": image_data.get("prompt", ""),
                "width": image_data.get("width", 1024),
                "height": image_data.get("height", 1024),
                "model": image_data.get("model", "FLUX.1-schnell"),
                "generation_time": image_data.get("generation_time", 0),
                "file_size_mb": image_data.get("file_size", 2048000) / (1024 * 1024),  # Convert to MB
                "created_at": current_time.isoformat(),
                "success": True
            }
            
            # Add to images file
            images = self._load_json(self.images_file)
            images.append(image_record)
            
            # Keep only last 1000 images to prevent file from growing too large
            if len(images) > 1000:
                images = images[-1000:]
            
            self._save_json(self.images_file, images)
            
            # Update platform stats
            self._update_platform_stats(image_generated=True)
            
            # Track user activity
            self.track_user_activity(user_email, "image_generated", {
                "image_id": image_record["id"],
                "prompt": image_data.get("prompt", "")[:100]  # First 100 chars
            })
            
            logger.info(f"Tracked image generation for {user_email}: {image_record['id']}")
            
        except Exception as e:
            logger.error(f"Failed to track image generation: {e}")
    
    def track_user_activity(self, user_email: str, action: str, details: Dict[str, Any] = None):
        """Track user activity"""
        try:
            from datetime import timezone
            current_time = datetime.utcnow().replace(tzinfo=timezone.utc)

            activity_record = {
                "id": f"activity_{int(current_time.timestamp())}_{hash(user_email) % 10000}",
                "user_email": user_email,
                "action": action,
                "details": details or {},
                "timestamp": current_time.isoformat(),
                "ip_address": "127.0.0.1",  # Would be real IP in production
                "user_agent": "Web Browser"
            }
            
            # Add to activity file
            activities = self._load_json(self.activity_file)
            activities.append(activity_record)
            
            # Keep only last 500 activities
            if len(activities) > 500:
                activities = activities[-500:]
            
            self._save_json(self.activity_file, activities)
            
            logger.debug(f"Tracked activity for {user_email}: {action}")
            
        except Exception as e:
            logger.error(f"Failed to track user activity: {e}")
    
    def track_user_registration(self, user_email: str):
        """Track new user registration"""
        try:
            # Update user count
            self._update_platform_stats(new_user=True)
            
            # Track activity
            self.track_user_activity(user_email, "user_registered", {
                "registration_method": "clerk"
            })
            
            logger.info(f"Tracked user registration: {user_email}")
            
        except Exception as e:
            logger.error(f"Failed to track user registration: {e}")
    
    def get_platform_stats(self) -> Dict[str, Any]:
        """Get current platform statistics"""
        try:
            stats = self._load_json(self.stats_file)
            images = self._load_json(self.images_file)
            activities = self._load_json(self.activity_file)
            
            # Calculate real-time stats (make timezone-aware)
            from datetime import timezone
            current_time = datetime.utcnow().replace(tzinfo=timezone.utc)
            today = current_time.date()
            week_ago = current_time - timedelta(days=7)
            month_ago = current_time - timedelta(days=30)
            
            # Count recent activities (handle timezone-aware dates)
            recent_activities = []
            week_activities = []
            month_activities = []

            for a in activities:
                try:
                    # Parse timestamp and make it timezone-aware if needed
                    timestamp_str = a['timestamp']
                    if timestamp_str.endswith('Z'):
                        timestamp_str = timestamp_str.replace('Z', '+00:00')

                    activity_time = datetime.fromisoformat(timestamp_str)

                    # Make timezone-aware if naive
                    if activity_time.tzinfo is None:
                        activity_time = activity_time.replace(tzinfo=current_time.tzinfo)

                    # Compare dates
                    if activity_time.date() >= today:
                        recent_activities.append(a)
                    if activity_time >= week_ago:
                        week_activities.append(a)
                    if activity_time >= month_ago:
                        month_activities.append(a)

                except Exception as e:
                    logger.warning(f"Failed to parse activity timestamp {a.get('timestamp')}: {e}")
                    continue
            
            # Get unique users
            active_users_today = len(set(a['user_email'] for a in recent_activities))
            active_users_week = len(set(a['user_email'] for a in week_activities))
            active_users_month = len(set(a['user_email'] for a in month_activities))
            
            # Calculate storage
            total_storage_mb = sum(img.get('file_size_mb', 2.0) for img in images)
            
            # Calculate costs (estimate)
            total_costs = len(images) * 0.02  # $0.02 per image
            
            return {
                'total_users': stats.get('total_users', 1),
                'total_images_generated': len(images),
                'total_storage_used_mb': round(total_storage_mb, 2),
                'active_users_today': max(1, active_users_today),  # At least 1 (admin)
                'active_users_this_week': max(1, active_users_week),
                'active_users_this_month': max(1, active_users_month),
                'total_api_calls': len(activities),
                'total_costs_usd': round(total_costs, 2),
                'last_updated': current_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get platform stats: {e}")
            return {
                'total_users': 1,
                'total_images_generated': 0,
                'total_storage_used_mb': 0.0,
                'active_users_today': 1,
                'active_users_this_week': 1,
                'active_users_this_month': 1,
                'total_api_calls': 0,
                'total_costs_usd': 0.0,
                'last_updated': datetime.utcnow().isoformat()
            }
    
    def get_recent_activity(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent user activity"""
        try:
            activities = self._load_json(self.activity_file)
            
            # Sort by timestamp (newest first) and limit
            sorted_activities = sorted(
                activities, 
                key=lambda x: x['timestamp'], 
                reverse=True
            )[:limit]
            
            return sorted_activities
            
        except Exception as e:
            logger.error(f"Failed to get recent activity: {e}")
            return []
    
    def get_top_users(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top users by activity"""
        try:
            images = self._load_json(self.images_file)
            activities = self._load_json(self.activity_file)
            
            # Count images per user
            user_stats = {}
            for img in images:
                user_email = img.get('user_email', 'unknown')
                if user_email not in user_stats:
                    user_stats[user_email] = {
                        'email': user_email,
                        'images_generated': 0,
                        'total_storage_mb': 0.0,
                        'last_active': img['created_at'],
                        'join_date': img['created_at'],  # First image as join proxy
                        'subscription': 'admin' if user_email == 'srikarboina9999@gmail.com' else 'free'
                    }
                
                user_stats[user_email]['images_generated'] += 1
                user_stats[user_email]['total_storage_mb'] += img.get('file_size_mb', 2.0)
                
                # Update last active
                if img['created_at'] > user_stats[user_email]['last_active']:
                    user_stats[user_email]['last_active'] = img['created_at']
            
            # Sort by images generated
            top_users = sorted(
                user_stats.values(),
                key=lambda x: x['images_generated'],
                reverse=True
            )[:limit]
            
            # Round storage values
            for user in top_users:
                user['total_storage_mb'] = round(user['total_storage_mb'], 2)
            
            return top_users
            
        except Exception as e:
            logger.error(f"Failed to get top users: {e}")
            return []
    
    def _update_platform_stats(self, new_user: bool = False, image_generated: bool = False):
        """Update platform statistics"""
        try:
            stats = self._load_json(self.stats_file)
            
            if new_user:
                stats['total_users'] = stats.get('total_users', 0) + 1
            
            stats['last_updated'] = datetime.utcnow().isoformat()
            
            self._save_json(self.stats_file, stats)
            
        except Exception as e:
            logger.error(f"Failed to update platform stats: {e}")
    
    def _load_json(self, file_path: Path) -> Any:
        """Load JSON data from file"""
        try:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return [] if 'activity' in str(file_path) or 'images' in str(file_path) else {}
        except Exception as e:
            logger.error(f"Failed to load {file_path}: {e}")
            return [] if 'activity' in str(file_path) or 'images' in str(file_path) else {}
    
    def _save_json(self, file_path: Path, data: Any):
        """Save JSON data to file"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save {file_path}: {e}")

# Global instance
platform_tracker = PlatformTracker()
