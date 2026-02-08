# ArtReal Backend

The Python FastAPI backend for ArtReal - AI-Powered Web Development Platform with Sketch-to-App Technology.

## Tech Stack

- **FastAPI 0.109** - High-performance async web framework
- **SQLAlchemy 2.0** - Database ORM with SQLite
- **Microsoft AutoGen** - Multi-agent AI orchestration
- **Google Gemini 3** - AI model for code generation
- **Git** - Built-in version control for projects
- **WebContainers** - Browser-based Node.js runtime support

## Architecture

### Multi-Agent System

The backend uses Microsoft AutoGen to orchestrate specialized AI agents:

```
User Request
     ↓
┌────────────────────────────────────────┐
│         Agent Orchestrator             │
│                                        │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ Architect│→ │   UI Designer    │   │
│  └──────────┘  └──────────────────┘   │
│       ↓                ↓              │
│  ┌──────────┐  ┌──────────────────┐   │
│  │  Coder   │→ │  Code Reviewer   │   │
│  └──────────┘  └──────────────────┘   │
└────────────────────────────────────────┘
     ↓
Generated React Code
```

**Agent Roles:**
- **Architect** - Plans system structure and component hierarchy
- **UI Designer** - Designs interfaces with Tailwind CSS
- **Coder** - Generates TypeScript/React code
- **Code Reviewer** - Validates code quality and best practices

### Directory Structure

```
backend/
├── app/
│   ├── agents/          # AI agent system
│   │   ├── orchestrator.py
│   │   └── config.py
│   ├── api/             # REST endpoints
│   │   ├── projects.py
│   │   ├── chat.py
│   │   └── files.py
│   ├── services/        # Business logic
│   │   ├── project_service.py
│   │   ├── chat_service.py
│   │   ├── filesystem_service.py
│   │   └── git_service.py
│   ├── models/          # SQLAlchemy models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── file.py
│   │   └── chat.py
│   ├── core/            # Config & utilities
│   │   └── config.py
│   └── db/              # Database setup
│       └── database.py
├── projects/            # Generated project files
│   └── project_{id}/    # Each project directory
├── tests/               # API tests
├── requirements.txt
├── run.py               # Entry point
└── init_db.py           # Database initialization
```

## Getting Started

### Prerequisites

- Python 3.8+
- Google AI API Key (for Gemini 3)

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

### Initialize Database

```bash
python init_db.py
```

### Run Development Server

```bash
python run.py
```

The API will be available at http://localhost:8000

API documentation: http://localhost:8000/docs

## API Endpoints

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/projects` | Create new project |
| GET | `/api/v1/projects` | List all projects |
| GET | `/api/v1/projects/{id}` | Get project details |
| PUT | `/api/v1/projects/{id}` | Update project |
| DELETE | `/api/v1/projects/{id}` | Delete project |
| GET | `/api/v1/projects/{id}/bundle` | Get WebContainer bundle |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects/{id}/files` | List project files |
| POST | `/api/v1/projects/{id}/files` | Create file |
| PUT | `/api/v1/projects/{id}/files/{file_id}` | Update file |
| DELETE | `/api/v1/projects/{id}/files/{file_id}` | Delete file |

### Chat (AI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat/{project_id}` | Send message to AI |
| GET | `/api/v1/chat/{project_id}/sessions` | List chat sessions |
| GET | `/api/v1/chat/{project_id}/sessions/{id}` | Get session history |

### Git
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects/{id}/git/history` | Get commit history |
| POST | `/api/v1/projects/{id}/git/restore` | Restore to commit |

## Environment Variables

Create a `.env` file:

```env
# Required
GOOGLE_API_KEY=your_api_key_here

# Optional
DEBUG=True
DATABASE_URL=sqlite:///./artreal.db
SECRET_KEY=your-secret-key
AUTOGEN_MAX_ROUND=10
```

## File Storage System

ArtReal uses a hybrid storage approach:

1. **SQLite Database** - Stores file metadata only
2. **Filesystem** - Stores actual file content
3. **Git Repositories** - Each project is a Git repo

**Project files location:** `backend/projects/project_{id}/`

Each project includes:
- Complete Vite + React + TypeScript setup
- Tailwind CSS configuration
- Git repository for version control

## Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/
```

## Production Deployment

For production deployment with Nginx and SSL:

```bash
# Install gunicorn
pip install gunicorn

# Run with multiple workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for full deployment guide.

## Key Features

- **Sketch-to-App**: Convert visual wireframes to React code
- **Multi-Agent AI**: Collaborative code generation
- **Real-time Chat**: Natural language to code
- **Version Control**: Built-in Git for every project
- **WebContainers**: Browser-based preview support
- **File Management**: Full CRUD for project files

## License

MIT License
