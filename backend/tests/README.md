# ArtReal Backend Tests

Automated tests for the ArtReal FastAPI backend.

## Setup

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install test dependencies
pip install pytest pytest-asyncio httpx
```

## Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v

# Run specific test class
pytest tests/test_api.py::TestProjectAPI

# Run specific test
pytest tests/test_api.py::TestProjectAPI::test_create_project

# Run with coverage
pytest --cov=app tests/
```

## Test Coverage

### Project API Tests
- `test_create_project` - Creating new projects
- `test_list_projects` - Listing all projects
- `test_get_project` - Getting a specific project
- `test_update_project` - Updating project details
- `test_delete_project` - Deleting projects

### File API Tests
- `test_create_file` - Creating files in a project
- `test_list_files` - Listing files in a project
- `test_update_file` - Updating file content
- `test_delete_file` - Deleting files

### Chat API Tests
- `test_send_message` - Sending messages to AI (requires GOOGLE_API_KEY)
- `test_list_sessions` - Listing chat sessions

### Health Check Tests
- `test_root_endpoint` - API root endpoint
- `test_docs_available` - Swagger documentation
- `test_openapi_spec` - OpenAPI specification

## Test Database

Tests use a separate SQLite database (`artreal_test.db`) to avoid affecting development data.

## Important Notes

- Some tests require `GOOGLE_API_KEY` to be configured
- Tests create a mock user (ID: 1) for testing
- Use `pytest -v` for verbose output to debug failures
- Run `pytest --cov=app` to see code coverage

## Continuous Integration

Example GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio httpx pytest-cov
      - name: Run tests
        run: pytest backend/tests/ -v --cov=app
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
```

## Writing New Tests

```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_example():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
```

## Test Structure

```
tests/
├── __init__.py
├── conftest.py      # Shared fixtures
├── test_api.py      # API endpoint tests
├── test_services.py # Service layer tests
└── test_agents.py   # AI agent tests
```
