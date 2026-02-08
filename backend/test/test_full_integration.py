"""
Full integration test for Gemini-3 Flash with the complete application stack
Tests that all components work together with the new Gemini configuration
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


async def test_config_loading():
    """Test that configuration loads correctly with Gemini settings"""
    print("=" * 60)
    print("Test 1: Configuration Loading")
    print("=" * 60)

    try:
        from app.core.config import settings

        assert hasattr(settings, "GEMINI_API_KEY"), "GEMINI_API_KEY not found in settings"
        assert hasattr(settings, "GEMINI_MODEL"), "GEMINI_MODEL not found in settings"
        assert hasattr(settings, "GEMINI_API_BASE_URL"), "GEMINI_API_BASE_URL not found in settings"

        print(f"\n[SUCCESS] Configuration loaded:")
        print(f"  Model: {settings.GEMINI_MODEL}")
        print(f"  Base URL: {settings.GEMINI_API_BASE_URL}")
        print(f"  API Key configured: {'Yes' if settings.GEMINI_API_KEY else 'No'}")

        return True

    except Exception as e:
        print(f"\n[ERROR] Configuration test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


async def test_orchestrator_initialization():
    """Test that the orchestrator initializes correctly with Gemini"""
    print("\n" + "=" * 60)
    print("Test 2: Orchestrator Initialization")
    print("=" * 60)

    try:
        from app.agents.orchestrator import AgentOrchestrator

        print("\nInitializing orchestrator...")
        orchestrator = AgentOrchestrator()

        # Check that model client is configured
        assert orchestrator.model_client is not None, "Model client not initialized"

        print("\n[SUCCESS] Orchestrator initialized successfully")
        print(f"  Coder agent: {orchestrator.coder_agent.name}")
        print(f"  Planner agent: {orchestrator.planning_agent.name}")

        # Clean up
        await orchestrator.close()

        return True

    except Exception as e:
        print(f"\n[ERROR] Orchestrator test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


async def test_simple_agent_interaction():
    """Test a simple interaction with the Gemini-powered agent"""
    print("\n" + "=" * 60)
    print("Test 3: Simple Agent Interaction")
    print("=" * 60)

    try:
        from app.agents.orchestrator import AgentOrchestrator
        from autogen_agentchat.messages import TextMessage

        orchestrator = AgentOrchestrator()

        print("\nSending simple request to agent team...")

        # Create a simple request
        message = TextMessage(content="Hello! Please respond with 'Test successful'", source="user")

        # Run the team
        result = await orchestrator.main_team.run(task=message)

        print("\n" + "-" * 60)
        print("AGENT RESPONSE:")
        print("-" * 60)

        # Get the last message
        if hasattr(result, "messages") and result.messages:
            last_message = result.messages[-1]
            print(f"From: {last_message.source}")
            print(f"Content: {last_message.content}")
        else:
            print("No messages in result")

        print("-" * 60)

        # Clean up
        await orchestrator.close()

        print("\n[SUCCESS] Agent interaction completed")

        return True

    except Exception as e:
        print(f"\n[ERROR] Agent interaction test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


async def test_project_metadata_generation():
    """Test the project metadata generation endpoint logic"""
    print("\n" + "=" * 60)
    print("Test 4: Project Metadata Generation")
    print("=" * 60)

    try:
        import httpx
        from autogen_core.models import SystemMessage, UserMessage

        from app.core.gemini_client import Gemini3FlashChatCompletionClient

        http_client = httpx.AsyncClient()

        # Use centralized client
        client = Gemini3FlashChatCompletionClient(http_client=http_client)

        system_prompt = """Generate project metadata as JSON with 'name' and 'description' fields."""
        user_prompt = "Create a weather app with real-time updates"

        messages = [SystemMessage(content=system_prompt), UserMessage(content=user_prompt, source="user")]

        print(f"\nGenerating metadata for: '{user_prompt}'")

        result = await client.create(messages)

        print("\n" + "-" * 60)
        print("GENERATED METADATA:")
        print("-" * 60)
        print(result.content)
        print("-" * 60)

        await http_client.aclose()

        print("\n[SUCCESS] Metadata generation completed")

        return True

    except Exception as e:
        print(f"\n[ERROR] Metadata generation test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


async def main():
    """Run all integration tests"""
    print("\n" + "=" * 70)
    print(" GEMINI-3 FLASH FULL INTEGRATION TEST SUITE")
    print("=" * 70 + "\n")

    results = []

    # Run tests
    results.append(("Configuration Loading", await test_config_loading()))
    results.append(("Orchestrator Initialization", await test_orchestrator_initialization()))
    results.append(("Simple Agent Interaction", await test_simple_agent_interaction()))
    results.append(("Project Metadata Generation", await test_project_metadata_generation()))

    # Summary
    print("\n" + "=" * 70)
    print(" TEST SUMMARY")
    print("=" * 70)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {test_name}")

    print("-" * 70)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 70)

    if passed == total:
        print("\n[SUCCESS] All integration tests passed!")
        print("Gemini-3 Flash is fully integrated and working correctly.\n")
        sys.exit(0)
    else:
        print(f"\n[FAILURE] {total - passed} test(s) failed.\n")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
