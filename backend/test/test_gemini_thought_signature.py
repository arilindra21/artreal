"""
Test for GeminiThoughtSignatureClient with function calling
Tests the thought_signature handling with multiple tool calls
"""

import asyncio
import logging
import sys
from pathlib import Path

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Set specific loggers
logging.getLogger('app.core.gemini_thought_signature_client').setLevel(logging.INFO)
logging.getLogger('autogen_core').setLevel(logging.WARNING)
logging.getLogger('autogen_agentchat').setLevel(logging.WARNING)
logging.getLogger('openai').setLevel(logging.WARNING)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_core.models import UserMessage

from app.core.gemini_thought_signature_client import GeminiThoughtSignatureClient


# Define three simple tools for testing
def get_weather(city: str) -> str:
    """
    Get the current weather for a city.

    Args:
        city: The name of the city

    Returns:
        Weather information as a string
    """
    # Mock weather data
    weather_data = {
        "New York": "Sunny, 22°C",
        "London": "Rainy, 15°C",
        "Tokyo": "Cloudy, 18°C",
        "Paris": "Partly cloudy, 20°C",
    }
    return weather_data.get(city, f"Weather data not available for {city}")


def calculate_sum(a: int, b: int) -> int:
    """
    Calculate the sum of two numbers.

    Args:
        a: First number
        b: Second number

    Returns:
        The sum of a and b
    """
    return a + b


def get_fun_fact(topic: str) -> str:
    """
    Get a fun fact about a topic.

    Args:
        topic: The topic to get a fact about

    Returns:
        A fun fact as a string
    """
    facts = {
        "python": "Python was named after Monty Python's Flying Circus, not the snake!",
        "space": "A day on Venus is longer than a year on Venus!",
        "ocean": "The ocean contains about 20 million tons of gold!",
        "ai": "The term 'Artificial Intelligence' was coined in 1956 at a conference at Dartmouth College!",
    }
    return facts.get(topic.lower(), f"No fun fact available for {topic}")


async def test_basic_tool_call():
    """Test 1: Single tool call"""
    print("=" * 80)
    print("TEST 1: Single Tool Call")
    print("=" * 80)

    try:
        # Create client
        client = GeminiThoughtSignatureClient(
            temperature=0.7,
            max_tokens=1000,
        )

        # Create agent with one tool
        agent = AssistantAgent(
            name="WeatherAgent",
            description="An agent that provides weather information",
            system_message="You are a helpful weather assistant. Use the get_weather tool to answer questions.",
            model_client=client,
            tools=[get_weather],
            max_tool_iterations=3,
        )

        # Create a simple team
        team = RoundRobinGroupChat(
            participants=[agent],
            termination_condition=MaxMessageTermination(max_messages=5),
        )

        # Run the agent
        print("\nUser: What's the weather in New York?")
        result = await team.run(task="What's the weather in New York?")

        print("\n--- RESULT ---")
        for message in result.messages:
            print(f"{message.source}: {message.content}")

        print("\n[SUCCESS] TEST 1 PASSED - Single tool call successful")
        return True

    except Exception as e:
        print(f"\n[FAILED] TEST 1 FAILED - Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_multiple_tool_calls():
    """Test 2: Multiple sequential tool calls"""
    print("\n" + "=" * 80)
    print("TEST 2: Multiple Sequential Tool Calls")
    print("=" * 80)

    try:
        # Create client
        client = GeminiThoughtSignatureClient(
            temperature=0.7,
            max_tokens=2000,
        )

        # Create agent with multiple tools
        agent = AssistantAgent(
            name="MultiToolAgent",
            description="An agent with multiple tools",
            system_message="You are a helpful assistant with access to weather, calculator, and fun facts tools.",
            model_client=client,
            tools=[get_weather, calculate_sum, get_fun_fact],
            max_tool_iterations=5,  # Allow multiple iterations
        )

        # Create team
        team = RoundRobinGroupChat(
            participants=[agent],
            termination_condition=MaxMessageTermination(max_messages=10),
        )

        # Run with a task that requires multiple tool calls
        task = """
        Please do the following:
        1. Get the weather in Tokyo
        2. Calculate 15 + 27
        3. Tell me a fun fact about AI
        """

        print(f"\nUser: {task}")
        result = await team.run(task=task)

        print("\n--- RESULT ---")
        for message in result.messages:
            print(f"{message.source}: {message.content[:200]}...")

        print("\n[SUCCESS] TEST 2 PASSED - Multiple tool calls successful")
        return True

    except Exception as e:
        print(f"\n[FAILED] TEST 2 FAILED - Error: {e}")
        if "thought_signature" in str(e):
            print("[WARNING] This is the known thought_signature error!")
            print("The error occurred with multiple tool calls as expected.")
        import traceback
        traceback.print_exc()
        return False


async def test_conversation_with_tools():
    """Test 3: Multi-turn conversation with tools"""
    print("\n" + "=" * 80)
    print("TEST 3: Multi-turn Conversation with Tools")
    print("=" * 80)

    try:
        # Create client
        client = GeminiThoughtSignatureClient(
            temperature=0.7,
            max_tokens=2000,
        )

        # Create agent
        agent = AssistantAgent(
            name="ConversationAgent",
            description="An agent for multi-turn conversations",
            system_message="You are a helpful assistant. Use tools when needed and maintain context.",
            model_client=client,
            tools=[get_weather, calculate_sum],
            max_tool_iterations=3,
        )

        # Create team
        team = RoundRobinGroupChat(
            participants=[agent],
            termination_condition=MaxMessageTermination(max_messages=15),
        )

        # First turn
        print("\nTurn 1 - User: What's the weather in Paris?")
        result1 = await team.run(task="What's the weather in Paris?")
        print(f"Agent: {result1.messages[-1].content[:150]}...")

        # Second turn - this tests if context is maintained
        print("\nTurn 2 - User: Now calculate 100 + 250")
        result2 = await team.run(task="Now calculate 100 + 250")
        print(f"Agent: {result2.messages[-1].content[:150]}...")

        print("\n[SUCCESS] TEST 3 PASSED - Multi-turn conversation successful")
        return True

    except Exception as e:
        print(f"\n[FAILED] TEST 3 FAILED - Error: {e}")
        if "thought_signature" in str(e):
            print("[WARNING] thought_signature error in multi-turn conversation")
        import traceback
        traceback.print_exc()
        return False


async def test_without_tools():
    """Test 4: Agent without tools (baseline)"""
    print("\n" + "=" * 80)
    print("TEST 4: Agent Without Tools (Baseline)")
    print("=" * 80)

    try:
        # Create client
        client = GeminiThoughtSignatureClient(
            temperature=0.7,
            max_tokens=500,
        )

        # Create agent WITHOUT tools
        agent = AssistantAgent(
            name="SimpleAgent",
            description="A simple agent without tools",
            system_message="You are a helpful assistant.",
            model_client=client,
            tools=[],  # No tools
        )

        # Create team
        team = RoundRobinGroupChat(
            participants=[agent],
            termination_condition=MaxMessageTermination(max_messages=3),
        )

        # Simple question that doesn't need tools
        print("\nUser: What is Python programming language?")
        result = await team.run(task="What is Python programming language? Answer in one sentence.")

        print("\n--- RESULT ---")
        print(f"Agent: {result.messages[-1].content}")

        print("\n[SUCCESS] TEST 4 PASSED - Non-tool usage successful")
        return True

    except Exception as e:
        print(f"\n[FAILED] TEST 4 FAILED - Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("GEMINI THOUGHT SIGNATURE CLIENT - COMPREHENSIVE TEST SUITE")
    print("=" * 80)
    print("\nTesting GeminiThoughtSignatureClient with function calling")
    print("This test will verify if the client properly handles thought signatures")
    print("\n")

    results = []

    # Run all tests
    results.append(await test_basic_tool_call())
    results.append(await test_multiple_tool_calls())
    results.append(await test_conversation_with_tools())
    results.append(await test_without_tools())

    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(results)
    total = len(results)
    print(f"\nTests Passed: {passed}/{total}")

    if passed == total:
        print("\n[SUCCESS] ALL TESTS PASSED!")
        print("GeminiThoughtSignatureClient is working correctly")
    else:
        print(f"\n[WARNING] {total - passed} test(s) failed")
        print("This may indicate thought_signature issues with multiple tool calls")
        print("Consider reducing max_tool_iterations or using fewer tools")

    print("\n" + "=" * 80)

    return passed == total


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
