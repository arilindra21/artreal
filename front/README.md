# ArtReal Frontend

The frontend application for ArtReal - AI-Powered Web Development Platform with Sketch-to-App Technology.

## Tech Stack

- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool with HMR
- **Tailwind CSS 3.4** - Utility-first styling
- **shadcn/ui** - Radix-based UI components
- **Monaco Editor** - Code editing
- **TanStack Query** - Data fetching
- **WebContainers API** - Browser-based Node.js

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs on http://localhost:8080

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
front/
├── src/
│   ├── components/
│   │   ├── editor/        # Editor components
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── SketchCanvas.tsx    # Sketch-to-App
│   │   │   ├── SketchToolbar.tsx
│   │   │   ├── SketchElement.tsx
│   │   │   └── ...
│   │   └── ui/            # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx      # Landing page
│   │   ├── Editor.tsx     # Main editor
│   │   └── Projects.tsx   # Project list
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── lib/               # Utilities
├── public/                # Static assets
└── index.html
```

## Features

- **Sketch Canvas** - Visual wireframe builder
- **AI Chat** - Natural language to code
- **Monaco Editor** - Professional code editing
- **Live Preview** - WebContainer-based execution
- **File Explorer** - Project file management
- **Git Integration** - Version control UI
