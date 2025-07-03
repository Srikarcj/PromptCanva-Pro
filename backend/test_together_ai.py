#!/usr/bin/env python3
"""
Test script to verify Together AI API connectivity
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_together_ai():
    api_key = os.getenv('TOGETHER_AI_API_KEY')
    
    if not api_key:
        print("❌ TOGETHER_AI_API_KEY not found in environment")
        return False
    
    print(f"✅ API Key found: {api_key[:20]}...")
    
    # Test payload
    payload = {
        'model': 'black-forest-labs/FLUX.1-schnell-Free',
        'prompt': 'a simple red circle',
        'width': 512,
        'height': 512,
        'steps': 1,
        'n': 1,
        'response_format': 'b64_json'
    }
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    print("🔄 Testing Together AI API...")
    print(f"Endpoint: https://api.together.xyz/v1/images/generations")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            'https://api.together.xyz/v1/images/generations',
            json=payload,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API call successful!")
            print(f"📊 Response keys: {list(result.keys())}")
            
            if 'data' in result and len(result['data']) > 0:
                image_data = result['data'][0]
                print(f"📊 Image data keys: {list(image_data.keys())}")
                
                if 'b64_json' in image_data:
                    b64_length = len(image_data['b64_json'])
                    print(f"✅ Base64 image data received: {b64_length} characters")
                    return True
                else:
                    print("❌ No b64_json in image data")
                    return False
            else:
                print("❌ No data in response")
                return False
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Together AI API Test")
    print("=" * 50)
    
    success = test_together_ai()
    
    print("=" * 50)
    if success:
        print("✅ Test completed successfully!")
    else:
        print("❌ Test failed!")
