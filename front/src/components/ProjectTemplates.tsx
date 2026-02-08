import { useState } from 'react';
import {
  X,
  Sparkles,
  ShoppingCart,
  LayoutDashboard,
  FileText,
  User,
  Briefcase,
  Newspaper,
  MessageSquare,
  Calendar,
  CheckSquare,
  Image,
  Music,
  Utensils,
  Plane,
  Dumbbell,
  GraduationCap,
  Heart,
  Zap
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'popular' | 'business' | 'creative' | 'productivity';
  prompt: string;
  preview?: string;
  tags: string[];
}

interface ProjectTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (prompt: string, templateName: string) => void;
}

const templates: Template[] = [
  // Popular
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Modern landing page with hero, features, testimonials, and CTA sections',
    icon: <Sparkles className="w-6 h-6" />,
    category: 'popular',
    prompt: 'Create a modern, professional landing page with: 1) Hero section with gradient background, headline, subheadline, and CTA button 2) Features section with 3-4 feature cards with icons 3) Testimonials section with customer quotes 4) Pricing section with 3 tiers 5) Footer with links and social icons. Use a clean, modern design with smooth animations.',
    tags: ['marketing', 'startup', 'product']
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Full e-commerce storefront with product grid, cart, and checkout',
    icon: <ShoppingCart className="w-6 h-6" />,
    category: 'popular',
    prompt: 'Create a modern e-commerce store with: 1) Header with logo, search bar, and cart icon with item count 2) Hero banner with featured promotion 3) Product grid showing 8 sample products with images, names, prices, and "Add to Cart" buttons 4) Sidebar filters for category and price range 5) Shopping cart drawer that slides in from right 6) Footer with store info. Products should be clickable to show details.',
    tags: ['shop', 'store', 'products']
  },
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    description: 'Analytics dashboard with charts, stats, and data tables',
    icon: <LayoutDashboard className="w-6 h-6" />,
    category: 'popular',
    prompt: 'Create an admin dashboard with: 1) Sidebar navigation with icons for Dashboard, Users, Analytics, Settings 2) Header with search and user profile dropdown 3) Stats cards showing KPIs (Users, Revenue, Orders, Growth) with icons and percentage changes 4) Line chart showing monthly data trends 5) Recent orders/activity table with status badges 6) Use a clean dark sidebar with light main content area.',
    tags: ['admin', 'analytics', 'management']
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'Personal portfolio with projects, about, and contact sections',
    icon: <User className="w-6 h-6" />,
    category: 'popular',
    prompt: 'Create a personal portfolio website with: 1) Hero section with name, title, and animated text 2) About section with bio and skills tags 3) Projects gallery with 6 project cards showing thumbnails, titles, and tech stack 4) Experience timeline showing work history 5) Contact section with form (name, email, message) 6) Smooth scroll navigation. Use a creative, modern design.',
    tags: ['personal', 'developer', 'designer']
  },

  // Business
  {
    id: 'saas-landing',
    name: 'SaaS Landing',
    description: 'Software-as-a-Service product page with features and pricing',
    icon: <Briefcase className="w-6 h-6" />,
    category: 'business',
    prompt: 'Create a SaaS product landing page with: 1) Sticky header with logo and "Start Free Trial" button 2) Hero with product screenshot mockup, headline emphasizing value prop 3) Social proof bar with company logos 4) Feature comparison section with checkmarks 5) Pricing table with Free, Pro, Enterprise tiers 6) FAQ accordion section 7) Final CTA section. Modern, trustworthy design.',
    tags: ['software', 'startup', 'b2b']
  },
  {
    id: 'restaurant',
    name: 'Restaurant Website',
    description: 'Restaurant site with menu, reservations, and gallery',
    icon: <Utensils className="w-6 h-6" />,
    category: 'business',
    prompt: 'Create a restaurant website with: 1) Full-screen hero with background image and restaurant name 2) About section with story and ambiance photos 3) Menu section organized by categories (Appetizers, Mains, Desserts) with prices 4) Gallery with food photography grid 5) Reservation form with date, time, party size 6) Location with embedded map placeholder and hours 7) Elegant, appetizing design.',
    tags: ['food', 'dining', 'hospitality']
  },
  {
    id: 'travel-agency',
    name: 'Travel Agency',
    description: 'Travel booking site with destinations and packages',
    icon: <Plane className="w-6 h-6" />,
    category: 'business',
    prompt: 'Create a travel agency website with: 1) Hero with search form (destination, dates, travelers) 2) Popular destinations grid with beautiful images and prices 3) Featured travel packages with itinerary highlights 4) Why choose us section with benefits 5) Customer reviews carousel 6) Newsletter signup for travel deals 7) Adventurous, inspiring design with vibrant colors.',
    tags: ['tourism', 'vacation', 'booking']
  },

  // Creative
  {
    id: 'blog',
    name: 'Blog / Magazine',
    description: 'Content blog with articles, categories, and newsletter',
    icon: <Newspaper className="w-6 h-6" />,
    category: 'creative',
    prompt: 'Create a blog/magazine website with: 1) Header with logo, category navigation, and search 2) Featured article hero with large image and excerpt 3) Article grid with thumbnails, titles, dates, and read time 4) Sidebar with categories, popular posts, and newsletter signup 5) Individual article layout with author info and social sharing 6) Clean, readable typography-focused design.',
    tags: ['content', 'articles', 'media']
  },
  {
    id: 'photography',
    name: 'Photography Portfolio',
    description: 'Visual portfolio with galleries and lightbox',
    icon: <Image className="w-6 h-6" />,
    category: 'creative',
    prompt: 'Create a photography portfolio with: 1) Minimal header with photographer name and navigation 2) Masonry grid gallery with hover effects 3) Category filters (Nature, Portrait, Urban, Events) 4) Lightbox modal for viewing full images 5) About page with photographer bio and equipment 6) Contact form for bookings. Minimal design that lets photos shine.',
    tags: ['photos', 'visual', 'gallery']
  },
  {
    id: 'music-artist',
    name: 'Music Artist',
    description: 'Musician page with discography, tour dates, and merch',
    icon: <Music className="w-6 h-6" />,
    category: 'creative',
    prompt: 'Create a music artist website with: 1) Full-screen hero with artist image and latest release 2) Music player bar with play/pause and track info 3) Discography section with album covers and track lists 4) Tour dates table with venue, city, and ticket buttons 5) Merch store section with products 6) Social media links and newsletter. Bold, artistic design.',
    tags: ['musician', 'band', 'entertainment']
  },

  // Productivity
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Kanban board with drag-and-drop tasks',
    icon: <CheckSquare className="w-6 h-6" />,
    category: 'productivity',
    prompt: 'Create a task management app with: 1) Header with app name and "Add Task" button 2) Kanban board with 3 columns: To Do, In Progress, Done 3) Task cards with title, description preview, priority badge, and due date 4) Add/edit task modal with form fields 5) Drag and drop visual indicators 6) Filter by priority and search. Clean, focused productivity design.',
    tags: ['tasks', 'kanban', 'productivity']
  },
  {
    id: 'chat-app',
    name: 'Chat Application',
    description: 'Real-time chat interface with conversations',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'productivity',
    prompt: 'Create a chat application UI with: 1) Sidebar with conversation list showing avatars and last message preview 2) Main chat area with message bubbles (sent/received styling) 3) Message input with send button and emoji picker trigger 4) Chat header with contact info and actions 5) Online status indicators 6) Message timestamps and read receipts. Modern messaging app design.',
    tags: ['messaging', 'communication', 'social']
  },
  {
    id: 'calendar-app',
    name: 'Calendar App',
    description: 'Event calendar with month/week views',
    icon: <Calendar className="w-6 h-6" />,
    category: 'productivity',
    prompt: 'Create a calendar application with: 1) Header with month/year navigation and view toggles 2) Month view grid with days and event dots 3) Event list sidebar showing today\'s events 4) Add event modal with title, date, time, color picker 5) Mini calendar for quick navigation 6) Different event colors for categories. Clean, organized calendar design.',
    tags: ['events', 'schedule', 'planning']
  },
];

const categoryLabels: Record<string, string> = {
  popular: 'Popular',
  business: 'Business',
  creative: 'Creative',
  productivity: 'Productivity'
};

const categoryIcons: Record<string, React.ReactNode> = {
  popular: <Zap className="w-4 h-4" />,
  business: <Briefcase className="w-4 h-4" />,
  creative: <Sparkles className="w-4 h-4" />,
  productivity: <CheckSquare className="w-4 h-4" />
};

export function ProjectTemplates({ isOpen, onClose, onSelectTemplate }: ProjectTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const categories = ['all', 'popular', 'business', 'creative', 'productivity'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Templates</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose a template to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat !== 'all' && categoryIcons[cat]}
              {cat === 'all' ? 'All Templates' : categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template.prompt, template.name)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  hoveredTemplate === template.id
                    ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  hoveredTemplate === template.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {template.icon}
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{template.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Hover overlay */}
                <div className={`absolute inset-0 flex items-center justify-center rounded-xl bg-primary/90 transition-opacity duration-200 ${
                  hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                  <span className="text-white font-semibold">Use This Template</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
