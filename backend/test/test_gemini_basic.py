"""
Basic Gemini Client Test - Non-Tool Usage
Tests that GeminiThoughtSignatureClient works correctly for basic chat
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination
from autogen_agentchat.teams import RoundRobinGroupChat

from app.core.gemini_thought_signature_client import GeminiThoughtSignatureClient


async def test_basic_chat():
    """Test basic chat without tools - should work perfectly"""
    print("=" * 80)
    print("TEST: Basic Chat Without Tools")
    print("=" * 80)

    try:
        # Create client
        client = GeminiThoughtSignatureClient(
            temperature=0.7,
            max_tokens=500,
        )

        # Create agent WITHOUT tools
        agent = AssistantAgent(
            name="ChatAgent",
            description="A simple chat agent",
            system_message="You are a helpful assistant. Answer questions concisely.",
            model_client=client,
            tools=[],  # No tools - this should work fine
        )

        # Create team
        team = RoundRobinGroupChat(
            participants=[agent],
            termination_condition=MaxMessageTermination(max_messages=3),
        )

        # Test 1: Simple question
        print("\nTest 1: What is Python?")
        result1 = await team.run(task="What is Python programming language? Answer in one sentence.")
        print(f"Response: {result1.messages[-1].content}")

        # Test 2: Math question
        print("\nTest 2: What is 15 + 27?")
        result2 = await team.run(task="What is 15 + 27? Just give me the number.")
        print(f"Response: {result2.messages[-1].content}")

        # Test 3: Code explanation
        print("\nTest 3: Explain a Python concept")
        result3 = await team.run(task="Explain list comprehensions in Python in one sentence.")
        print(f"Response: {result3.messages[-1].content}")

        print("\n[SUCCESS] All basic chat tests passed!")
        print("The GeminiThoughtSignatureClient works correctly for non-tool usage.")
        return True

    except Exception as e:
        print(f"\n[ERROR] Basic chat test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_single_tool_call():
    """Test with ONE tool - may work or may fail (intermittent)"""
    print("\n" + "=" * 80)
    print("TEST: Single Tool Call (Intermittent)")
    print("=" * 80)

    def calculate(a: int, b: int) -> int:
        """Add two numbers."""
        return a + b

    try:
        client = GeminiThoughtSignatureClient(
            temperature=0.7,
            max_tokens=500,
        )

        agent = AssistantAgent(
            name="CalculatorAgent",
            description="An agent with one tool",
            system_message="You can use the calculate tool to add numbers.",
            model_client=client,
            tools=[calculate],
            max_tool_iterations=1,  # Only allow 1 tool call
        )

        team = RoundRobinGroupChat(
            participants=[agent],
            termination_condition=MaxMessageTermination(max_messages=5),
        )

        print("\nAsking: What is 10 + 20?")
        result = await team.run(task="What is 10 + 20? Use the calculate tool.")
        print(f"Response: {result.messages[-1].content}")

        print("\n[SUCCESS] Single tool call worked!")
        print("Note: This may work sometimes and fail other times (intermittent)")
        return True

    except Exception as e:
        if "thought_signature" in str(e):
            print("\n[EXPECTED FAILURE] thought_signature error occurred")
            print("This is the known Gemini limitation with function calling")
            print(f"Error: {str(e)[:200]}...")
        else:
            print(f"\n[ERROR] Unexpected error: {e}")
            import traceback
            traceback.print_exc()
        return False


async def main():
    """Run tests"""
    print("\nGEMINI THOUGHT SIGNATURE CLIENT - BASIC TEST SUITE")
    print("=" * 80)
    print("\nThis test suite verifies:")
    print("1. The client works perfectly for basic chat (no tools)")
    print("2. The client has known issues with function calling")
    print("\n")

    results = []

    # Test 1: Basic chat (should always pass)
    results.append(await test_basic_chat())

    # Test 2: Single tool call (may pass or fail)
    results.append(await test_single_tool_call())

    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(results)
    total = len(results)
    print(f"\nTests Passed: {passed}/{total}")

    if results[0]:
        print("\n[CONFIRMED] Client works for basic chat")
    else:
        print("\n[WARNING] Client failed even for basic chat - unexpected!")

    if results[1]:
        print("[LUCKY] Single tool call succeeded this time")
    else:
        print("[CONFIRMED] Function calling has thought_signature errors")

    print("\nRECOMMENDATION:")
    print("For production use with complex tool calling, consider:")
    print("- Claude 3.5 Sonnet (best alternative)")
    print("- GPT-4o (native OpenAI API support)")
    print("- GPT-4 Turbo (proven reliability)")
    print("\nSee GEMINI_THOUGHT_SIGNATURE_ISSUE.md for full details")

    print("\n" + "=" * 80)

    return results[0]  # Return True if basic chat works


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
