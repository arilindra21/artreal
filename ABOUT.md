# ArtReal

## Inspiration

Every developer knows the frustration: you have a perfect vision in your mind, but translating it into code takes hours of boilerplate, debugging, and iteration. We observed how people naturally communicate ideas — they **sketch** on whiteboards, **describe** in plain language, or **show** reference screenshots. Yet traditional development tools only accept one input: code.

When Google announced Gemini with its powerful multimodal capabilities, we saw an opportunity to bridge this gap. What if building software could be as natural as explaining your idea to a colleague?

**ArtReal was born from a simple belief**: the best interface for building software should match how humans naturally think and communicate.

## What it does

ArtReal is an AI-powered web development platform that transforms ideas into production-ready React applications through three intuitive input methods:

- **💬 Chat** — Describe what you want in plain English: *"Create a pricing page with 3 tiers"*
- **✏️ Sketch** — Drag and drop components on a visual canvas, connect elements, click generate
- **📸 Upload** — Share screenshots, mockups, or PDFs and watch AI recreate them in code

The platform features:
- **Live Preview** — See your app running instantly in the browser via WebContainers (no server needed)
- **Visual Editing** — Click any element in the preview to edit styles directly
- **Version Control** — Automatic Git commits for every AI change with one-click restore
- **Multi-Agent AI** — Specialized Planner and Coder agents collaborate for better results

## How we built it

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Monaco Editor for VS Code-quality code editing
- WebContainers (StackBlitz) for browser-native Node.js runtime
- Server-Sent Events (SSE) for real-time AI streaming
- React Query for state management

**Backend**: Python + FastAPI + SQLAlchemy
- Multi-agent orchestration with Planner → Coder workflow
- Google Gemini API for multimodal understanding and code generation
- Tool-based generation (create_file, edit_file, delete_file) for structured outputs
- Filesystem + Git integration for version control

**Key Architecture Decisions**:
1. **Streaming responses** — Users see AI "thinking" in real-time, creating transparency
2. **Context injection** — Every request includes project structure and conversation history
3. **Browser-based preview** — WebContainers eliminate server-side compute for previews
4. **Automatic commits** — Every AI change is versioned, enabling easy rollbacks

## Challenges we ran into

1. **WebContainer Compatibility** — Next.js 15+ uses Turbopack which requires native bindings unavailable in WASM. We built an auto-fix system that detects and downgrades Next.js only in the preview while preserving user's original code.

2. **Context Persistence** — Early versions produced inconsistent code because each request was independent. We implemented context injection that includes project files and conversation history with every AI call.

3. **Dependency Caching** — Navigation between projects caused full page reloads, requiring fresh npm installs (30-60 seconds). We switched to client-side routing to preserve the WebContainer instance and implemented smart dependency diffing.

4. **Streaming Complex Agents** — Multi-agent systems produce output in unpredictable chunks. We designed a structured SSE protocol with event types (thought, tool_call, tool_response) so the frontend can render each appropriately.

5. **Image-to-Code Quality** — Initial screenshot-to-code attempts produced visually similar but poorly structured results. We iterated on prompts 50+ times to focus on semantic structure, component decomposition, and accessibility.

## Accomplishments that we're proud of

- **Zero-config preview** — Users see their app running instantly without any setup, thanks to WebContainers running Node.js directly in the browser

- **Multimodal input** — True flexibility in how users express ideas: chat, sketch, or upload images

- **Real-time collaboration with AI** — Streaming responses show the AI thinking process, making it feel like pair programming

- **Automatic version control** — Every change is committed with AI-generated messages, enabling confident experimentation

- **Smart compatibility fixes** — The system automatically handles framework compatibility issues without user intervention

- **Sub-second hot reload** — Changes appear instantly in the preview with Vite HMR

## What we learned

1. **Multimodal AI is transformative** — Gemini's ability to understand images alongside text enables use cases we hadn't imagined, like recreating designs from screenshots

2. **Agents > Single prompts** — Decomposing tasks across specialized agents (Planner, Coder) dramatically improves output quality and consistency

3. **Context is everything** — AI without project context produces generic code; with context, it produces code that fits perfectly in your codebase

4. **Browser capabilities have evolved** — WebContainers prove that full development environments can run entirely client-side, eliminating infrastructure complexity

5. **UX matters as much as AI** — The best AI means nothing if users can't interact with it naturally; streaming, visual editing, and intuitive inputs are crucial

## What's next for ArtReal

- **Collaborative editing** — Multiple users working on the same project in real-time
- **Component marketplace** — Share and reuse AI-generated components across projects
- **One-click deployment** — Direct integration with Vercel, Netlify, and other platforms
- **Mobile app generation** — Extend to React Native for iOS/Android development
- **Design system import** — Import components and styles from Figma or Sketch
- **More framework support** — Vue, Svelte, and other popular frameworks

---

*Built with ❤️ for the Gemini API Developer Competition*
