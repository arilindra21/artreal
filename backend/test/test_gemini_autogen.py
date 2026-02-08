"""
Test script for Gemini-3 Flash integration with AutoGen
This script tests the OpenAI-compatible API with Gemini model
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from autogen_core.models import SystemMessage, UserMessage

from app.core.gemini_client import Gemini3FlashChatCompletionClient

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyDE8gf1yS4QClTCr_c_GWRyJzcTuHbyCFA"
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
GEMINI_MODEL = "gemini-3-flash-preview"


async def test_basic_completion():
    """Test basic text completion with Gemini-3 Flash"""
    print("=" * 60)
    print("Test 1: Basic Text Completion")
    print("=" * 60)

    # Create client using centralized configuration
    client = Gemini3FlashChatCompletionClient(
        model=GEMINI_MODEL, api_key=GEMINI_API_KEY, base_url=GEMINI_BASE_URL
    )

    try:
        # Send a simple message
        messages = [UserMessage(content="Hello! Please respond with a short greeting.", source="user")]

        print(f"\nSending message: {messages[0].content}")
        print("\nWaiting for response...")

        response = await client.create(messages)

        print("\n" + "-" * 60)
        print("RESPONSE RECEIVED:")
        print("-" * 60)
        print(f"Content: {response.content}")
        print(f"Finish reason: {response.finish_reason}")
        print(f"Usage: {response.usage}")
        print("-" * 60)

        await client.close()
        return True

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        await client.close()
        return False


async def test_system_message():
    """Test with system message (role-based)"""
    print("\n" + "=" * 60)
    print("Test 2: System Message + User Message")
    print("=" * 60)

    client = Gemini3FlashChatCompletionClient(
        model=GEMINI_MODEL, api_key=GEMINI_API_KEY, base_url=GEMINI_BASE_URL
    )

    try:
        messages = [
            SystemMessage(content="You are a helpful coding assistant that writes Python code."),
            UserMessage(
                content="Write a simple function that calculates the factorial of a number. Include type hints.",
                source="user",
            ),
        ]

        print(f"\nSystem: {messages[0].content}")
        print(f"User: {messages[1].content}")
        print("\nWaiting for response...")

        response = await client.create(messages)

        print("\n" + "-" * 60)
        print("RESPONSE RECEIVED:")
        print("-" * 60)
        print(response.content)
        print("-" * 60)
        print(f"Finish reason: {response.finish_reason}")
        print(f"Tokens used: {response.usage}")

        await client.close()
        return True

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        await client.close()
        return False


async def test_json_output():
    """Test JSON structured output"""
    print("\n" + "=" * 60)
    print("Test 3: JSON Structured Output")
    print("=" * 60)

    client = Gemini3FlashChatCompletionClient(
        model=GEMINI_MODEL, api_key=GEMINI_API_KEY, base_url=GEMINI_BASE_URL
    )

    try:
        messages = [
            SystemMessage(
                content='You are an AI that generates project metadata. Return ONLY valid JSON with this structure: {"name": "project name", "description": "project description"}'
            ),
            UserMessage(
                content="Create a project for a simple todo list app with React and TypeScript", source="user"
            ),
        ]

        print(f"\nUser: {messages[1].content}")
        print("\nWaiting for JSON response...")

        response = await client.create(messages)

        print("\n" + "-" * 60)
        print("JSON RESPONSE RECEIVED:")
        print("-" * 60)
        print(response.content)
        print("-" * 60)

        # Try to parse JSON
        import json

        try:
            # Remove markdown code blocks if present
            content = response.content
            if content.strip().startswith("```"):
                content = content.split("```json")[-1].split("```")[0].strip()

            parsed = json.loads(content)
            print("\n[SUCCESS] JSON parsed successfully:")
            print(f"  Name: {parsed.get('name')}")
            print(f"  Description: {parsed.get('description')}")
        except json.JSONDecodeError as je:
            print(f"\n[WARNING] Could not parse JSON: {je}")

        await client.close()
        return True

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        await client.close()
        return False


async def test_with_config():
    """Test using the app's actual configuration"""
    print("\n" + "=" * 60)
    print("Test 4: Using App Configuration")
    print("=" * 60)

    try:
        from app.core.config import settings

        print(f"\nLoaded config:")
        print(f"  Model: {settings.GEMINI_MODEL}")
        print(f"  Base URL: {settings.GEMINI_API_BASE_URL}")
        print(f"  API Key: {settings.GEMINI_API_KEY[:20]}...")

        # Use centralized client - it automatically reads from settings
        client = Gemini3FlashChatCompletionClient()

        messages = [UserMessage(content="Say 'Configuration test successful!' if you receive this.", source="user")]

        print("\nTesting with app configuration...")
        response = await client.create(messages)

        print("\n" + "-" * 60)
        print("RESPONSE:")
        print("-" * 60)
        print(response.content)
        print("-" * 60)

        await client.close()
        return True

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


async def main():
    """Run all tests"""
    print("\nStarting Gemini-3 Flash AutoGen Integration Tests\n")

    results = []

    # Run tests
    results.append(("Basic Completion", await test_basic_completion()))
    results.append(("System Message", await test_system_message()))
    results.append(("JSON Output", await test_json_output()))
    results.append(("App Configuration", await test_with_config()))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {test_name}")

    print("-" * 60)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)

    if passed == total:
        print("\n[SUCCESS] All tests passed! Gemini-3 Flash is working correctly.")
        sys.exit(0)
    else:
        print(f"\n[FAILURE] {total - passed} test(s) failed.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
