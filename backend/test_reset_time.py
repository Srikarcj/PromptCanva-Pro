#!/usr/bin/env python3
"""
Test script to verify reset time calculation
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.usage_tracker import UsageTracker

def test_reset_time():
    """Test the reset time calculation"""
    print("🕐 Testing reset time calculation...")
    
    tracker = UsageTracker()
    
    # Get current time
    now = datetime.now(timezone.utc)
    print(f"Current time (UTC): {now}")
    
    # Get reset time
    reset_time_str = tracker._get_reset_time()
    reset_time = datetime.fromisoformat(reset_time_str.replace('Z', '+00:00'))
    print(f"Reset time (UTC): {reset_time}")
    
    # Calculate difference
    diff = reset_time - now
    print(f"Time difference: {diff}")
    
    # Calculate hours and minutes until reset
    total_seconds = diff.total_seconds()
    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)
    
    print(f"Hours until reset: {hours}")
    print(f"Minutes until reset: {minutes}")
    print(f"Formatted: Resets in {hours}h {minutes}m")
    
    # Verify it's actually the next midnight
    expected_reset = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    print(f"Expected reset (next midnight): {expected_reset}")
    
    if abs((reset_time - expected_reset).total_seconds()) < 1:
        print("✅ Reset time calculation is correct!")
    else:
        print("❌ Reset time calculation is incorrect!")
        print(f"Difference: {reset_time - expected_reset}")

if __name__ == "__main__":
    test_reset_time()
