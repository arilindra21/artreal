"""
Test raw Gemini API to see thought_signature in response
This will help us understand exactly where thought_signature appears
"""

import asyncio
import json
import httpx
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings


async def test_raw_api_call():
    """Make a direct HTTP call to Gemini API to see raw response format"""

    url = f"{settings.GEMINI_API_BASE_URL}chat/completions"

    headers = {
        "Authorization": f"Bearer {settings.GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }

    # Define a simple tool
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the weather for a city",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {
                            "type": "string",
                            "description": "The city name"
                        }
                    },
                    "required": ["city"]
                }
            }
        }
    ]

    # First request - ask to use the tool
    payload = {
        "model": settings.GEMINI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant. Use the get_weather tool when asked about weather."
            },
            {
                "role": "user",
                "content": "What's the weather in Tokyo?"
            }
        ],
        "tools": tools,
        "tool_choice": "auto",
        "temperature": 0.7,
        "max_tokens": 1000
    }

    print("=" * 80)
    print("TEST: Raw Gemini API Call")
    print("=" * 80)
    print("\nRequest payload:")
    print(json.dumps(payload, indent=2))
    print("\n" + "=" * 80)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)

            print(f"\nResponse status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            print("\n" + "=" * 80)
            print("RAW RESPONSE BODY:")
            print("=" * 80)

            # Get raw text first
            raw_text = response.text
            print(raw_text)

            print("\n" + "=" * 80)
            print("PARSED JSON:")
            print("=" * 80)

            # Parse JSON
            data = response.json()
            print(json.dumps(data, indent=2))

            print("\n" + "=" * 80)
            print("ANALYSIS:")
            print("=" * 80)

            if "choices" in data and len(data["choices"]) > 0:
                choice = data["choices"][0]
                message = choice.get("message", {})

                print(f"\nMessage keys: {list(message.keys())}")

                if "tool_calls" in message:
                    print(f"\nNumber of tool calls: {len(message['tool_calls'])}")
                    for i, tool_call in enumerate(message["tool_calls"]):
                        print(f"\nTool call {i}:")
                        print(json.dumps(tool_call, indent=2))
                        print(f"Tool call keys: {list(tool_call.keys())}")

                        # Check for thought_signature
                        if "thought_signature" in tool_call:
                            print(f"\n[FOUND] thought_signature in tool_call: {tool_call['thought_signature']}")
                        else:
                            print("\n[NOT FOUND] No thought_signature in tool_call")

                # Check message level
                if "thought_signature" in message:
                    print(f"\n[FOUND] thought_signature in message: {message['thought_signature']}")
                else:
                    print("\n[NOT FOUND] No thought_signature in message")

            # Check response level
            if "thought_signature" in data:
                print(f"\n[FOUND] thought_signature in response: {data['thought_signature']}")
            else:
                print("\n[NOT FOUND] No thought_signature in response")

            print("\n" + "=" * 80)
            return data

        except Exception as e:
            print(f"\n[ERROR] Request failed: {e}")
            import traceback
            traceback.print_exc()
            return None


async def main():
    """Run the test"""
    print("\nGEMINI RAW API TEST")
    print("This test makes a direct HTTP call to see the raw response format")
    print("including where thought_signature appears (if at all)\n")

    result = await test_raw_api_call()

    if result:
        print("\n[SUCCESS] Test completed - check output above for thought_signature location")
    else:
        print("\n[FAILED] Test failed")

    return result is not None


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
