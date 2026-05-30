#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:3001"

print("\n=== Testing HerbiGPT API ===\n")

# Test 1: Health
try:
    print("1. Testing /health endpoint...")
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"   Status: {r.status_code}")
    print(f"   Response: {json.dumps(r.json(), indent=2)}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 2: Ask
try:
    print("\n2. Testing /ask endpoint...")
    r = requests.post(
        f"{BASE_URL}/ask",
        json={"question": "Diet plans for weight loss"},
        headers={"Content-Type": "application/json"},
        timeout=60
    )
    print(f"   Status: {r.status_code}")
    data = r.json()
    print(f"   Success: {data.get('success')}")
    answer = data.get('answer', '')
    print(f"   Answer: {answer[:300]}..." if len(answer) > 300 else f"   Answer: {answer}")
    print(f"\n   Full Response:")
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"   ERROR: {e}")

print("\n✓ Tests complete!\n")
