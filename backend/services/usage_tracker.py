"""
Usage Tracking Service
Tracks daily usage limits for authenticated and non-authenticated users
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional, Tuple
from flask import current_app
import json
import os

logger = logging.getLogger(__name__)

class UsageTracker:
    """
    Tracks usage limits for image generation
    - Non-authenticated users: 1 image per IP per day
    - Authenticated users: 5 images per email per day
    """
    
    def __init__(self):
        self.usage_file = os.path.join(os.getcwd(), 'usage_data.json')
        self.limits = {
            'anonymous': 1,  # 1 image per IP per day
            'authenticated': 5  # 5 images per email per day
        }
        self._ensure_usage_file()
    
    def _ensure_usage_file(self):
        """Ensure usage file exists"""
        if not os.path.exists(self.usage_file):
            self._save_usage_data({})
    
    def _load_usage_data(self) -> Dict:
        """Load usage data from file"""
        try:
            with open(self.usage_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_usage_data(self, data: Dict):
        """Save usage data to file"""
        try:
            with open(self.usage_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save usage data: {str(e)}")
    
    def _get_today_key(self) -> str:
        """Get today's date key for usage tracking"""
        return datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    def _cleanup_old_data(self, data: Dict) -> Dict:
        """Remove usage data older than 7 days"""
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=7)
        cutoff_key = cutoff_date.strftime('%Y-%m-%d')
        
        cleaned_data = {}
        for date_key, date_data in data.items():
            if date_key >= cutoff_key:
                cleaned_data[date_key] = date_data
        
        return cleaned_data
    
    def check_usage_limit(self, user_id: Optional[str] = None, ip_address: Optional[str] = None) -> Tuple[bool, int, int]:
        """
        Check if user/IP has exceeded usage limit
        
        Args:
            user_id: User ID for authenticated users
            ip_address: IP address for non-authenticated users
            
        Returns:
            Tuple of (can_generate, current_usage, limit)
        """
        data = self._load_usage_data()
        today_key = self._get_today_key()
        
        # Clean up old data
        data = self._cleanup_old_data(data)
        
        # Get today's data
        today_data = data.get(today_key, {})
        
        if user_id:
            # Authenticated user
            user_key = f"user:{user_id}"
            current_usage = today_data.get(user_key, 0)
            limit = self.limits['authenticated']
        else:
            # Non-authenticated user (use IP)
            ip_key = f"ip:{ip_address}"
            current_usage = today_data.get(ip_key, 0)
            limit = self.limits['anonymous']
        
        can_generate = current_usage < limit
        
        logger.info(f"Usage check - User: {user_id or 'anonymous'}, IP: {ip_address}, "
                   f"Current: {current_usage}, Limit: {limit}, Can generate: {can_generate}")
        
        return can_generate, current_usage, limit
    
    def increment_usage(self, user_id: Optional[str] = None, ip_address: Optional[str] = None) -> bool:
        """
        Increment usage count for user/IP
        
        Args:
            user_id: User ID for authenticated users
            ip_address: IP address for non-authenticated users
            
        Returns:
            True if increment was successful, False if limit would be exceeded
        """
        data = self._load_usage_data()
        today_key = self._get_today_key()
        
        # Clean up old data
        data = self._cleanup_old_data(data)
        
        # Get today's data
        if today_key not in data:
            data[today_key] = {}
        
        today_data = data[today_key]
        
        if user_id:
            # Authenticated user
            user_key = f"user:{user_id}"
            current_usage = today_data.get(user_key, 0)
            limit = self.limits['authenticated']
            
            if current_usage >= limit:
                return False
            
            today_data[user_key] = current_usage + 1
        else:
            # Non-authenticated user (use IP)
            ip_key = f"ip:{ip_address}"
            current_usage = today_data.get(ip_key, 0)
            limit = self.limits['anonymous']
            
            if current_usage >= limit:
                return False
            
            today_data[ip_key] = current_usage + 1
        
        # Save updated data
        self._save_usage_data(data)
        
        logger.info(f"Usage incremented - User: {user_id or 'anonymous'}, IP: {ip_address}, "
                   f"New count: {today_data.get(user_key if user_id else ip_key)}")
        
        return True
    
    def get_usage_stats(self, user_id: Optional[str] = None, ip_address: Optional[str] = None) -> Dict:
        """
        Get usage statistics for user/IP
        
        Args:
            user_id: User ID for authenticated users
            ip_address: IP address for non-authenticated users
            
        Returns:
            Dictionary with usage statistics
        """
        can_generate, current_usage, limit = self.check_usage_limit(user_id, ip_address)
        
        return {
            'can_generate': can_generate,
            'current_usage': current_usage,
            'limit': limit,
            'remaining': max(0, limit - current_usage),
            'reset_time': self._get_reset_time(),
            'user_type': 'authenticated' if user_id else 'anonymous'
        }
    
    def _get_reset_time(self) -> str:
        """Get the time when usage limits reset (midnight UTC)"""
        tomorrow = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        return tomorrow.isoformat()
    
    def reset_usage(self, user_id: Optional[str] = None, ip_address: Optional[str] = None) -> bool:
        """
        Reset usage for a specific user/IP (admin function)
        
        Args:
            user_id: User ID for authenticated users
            ip_address: IP address for non-authenticated users
            
        Returns:
            True if reset was successful
        """
        try:
            data = self._load_usage_data()
            today_key = self._get_today_key()
            
            if today_key in data:
                if user_id:
                    user_key = f"user:{user_id}"
                    if user_key in data[today_key]:
                        del data[today_key][user_key]
                else:
                    ip_key = f"ip:{ip_address}"
                    if ip_key in data[today_key]:
                        del data[today_key][ip_key]
                
                self._save_usage_data(data)
            
            logger.info(f"Usage reset - User: {user_id or 'anonymous'}, IP: {ip_address}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to reset usage: {str(e)}")
            return False
