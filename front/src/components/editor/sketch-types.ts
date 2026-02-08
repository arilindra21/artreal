// Sketch-to-App Feature Types

export type SketchElementType =
  | 'navbar'
  | 'hero'
  | 'card'
  | 'button'
  | 'input'
  | 'text'
  | 'image'
  | 'list'
  | 'form'
  | 'footer'
  | 'sidebar'
  | 'modal'
  | 'section';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface SketchElement {
  id: string;
  type: SketchElementType;
  position: Position;
  size: Size;
  label: string;
  properties: Record<string, any>;
  zIndex: number;
  aiDetails?: string; // AI-generated detailed description for this element
}

export type ConnectionType = 'flow' | 'data' | 'navigation';

export interface SketchConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  type: ConnectionType;
}

export interface SketchCanvasData {
  elements: SketchElement[];
  connections: SketchConnection[];
  canvasSize: Size;
  gridSize: number;
}

// Element type configurations for the toolbar
export interface ElementConfig {
  type: SketchElementType;
  label: string;
  icon: string;
  defaultSize: Size;
  description: string;
}

export const ELEMENT_CONFIGS: ElementConfig[] = [
  {
    type: 'navbar',
    label: 'Navbar',
    icon: 'Menu',
    defaultSize: { width: 800, height: 80 },
    description: 'Navigation bar with logo and menu'
  },
  {
    type: 'hero',
    label: 'Hero',
    icon: 'Sparkles',
    defaultSize: { width: 800, height: 300 },
    description: 'Large hero section with heading'
  },
  {
    type: 'card',
    label: 'Card',
    icon: 'Square',
    defaultSize: { width: 320, height: 240 },
    description: 'Content card with title and body'
  },
  {
    type: 'button',
    label: 'Button',
    icon: 'MousePointer',
    defaultSize: { width: 200, height: 60 },
    description: 'Clickable button element'
  },
  {
    type: 'input',
    label: 'Input',
    icon: 'Type',
    defaultSize: { width: 360, height: 60 },
    description: 'Text input field'
  },
  {
    type: 'text',
    label: 'Text',
    icon: 'AlignLeft',
    defaultSize: { width: 400, height: 80 },
    description: 'Text block or paragraph'
  },
  {
    type: 'image',
    label: 'Image',
    icon: 'Image',
    defaultSize: { width: 400, height: 280 },
    description: 'Image placeholder'
  },
  {
    type: 'list',
    label: 'List',
    icon: 'List',
    defaultSize: { width: 320, height: 200 },
    description: 'List of items'
  },
  {
    type: 'form',
    label: 'Form',
    icon: 'FileText',
    defaultSize: { width: 480, height: 400 },
    description: 'Form container with inputs'
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: 'Minus',
    defaultSize: { width: 800, height: 100 },
    description: 'Page footer section'
  },
  {
    type: 'sidebar',
    label: 'Sidebar',
    icon: 'PanelLeft',
    defaultSize: { width: 240, height: 500 },
    description: 'Vertical sidebar navigation'
  },
  {
    type: 'section',
    label: 'Section',
    icon: 'LayoutGrid',
    defaultSize: { width: 800, height: 300 },
    description: 'Generic section container'
  }
];

// Helper function to get element config by type
export const getElementConfig = (type: SketchElementType): ElementConfig | undefined => {
  return ELEMENT_CONFIGS.find(config => config.type === type);
};

// Helper function to create a new element
export const createSketchElement = (
  type: SketchElementType,
  position: Position,
  existingElements: SketchElement[]
): SketchElement => {
  const config = getElementConfig(type);
  const maxZIndex = existingElements.length > 0
    ? Math.max(...existingElements.map(e => e.zIndex))
    : 0;

  return {
    id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    position,
    size: config?.defaultSize || { width: 150, height: 100 },
    label: config?.label || type,
    properties: {},
    zIndex: maxZIndex + 1
  };
};

// Helper function to create a connection
export const createSketchConnection = (
  fromId: string,
  toId: string,
  type: ConnectionType = 'flow'
): SketchConnection => {
  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fromId,
    toId,
    type
  };
};

// Snap position to grid
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// Template interface
export interface SketchTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'landing' | 'dashboard' | 'form' | 'ecommerce' | 'blog';
  elements: Omit<SketchElement, 'id'>[];
  connections: Omit<SketchConnection, 'id' | 'fromId' | 'toId'> & { fromIndex: number; toIndex: number }[];
}

// Pre-built templates - Centered for 1400x900 canvas
export const SKETCH_TEMPLATES: SketchTemplate[] = [
  {
    id: 'landing-basic',
    name: 'Basic Landing Page',
    description: 'Simple landing page with hero, features, and footer',
    icon: 'Rocket',
    category: 'landing',
    elements: [
      { type: 'navbar', position: { x: 100, y: 40 }, size: { width: 1200, height: 80 }, label: 'Navigation', properties: {}, zIndex: 1 },
      { type: 'hero', position: { x: 100, y: 140 }, size: { width: 1200, height: 280 }, label: 'Hero Section', properties: {}, zIndex: 2 },
      { type: 'card', position: { x: 100, y: 440 }, size: { width: 380, height: 200 }, label: 'Feature 1', properties: {}, zIndex: 3 },
      { type: 'card', position: { x: 510, y: 440 }, size: { width: 380, height: 200 }, label: 'Feature 2', properties: {}, zIndex: 4 },
      { type: 'card', position: { x: 920, y: 440 }, size: { width: 380, height: 200 }, label: 'Feature 3', properties: {}, zIndex: 5 },
      { type: 'footer', position: { x: 100, y: 680 }, size: { width: 1200, height: 100 }, label: 'Footer', properties: {}, zIndex: 6 },
    ],
    connections: []
  },
  {
    id: 'landing-cta',
    name: 'Landing with CTA',
    description: 'Landing page with call-to-action and testimonials',
    icon: 'Megaphone',
    category: 'landing',
    elements: [
      { type: 'navbar', position: { x: 100, y: 40 }, size: { width: 1200, height: 80 }, label: 'Navigation', properties: {}, zIndex: 1 },
      { type: 'hero', position: { x: 100, y: 140 }, size: { width: 760, height: 300 }, label: 'Hero Content', properties: {}, zIndex: 2 },
      { type: 'form', position: { x: 900, y: 140 }, size: { width: 400, height: 300 }, label: 'Signup Form', properties: {}, zIndex: 3 },
      { type: 'section', position: { x: 100, y: 460 }, size: { width: 1200, height: 80 }, label: 'Trusted By', properties: {}, zIndex: 4 },
      { type: 'card', position: { x: 100, y: 560 }, size: { width: 380, height: 180 }, label: 'Testimonial 1', properties: {}, zIndex: 5 },
      { type: 'card', position: { x: 510, y: 560 }, size: { width: 380, height: 180 }, label: 'Testimonial 2', properties: {}, zIndex: 6 },
      { type: 'card', position: { x: 920, y: 560 }, size: { width: 380, height: 180 }, label: 'Testimonial 3', properties: {}, zIndex: 7 },
    ],
    connections: [
      { fromIndex: 1, toIndex: 2, type: 'navigation', label: 'Get Started' }
    ]
  },
  {
    id: 'dashboard-basic',
    name: 'Admin Dashboard',
    description: 'Dashboard with sidebar, stats cards, and data table',
    icon: 'LayoutDashboard',
    category: 'dashboard',
    elements: [
      { type: 'sidebar', position: { x: 40, y: 40 }, size: { width: 240, height: 820 }, label: 'Sidebar Menu', properties: {}, zIndex: 1 },
      { type: 'navbar', position: { x: 300, y: 40 }, size: { width: 1060, height: 80 }, label: 'Header Bar', properties: {}, zIndex: 2 },
      { type: 'card', position: { x: 300, y: 140 }, size: { width: 340, height: 140 }, label: 'Total Users', properties: {}, zIndex: 3 },
      { type: 'card', position: { x: 660, y: 140 }, size: { width: 340, height: 140 }, label: 'Revenue', properties: {}, zIndex: 4 },
      { type: 'card', position: { x: 1020, y: 140 }, size: { width: 340, height: 140 }, label: 'Orders', properties: {}, zIndex: 5 },
      { type: 'section', position: { x: 300, y: 300 }, size: { width: 700, height: 280 }, label: 'Chart Area', properties: {}, zIndex: 6 },
      { type: 'list', position: { x: 1020, y: 300 }, size: { width: 340, height: 280 }, label: 'Activity Feed', properties: {}, zIndex: 7 },
      { type: 'section', position: { x: 300, y: 600 }, size: { width: 1060, height: 200 }, label: 'Data Table', properties: {}, zIndex: 8 },
    ],
    connections: []
  },
  {
    id: 'login-form',
    name: 'Login Page',
    description: 'Clean login form with social auth options',
    icon: 'LogIn',
    category: 'form',
    elements: [
      { type: 'image', position: { x: 520, y: 80 }, size: { width: 360, height: 100 }, label: 'Logo', properties: {}, zIndex: 1 },
      { type: 'text', position: { x: 470, y: 200 }, size: { width: 460, height: 60 }, label: 'Welcome Back', properties: {}, zIndex: 2 },
      { type: 'input', position: { x: 470, y: 280 }, size: { width: 460, height: 60 }, label: 'Email Input', properties: {}, zIndex: 3 },
      { type: 'input', position: { x: 470, y: 360 }, size: { width: 460, height: 60 }, label: 'Password Input', properties: {}, zIndex: 4 },
      { type: 'button', position: { x: 470, y: 440 }, size: { width: 460, height: 60 }, label: 'Sign In Button', properties: {}, zIndex: 5 },
      { type: 'text', position: { x: 570, y: 520 }, size: { width: 260, height: 40 }, label: 'Or continue with', properties: {}, zIndex: 6 },
      { type: 'button', position: { x: 470, y: 580 }, size: { width: 220, height: 60 }, label: 'Google', properties: {}, zIndex: 7 },
      { type: 'button', position: { x: 710, y: 580 }, size: { width: 220, height: 60 }, label: 'GitHub', properties: {}, zIndex: 8 },
      { type: 'text', position: { x: 520, y: 660 }, size: { width: 360, height: 40 }, label: 'Create Account Link', properties: {}, zIndex: 9 },
    ],
    connections: [
      { fromIndex: 4, toIndex: 0, type: 'navigation', label: 'Login Success' }
    ]
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Contact page with form and info section',
    icon: 'Mail',
    category: 'form',
    elements: [
      { type: 'navbar', position: { x: 100, y: 40 }, size: { width: 1200, height: 80 }, label: 'Navigation', properties: {}, zIndex: 1 },
      { type: 'text', position: { x: 100, y: 140 }, size: { width: 1200, height: 80 }, label: 'Contact Us Header', properties: {}, zIndex: 2 },
      { type: 'section', position: { x: 100, y: 240 }, size: { width: 540, height: 400 }, label: 'Contact Info', properties: {}, zIndex: 3 },
      { type: 'form', position: { x: 680, y: 240 }, size: { width: 620, height: 400 }, label: 'Contact Form', properties: {}, zIndex: 4 },
      { type: 'footer', position: { x: 100, y: 680 }, size: { width: 1200, height: 100 }, label: 'Footer', properties: {}, zIndex: 5 },
    ],
    connections: []
  },
  {
    id: 'ecommerce-product',
    name: 'Product Page',
    description: 'E-commerce product detail page',
    icon: 'ShoppingBag',
    category: 'ecommerce',
    elements: [
      { type: 'navbar', position: { x: 100, y: 40 }, size: { width: 1200, height: 80 }, label: 'Store Header', properties: {}, zIndex: 1 },
      { type: 'image', position: { x: 100, y: 140 }, size: { width: 580, height: 440 }, label: 'Product Image', properties: {}, zIndex: 2 },
      { type: 'text', position: { x: 720, y: 140 }, size: { width: 580, height: 60 }, label: 'Product Title', properties: {}, zIndex: 3 },
      { type: 'text', position: { x: 720, y: 220 }, size: { width: 300, height: 50 }, label: 'Price', properties: {}, zIndex: 4 },
      { type: 'text', position: { x: 720, y: 290 }, size: { width: 580, height: 120 }, label: 'Description', properties: {}, zIndex: 5 },
      { type: 'list', position: { x: 720, y: 430 }, size: { width: 300, height: 80 }, label: 'Size Options', properties: {}, zIndex: 6 },
      { type: 'button', position: { x: 720, y: 530 }, size: { width: 300, height: 60 }, label: 'Add to Cart', properties: {}, zIndex: 7 },
      { type: 'section', position: { x: 100, y: 620 }, size: { width: 1200, height: 180 }, label: 'Related Products', properties: {}, zIndex: 8 },
    ],
    connections: [
      { fromIndex: 6, toIndex: 0, type: 'data', label: 'Add Item' }
    ]
  },
  {
    id: 'blog-post',
    name: 'Blog Article',
    description: 'Blog post layout with sidebar',
    icon: 'FileText',
    category: 'blog',
    elements: [
      { type: 'navbar', position: { x: 100, y: 40 }, size: { width: 1200, height: 80 }, label: 'Blog Header', properties: {}, zIndex: 1 },
      { type: 'image', position: { x: 100, y: 140 }, size: { width: 820, height: 240 }, label: 'Featured Image', properties: {}, zIndex: 2 },
      { type: 'text', position: { x: 100, y: 400 }, size: { width: 820, height: 60 }, label: 'Article Title', properties: {}, zIndex: 3 },
      { type: 'text', position: { x: 100, y: 480 }, size: { width: 820, height: 240 }, label: 'Article Content', properties: {}, zIndex: 4 },
      { type: 'card', position: { x: 960, y: 140 }, size: { width: 340, height: 160 }, label: 'Author Card', properties: {}, zIndex: 5 },
      { type: 'list', position: { x: 960, y: 320 }, size: { width: 340, height: 200 }, label: 'Related Posts', properties: {}, zIndex: 6 },
      { type: 'section', position: { x: 960, y: 540 }, size: { width: 340, height: 160 }, label: 'Newsletter', properties: {}, zIndex: 7 },
      { type: 'footer', position: { x: 100, y: 760 }, size: { width: 1200, height: 80 }, label: 'Footer', properties: {}, zIndex: 8 },
    ],
    connections: []
  },
  {
    id: 'pricing-page',
    name: 'Pricing Page',
    description: 'Pricing plans comparison layout',
    icon: 'CreditCard',
    category: 'landing',
    elements: [
      { type: 'navbar', position: { x: 100, y: 40 }, size: { width: 1200, height: 80 }, label: 'Navigation', properties: {}, zIndex: 1 },
      { type: 'text', position: { x: 100, y: 140 }, size: { width: 1200, height: 100 }, label: 'Pricing Header', properties: {}, zIndex: 2 },
      { type: 'card', position: { x: 100, y: 260 }, size: { width: 380, height: 360 }, label: 'Basic Plan', properties: {}, zIndex: 3 },
      { type: 'card', position: { x: 510, y: 240 }, size: { width: 380, height: 400 }, label: 'Pro Plan (Popular)', properties: {}, zIndex: 4 },
      { type: 'card', position: { x: 920, y: 260 }, size: { width: 380, height: 360 }, label: 'Enterprise Plan', properties: {}, zIndex: 5 },
      { type: 'section', position: { x: 100, y: 680 }, size: { width: 1200, height: 140 }, label: 'FAQ Section', properties: {}, zIndex: 6 },
    ],
    connections: []
  }
];

// Helper to convert template to canvas elements with unique IDs
export const applyTemplate = (template: SketchTemplate): { elements: SketchElement[]; connections: SketchConnection[] } => {
  const timestamp = Date.now();
  const elementIds: string[] = [];

  const elements = template.elements.map((el, index) => {
    const id = `element-${timestamp}-${index}-${Math.random().toString(36).substr(2, 5)}`;
    elementIds.push(id);
    return { ...el, id };
  });

  const connections = template.connections.map((conn, index) => ({
    id: `conn-${timestamp}-${index}-${Math.random().toString(36).substr(2, 5)}`,
    fromId: elementIds[conn.fromIndex],
    toId: elementIds[conn.toIndex],
    type: conn.type,
    label: conn.label,
  }));

  return { elements, connections };
};

// Build prompt for AI from sketch data
export const buildSketchPrompt = (canvas: SketchCanvasData, componentName?: string): string => {
  const sortedElements = [...canvas.elements].sort((a, b) => {
    // Sort by Y position first (top to bottom), then X (left to right)
    if (Math.abs(a.position.y - b.position.y) < 50) {
      return a.position.x - b.position.x;
    }
    return a.position.y - b.position.y;
  });

  // Build element descriptions with AI details if available
  const elements = sortedElements.map(el => {
    let description = `- ${el.type.toUpperCase()} "${el.label}" at position (${el.position.x}, ${el.position.y}), size ${el.size.width}x${el.size.height}px`;
    if (el.aiDetails) {
      description += `\n  AI Details: ${el.aiDetails}`;
    }
    return description;
  }).join('\n');

  // Count elements with AI details
  const elementsWithAiDetails = sortedElements.filter(el => el.aiDetails).length;

  const connections = canvas.connections.map(conn => {
    const from = canvas.elements.find(e => e.id === conn.fromId);
    const to = canvas.elements.find(e => e.id === conn.toId);
    return `- "${from?.label || 'Unknown'}" → "${to?.label || 'Unknown'}" (${conn.type}${conn.label ? `: ${conn.label}` : ''})`;
  }).join('\n');

  // Infer component purpose from elements
  const hasForm = sortedElements.some(el => el.type === 'form' || el.type === 'input');
  const hasNavbar = sortedElements.some(el => el.type === 'navbar');
  const hasHero = sortedElements.some(el => el.type === 'hero');
  const hasCards = sortedElements.filter(el => el.type === 'card').length;
  const hasSidebar = sortedElements.some(el => el.type === 'sidebar');
  const hasModal = sortedElements.some(el => el.type === 'modal');

  // Detect likely page type
  let pageTypeHint = '';
  const labels = sortedElements.map(el => el.label.toLowerCase()).join(' ');

  if (labels.includes('login') || labels.includes('sign in') || labels.includes('email') && labels.includes('password')) {
    pageTypeHint = 'This appears to be a LOGIN/AUTHENTICATION page.';
  } else if (labels.includes('register') || labels.includes('sign up') || labels.includes('create account')) {
    pageTypeHint = 'This appears to be a REGISTRATION/SIGNUP page.';
  } else if (labels.includes('dashboard') || hasSidebar) {
    pageTypeHint = 'This appears to be a DASHBOARD page.';
  } else if (labels.includes('contact') || labels.includes('message')) {
    pageTypeHint = 'This appears to be a CONTACT page.';
  } else if (labels.includes('pricing') || labels.includes('plan')) {
    pageTypeHint = 'This appears to be a PRICING page.';
  } else if (hasHero && hasCards) {
    pageTypeHint = 'This appears to be a LANDING page.';
  } else if (labels.includes('profile') || labels.includes('settings')) {
    pageTypeHint = 'This appears to be a PROFILE/SETTINGS page.';
  }

  return `[SKETCH-TO-APP] Generate a React component based on this wireframe layout:
${componentName ? `\n## Component Name: ${componentName}` : ''}
${pageTypeHint ? `\n## Page Type Detection:\n${pageTypeHint}` : ''}

## Layout Elements (positioned from top-left):
${elements || '- No elements added'}
${elementsWithAiDetails > 0 ? `\n(${elementsWithAiDetails} elements have AI-enhanced details - IMPORTANT: Follow the AI Details specifications closely!)` : ''}

## Connections/Flow:
${connections || '- No connections defined'}

## Canvas Info:
- Canvas size: ${canvas.canvasSize.width}x${canvas.canvasSize.height}px
- Grid size: ${canvas.gridSize}px

## CRITICAL - Project Integration Instructions:

### Step 1: Analyze Existing Project
BEFORE writing any code, you MUST:
1. Read the existing App.tsx to understand current routing structure
2. Read existing components (especially pages) to match the design system
3. Check for existing color schemes, fonts, spacing patterns in index.css or tailwind.config
4. Look for shared components that can be reused (buttons, inputs, cards, etc.)

### Step 2: Match Design Consistency
- Use the SAME color palette as existing components
- Match the typography style (font sizes, weights)
- Use consistent spacing (padding, margins, gaps)
- Follow the same component patterns (how buttons, forms, cards are styled)
- If the project uses shadcn/ui components, use the same components

### Step 3: Implement the Component
1. Create React components that match the exact layout positions and hierarchy
2. Use Tailwind CSS for styling - MATCH the existing project's style
3. Implement any connections as navigation links, form submissions, or data flow
4. Make the layout responsive while maintaining the relative positions
5. Use semantic HTML elements where appropriate
6. Follow the element labels for content and purpose
7. Add appropriate hover states and transitions for interactive elements
8. **AI Details are PRIORITY**: When an element has "AI Details", use those specifications as the primary guide for:
   - Visual styling (colors, animations, effects)
   - Content structure (what elements to include)
   - Interactive behaviors (hover effects, click actions)
   - Layout choices (how to arrange content within the element)

### Step 4: Integrate with App
1. Add the new component/page to App.tsx routing (if it's a page)
2. Add navigation links from existing pages if needed
3. Export the component properly

### Example Integration Flow:
- If this is a Login page: Add route "/login" in App.tsx, add "Login" link in navbar
- If this is a Dashboard: Add route "/dashboard", may need protected route
- If this is a component: Export from src/components/ and import where needed`;
};
