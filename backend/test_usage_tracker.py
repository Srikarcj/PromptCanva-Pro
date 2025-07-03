#!/usr/bin/env python3
"""
Simple test script for the usage tracker
Run this to verify the usage tracking functionality works correctly
"""

import os
import sys
import tempfile
import json
from datetime import datetime, timezone

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.usage_tracker import UsageTracker

def test_usage_tracker():
    """Test the usage tracker functionality"""
    print("🧪 Testing Usage Tracker...")
    
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        temp_file = f.name
    
    try:
        # Create usage tracker with custom file
        tracker = UsageTracker()
        tracker.usage_file = temp_file
        tracker._ensure_usage_file()
        
        print("✅ Usage tracker initialized")
        
        # Test anonymous user limits
        print("\n📱 Testing anonymous user limits...")
        
        # Check initial usage
        can_generate, current, limit = tracker.check_usage_limit(ip_address="192.168.1.1")
        print(f"Initial check: can_generate={can_generate}, current={current}, limit={limit}")
        assert can_generate == True
        assert current == 0
        assert limit == 1
        
        # Generate first image
        success = tracker.increment_usage(ip_address="192.168.1.1")
        print(f"First generation: success={success}")
        assert success == True
        
        # Check after first generation
        can_generate, current, limit = tracker.check_usage_limit(ip_address="192.168.1.1")
        print(f"After first: can_generate={can_generate}, current={current}, limit={limit}")
        assert can_generate == False
        assert current == 1
        assert limit == 1
        
        # Try to generate second image (should fail)
        success = tracker.increment_usage(ip_address="192.168.1.1")
        print(f"Second generation attempt: success={success}")
        assert success == False
        
        print("✅ Anonymous user limits working correctly")
        
        # Test authenticated user limits
        print("\n👤 Testing authenticated user limits...")
        
        # Check initial usage for authenticated user
        can_generate, current, limit = tracker.check_usage_limit(user_id="user123")
        print(f"Auth user initial: can_generate={can_generate}, current={current}, limit={limit}")
        assert can_generate == True
        assert current == 0
        assert limit == 5
        
        # Generate 5 images
        for i in range(5):
            success = tracker.increment_usage(user_id="user123")
            print(f"Auth generation {i+1}: success={success}")
            assert success == True
        
        # Check after 5 generations
        can_generate, current, limit = tracker.check_usage_limit(user_id="user123")
        print(f"After 5 generations: can_generate={can_generate}, current={current}, limit={limit}")
        assert can_generate == False
        assert current == 5
        assert limit == 5
        
        # Try to generate 6th image (should fail)
        success = tracker.increment_usage(user_id="user123")
        print(f"6th generation attempt: success={success}")
        assert success == False
        
        print("✅ Authenticated user limits working correctly")
        
        # Test usage stats
        print("\n📊 Testing usage stats...")
        
        stats = tracker.get_usage_stats(user_id="user123")
        print(f"Auth user stats: {stats}")
        assert stats['can_generate'] == False
        assert stats['current_usage'] == 5
        assert stats['limit'] == 5
        assert stats['remaining'] == 0
        assert stats['user_type'] == 'authenticated'
        
        stats = tracker.get_usage_stats(ip_address="192.168.1.1")
        print(f"Anonymous user stats: {stats}")
        assert stats['can_generate'] == False
        assert stats['current_usage'] == 1
        assert stats['limit'] == 1
        assert stats['remaining'] == 0
        assert stats['user_type'] == 'anonymous'
        
        print("✅ Usage stats working correctly")
        
        # Test reset functionality
        print("\n🔄 Testing reset functionality...")
        
        success = tracker.reset_usage(user_id="user123")
        print(f"Reset auth user: success={success}")
        assert success == True
        
        can_generate, current, limit = tracker.check_usage_limit(user_id="user123")
        print(f"After reset: can_generate={can_generate}, current={current}, limit={limit}")
        assert can_generate == True
        assert current == 0
        assert limit == 5
        
        print("✅ Reset functionality working correctly")
        
        # Test data persistence
        print("\n💾 Testing data persistence...")
        
        # Create new tracker instance with same file
        tracker2 = UsageTracker()
        tracker2.usage_file = temp_file
        
        # Check that anonymous user data persists
        can_generate, current, limit = tracker2.check_usage_limit(ip_address="192.168.1.1")
        print(f"Persistence check: can_generate={can_generate}, current={current}, limit={limit}")
        assert can_generate == False  # Should still be at limit
        assert current == 1
        assert limit == 1
        
        print("✅ Data persistence working correctly")
        
        print("\n🎉 All tests passed! Usage tracker is working correctly.")
        
    finally:
        # Clean up
        if os.path.exists(temp_file):
            os.unlink(temp_file)
            print(f"🧹 Cleaned up test file: {temp_file}")

if __name__ == "__main__":
    test_usage_tracker()
