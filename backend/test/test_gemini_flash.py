"""
Test script for Gemini Flash 3 API connection
This script sends a simple message to Gemini Flash 3 to verify the API key works correctly.
"""

import google.generativeai as genai
import sys

# Configure API key
API_KEY = "AIzaSyDE8gf1yS4QClTCr_c_GWRyJzcTuHbyCFA"
genai.configure(api_key=API_KEY)

def test_gemini_flash_basic():
    """Test basic message sending to Gemini Flash 3"""
    try:
        print("=" * 60)
        print("Testing Gemini Flash 3 API Connection")
        print("=" * 60)

        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        # Send a simple test message
        test_message = "Hello! Please respond with a short greeting to confirm the connection is working."

        print(f"\nSending message: {test_message}")
        print("\nWaiting for response...")

        # Generate response
        response = model.generate_content(test_message)

        print("\n" + "-" * 60)
        print("RESPONSE RECEIVED:")
        print("-" * 60)
        print(response.text)
        print("-" * 60)

        print("\n[SUCCESS] Gemini Flash 3 API connection is working!")
        return True

    except Exception as e:
        print("\n" + "=" * 60)
        print("[ERROR] Failed to connect to Gemini Flash 3")
        print("=" * 60)
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        return False

def test_gemini_flash_with_context():
    """Test Gemini Flash 3 with a more complex message"""
    try:
        print("\n" + "=" * 60)
        print("Testing Gemini Flash 3 with Context")
        print("=" * 60)

        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        # Send a message with context
        test_message = """You are a helpful coding assistant.
        Please write a simple Python function that adds two numbers and returns the result.
        Include a docstring and type hints."""

        print(f"\nSending message: {test_message}")
        print("\nWaiting for response...")

        # Generate response
        response = model.generate_content(test_message)

        print("\n" + "-" * 60)
        print("RESPONSE RECEIVED:")
        print("-" * 60)
        print(response.text)
        print("-" * 60)

        print("\n[SUCCESS] Context-aware response received!")
        return True

    except Exception as e:
        print("\n" + "=" * 60)
        print("[ERROR] Failed to get context-aware response")
        print("=" * 60)
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        return False

def test_gemini_model_info():
    """Display available model information"""
    try:
        print("\n" + "=" * 60)
        print("Available Gemini Models")
        print("=" * 60)

        for model in genai.list_models():
            if 'gemini' in model.name.lower():
                print(f"\nModel: {model.name}")
                print(f"Display Name: {model.display_name}")
                print(f"Description: {model.description}")
                print(f"Supported methods: {model.supported_generation_methods}")

        return True

    except Exception as e:
        print(f"\n[ERROR] listing models: {str(e)}")
        return False

if __name__ == "__main__":
    print("\nStarting Gemini Flash 3 API Tests\n")

    # Run tests
    test1 = test_gemini_flash_basic()

    if test1:
        test2 = test_gemini_flash_with_context()
        test3 = test_gemini_model_info()

        if test1 and test2:
            print("\n" + "=" * 60)
            print("ALL TESTS PASSED!")
            print("=" * 60)
            sys.exit(0)

    print("\n" + "=" * 60)
    print("SOME TESTS FAILED")
    print("=" * 60)
    sys.exit(1)
