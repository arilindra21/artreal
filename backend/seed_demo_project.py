"""
Demo Project Seeder for ArtReal
Creates a complete E-Commerce demo project with realistic chat history
for investor demonstrations.

Run: python seed_demo_project.py
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models import Project, ProjectFile, ChatSession, ChatMessage, MessageRole, ProjectStatus
from app.services.filesystem_service import FileSystemService
from app.services.git_service import GitService

# =============================================================================
# PROJECT FILES CONTENT
# =============================================================================

FILES = {
    "src/App.tsx": '''import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, Heart, Star, ChevronDown, Truck, Shield, RefreshCw } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductGrid from './components/ProductGrid';
import FlashSale from './components/FlashSale';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <Hero />
        <Categories />
        <FlashSale />
        <ProductGrid />
        <Footer />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  );
}

export default App;
''',

    "src/components/Navbar.tsx": '''import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, User, Bell, HelpCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onCartClick: () => void;
}

export default function Navbar({ onCartClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-orange-100 transition">Seller Centre</a>
            <span className="opacity-50">|</span>
            <a href="#" className="hover:text-orange-100 transition">Download App</a>
            <span className="opacity-50">|</span>
            <span>Follow us on</span>
            <div className="flex gap-2">
              <a href="#" className="hover:text-orange-100">FB</a>
              <a href="#" className="hover:text-orange-100">IG</a>
              <a href="#" className="hover:text-orange-100">TW</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-1 hover:text-orange-100">
              <Bell className="w-3 h-3" />
              Notifications
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-orange-100">
              <HelpCircle className="w-3 h-3" />
              Help
            </a>
            <a href="#" className="hover:text-orange-100">Sign Up</a>
            <span className="opacity-50">|</span>
            <a href="#" className="hover:text-orange-100">Login</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-gradient-to-r from-orange-500 to-orange-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">ShopeeClone</span>
              </a>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands and more..."
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-sm"
                />
                <button className="absolute right-0 top-0 h-full px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-r-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
              {/* Search Suggestions */}
              <div className="flex gap-2 mt-2">
                {['iPhone 15', 'Nike Air Max', 'Samsung TV', 'Laptop Gaming'].map((term) => (
                  <span key={term} className="text-xs text-white/80 hover:text-white cursor-pointer transition">
                    {term}
                  </span>
                ))}
              </div>
            </div>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-3 text-white hover:bg-white/10 rounded-lg transition-colors group"
            >
              <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-orange-500 text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
''',

    "src/components/Hero.tsx": '''import { ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { useState, useEffect } from 'react';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    title: 'Super Sale 11.11',
    subtitle: 'Up to 90% OFF',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
    title: 'Flash Deals',
    subtitle: 'Limited Time Only',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
    title: 'Fashion Week',
    subtitle: 'New Arrivals',
  },
];

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30 days return' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Banner */}
          <div className="lg:col-span-3 relative overflow-hidden rounded-2xl shadow-xl group">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="w-full flex-shrink-0 relative">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                    <div className="p-10 text-white">
                      <h2 className="text-5xl font-bold mb-2 animate-fade-in">{banner.title}</h2>
                      <p className="text-2xl text-orange-300">{banner.subtitle}</p>
                      <button className="mt-6 px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-full font-semibold transition-all hover:scale-105 shadow-lg">
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-orange-500 w-8' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Side Banners */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=190&fit=crop"
                alt="Gadgets"
                className="w-full h-[190px] object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="font-bold text-lg">Tech Gadgets</p>
                  <p className="text-orange-300 text-sm">From $9.99</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=190&fit=crop"
                alt="Shoes"
                className="w-full h-[190px] object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="font-bold text-lg">Sneaker Sale</p>
                  <p className="text-orange-300 text-sm">50% OFF</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{feature.title}</p>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
''',

    "src/components/Categories.tsx": '''import { Smartphone, Shirt, Home, Gamepad2, Baby, Utensils, Heart, MoreHorizontal } from 'lucide-react';

const categories = [
  { icon: Smartphone, name: 'Electronics', color: 'from-blue-500 to-blue-600', count: '2.5k+ items' },
  { icon: Shirt, name: 'Fashion', color: 'from-pink-500 to-pink-600', count: '5k+ items' },
  { icon: Home, name: 'Home & Living', color: 'from-green-500 to-green-600', count: '3k+ items' },
  { icon: Gamepad2, name: 'Gaming', color: 'from-purple-500 to-purple-600', count: '1.2k+ items' },
  { icon: Baby, name: 'Baby & Kids', color: 'from-yellow-500 to-yellow-600', count: '2k+ items' },
  { icon: Utensils, name: 'Food & Drinks', color: 'from-red-500 to-red-600', count: '800+ items' },
  { icon: Heart, name: 'Health & Beauty', color: 'from-rose-500 to-rose-600', count: '4k+ items' },
  { icon: MoreHorizontal, name: 'See All', color: 'from-gray-500 to-gray-600', count: '100+ categories' },
];

export default function Categories() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
          <a href="#" className="text-orange-500 hover:text-orange-600 font-medium transition">
            View All →
          </a>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((category, idx) => (
            <div
              key={idx}
              className="group cursor-pointer"
            >
              <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-orange-50 transition-colors">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800 text-center">{category.name}</p>
                <p className="text-xs text-gray-500">{category.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
''',

    "src/components/FlashSale.tsx": '''import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import ProductCard from './ProductCard';
import { products } from '../data/products';

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 23,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = products.slice(0, 6);

  return (
    <section className="py-8 bg-gradient-to-r from-orange-500 to-red-500">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Zap className="w-8 h-8 fill-yellow-300 text-yellow-300 animate-pulse" />
              <h2 className="text-3xl font-bold">Flash Sale</h2>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2 ml-6">
              <Clock className="w-5 h-5 text-white/80" />
              <div className="flex gap-1">
                {Object.entries(timeLeft).map(([unit, value], idx) => (
                  <div key={unit} className="flex items-center">
                    <div className="bg-black text-white px-3 py-1 rounded-lg font-mono font-bold text-lg">
                      {String(value).padStart(2, '0')}
                    </div>
                    {idx < 2 && <span className="text-white mx-1 font-bold">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a href="#" className="text-white hover:text-yellow-200 font-medium transition flex items-center gap-1">
            See All <span className="text-xl">→</span>
          </a>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {flashSaleProducts.map((product) => (
            <ProductCard key={product.id} product={product} isFlashSale />
          ))}
        </div>
      </div>
    </section>
  );
}
''',

    "src/components/ProductGrid.tsx": '''import { useState } from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/products';

const filters = ['All', 'Popular', 'Newest', 'Best Selling', 'Price: Low to High', 'Price: High to Low'];

export default function ProductGrid() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Daily Discover</h2>
          <p className="text-gray-500">Handpicked products just for you</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 border border-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-10">
          <button className="px-8 py-3 border-2 border-orange-500 text-orange-500 rounded-lg font-medium hover:bg-orange-500 hover:text-white transition-colors">
            Load More Products
          </button>
        </div>
      </div>
    </section>
  );
}
''',

    "src/components/ProductCard.tsx": '''import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  isFlashSale?: boolean;
}

export default function ProductCard({ product, isFlashSale = false }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product);
    setTimeout(() => setIsAdding(false), 500);
  };

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${isFlashSale ? 'hover:scale-105' : ''}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{product.discount}%
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Quick Add */}
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-2 right-2 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 ${
            isAdding ? 'scale-110 bg-green-500' : 'hover:bg-orange-600'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isAdding ? 'Added!' : 'Add'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
          <span className="text-xs text-gray-400 ml-auto">{product.sold} sold</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-500">
            ${discountedPrice.toFixed(2)}
          </span>
          {product.discount && (
            <span className="text-sm text-gray-400 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Flash Sale Progress */}
        {isFlashSale && (
          <div className="mt-2">
            <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                style={{ width: `${Math.random() * 60 + 20}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Selling fast!</p>
          </div>
        )}
      </div>
    </div>
  );
}
''',

    "src/components/CartDrawer.tsx": '''import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
            <span className="bg-orange-100 text-orange-600 text-sm px-2 py-0.5 rounded-full">
              {items.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-gray-50 rounded-xl p-3 group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-orange-500 font-bold mt-1">
                      ${(item.price * (1 - (item.discount || 0) / 100)).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</span>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30">
              Checkout Now
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 py-2 text-gray-500 hover:text-red-500 text-sm transition"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
''',

    "src/components/Footer.tsx": '''import { ShoppingCart, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ShopeeClone</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your one-stop destination for everything you need. Quality products, great prices, fast delivery.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['About Us', 'Contact', 'FAQs', 'Terms & Conditions', 'Privacy Policy', 'Careers'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-orange-500 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty', 'Toys & Games'].map((cat) => (
                <li key={cat}>
                  <a href="#" className="text-sm hover:text-orange-500 transition-colors">
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="text-sm">123 Shopping Street, Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <span className="text-sm">+62 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <span className="text-sm">support@shopeeclone.com</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-sm">
          <p className="text-gray-500">
            © 2024 ShopeeClone. All rights reserved. Made with ArtReal AI.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 opacity-50 hover:opacity-100 transition" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-6 opacity-50 hover:opacity-100 transition" />
          </div>
        </div>
      </div>
    </footer>
  );
}
''',

    "src/context/CartContext.tsx": '''import { createContext, useContext, useState, ReactNode } from 'react';
import type { Product } from '../data/products';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => {
    const price = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
''',

    "src/data/products.ts": '''export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  sold: string;
  discount?: number;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    price: 1199.00,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 2847,
    sold: '5.2k',
    discount: 15,
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra 512GB Titanium Black',
    price: 1299.00,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 1923,
    sold: '3.8k',
    discount: 20,
    category: 'Electronics',
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    price: 349.00,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 4521,
    sold: '12k',
    discount: 25,
    category: 'Electronics',
  },
  {
    id: 4,
    name: 'Nike Air Max 270 React Running Shoes - Multi Color',
    price: 159.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 3892,
    sold: '8.5k',
    discount: 30,
    category: 'Fashion',
  },
  {
    id: 5,
    name: 'Adidas Ultraboost 22 Premium Running Sneakers',
    price: 189.00,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 2156,
    sold: '6.2k',
    category: 'Fashion',
  },
  {
    id: 6,
    name: 'MacBook Pro 16" M3 Max Chip 48GB RAM Space Black',
    price: 3499.00,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 892,
    sold: '1.2k',
    discount: 10,
    category: 'Electronics',
  },
  {
    id: 7,
    name: 'Premium Leather Crossbody Bag - Italian Design',
    price: 89.00,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 1567,
    sold: '4.3k',
    discount: 40,
    category: 'Fashion',
  },
  {
    id: 8,
    name: 'Smart Watch Series 9 GPS + Cellular 45mm',
    price: 499.00,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 3421,
    sold: '9.1k',
    discount: 15,
    category: 'Electronics',
  },
  {
    id: 9,
    name: 'Minimalist Ceramic Plant Pot Set - Modern Home Decor',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop',
    rating: 4.5,
    reviews: 892,
    sold: '2.8k',
    category: 'Home & Living',
  },
  {
    id: 10,
    name: 'Ergonomic Office Chair with Lumbar Support',
    price: 299.00,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 2134,
    sold: '5.6k',
    discount: 35,
    category: 'Home & Living',
  },
  {
    id: 11,
    name: 'Professional DSLR Camera Kit with 18-55mm Lens',
    price: 899.00,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 1876,
    sold: '3.2k',
    discount: 20,
    category: 'Electronics',
  },
  {
    id: 12,
    name: 'Vintage Style Polaroid Instant Camera - Retro',
    price: 129.00,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
    rating: 4.4,
    reviews: 2543,
    sold: '7.8k',
    category: 'Electronics',
  },
  {
    id: 13,
    name: 'Wireless Gaming Mouse RGB with 16000 DPI',
    price: 79.00,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 4892,
    sold: '15k',
    discount: 25,
    category: 'Gaming',
  },
  {
    id: 14,
    name: 'Mechanical Gaming Keyboard Cherry MX Blue',
    price: 149.00,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 3245,
    sold: '8.9k',
    discount: 15,
    category: 'Gaming',
  },
  {
    id: 15,
    name: 'Premium Cotton Oversized Hoodie - Streetwear',
    price: 69.00,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    rating: 4.5,
    reviews: 5678,
    sold: '18k',
    discount: 20,
    category: 'Fashion',
  },
];
''',

    "src/index.css": '''@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply antialiased;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

/* Animation keyframes */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
''',

    "src/main.tsx": '''import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
''',
}

# =============================================================================
# CHAT HISTORY - Realistic conversation flow
# =============================================================================

CHAT_MESSAGES = [
    # Message 1 - User request
    {
        "role": "user",
        "content": "Build a modern e-commerce application like Shopee with features: product listing, shopping cart, flash sales, and checkout. Use a modern design with orange color theme similar to Shopee. Make it fully responsive and include smooth animations.",
    },
    # Message 2 - Planner response
    {
        "role": "assistant",
        "agent_name": "Planner",
        "content": """PLAN: E-Commerce App (Shopee Clone)

I'll create a modern e-commerce application with Shopee-style design. Here's the implementation plan:

1. [ ] **Core Infrastructure Creation** - Create all base files in one atomic operation:
   - App.tsx with main layout structure
   - Navbar component with search and cart
   - Hero section with banner carousel
   - Product components with cart functionality
   - Cart context for state management

2. [ ] **Verification & Error Checking** - Verify all imports and components work correctly

3. [ ] **Add Interactivity** - Implement cart drawer and add-to-cart functionality

4. [ ] **Polish & Refinement** - Fine-tune animations and responsive design

**Next task: Core Infrastructure Creation**

I'll instruct Coder to create: (1) App.tsx with layout, (2) Navbar.tsx with Shopee styling, (3) Hero.tsx with carousel, (4) ProductCard.tsx and ProductGrid.tsx, (5) CartContext.tsx for state, (6) Mock products data.""",
    },
    # Message 3 - Coder creates files
    {
        "role": "assistant",
        "agent_name": "Coder",
        "content": "I'll create the e-commerce app with Shopee-style design. Starting with the core infrastructure...",
        "message_metadata": json.dumps({
            "agent_interactions": [
                {"type": "thought", "content": "Creating a modern e-commerce UI with Shopee's signature orange theme (#ee4d2d)"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/App.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/App.tsx"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/components/Navbar.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/components/Navbar.tsx"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/components/Hero.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/components/Hero.tsx"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/components/ProductCard.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/components/ProductCard.tsx"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/context/CartContext.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/context/CartContext.tsx"},
            ],
            "code_changes": [
                {"file": "src/App.tsx", "action": "created"},
                {"file": "src/components/Navbar.tsx", "action": "created"},
                {"file": "src/components/Hero.tsx", "action": "created"},
                {"file": "src/components/ProductCard.tsx", "action": "created"},
                {"file": "src/context/CartContext.tsx", "action": "created"},
            ]
        }),
    },
    # Message 4 - Planner update
    {
        "role": "assistant",
        "agent_name": "Planner",
        "content": """PLAN UPDATE:
1. [x] **Core Infrastructure Creation** - Created main components
2. [ ] **Add More Components** - Categories, FlashSale, Footer sections
3. [ ] **Verification & Error Checking**
4. [ ] **Add Interactivity**

**Next task: Add remaining components (Categories, FlashSale, ProductGrid, Footer)**""",
    },
    # Message 5 - Coder continues
    {
        "role": "assistant",
        "agent_name": "Coder",
        "content": "Creating additional components for a complete e-commerce experience...",
        "message_metadata": json.dumps({
            "agent_interactions": [
                {"type": "thought", "content": "Adding Categories section with icons and FlashSale with countdown timer"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/components/Categories.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/components/Categories.tsx"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/components/FlashSale.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/components/FlashSale.tsx"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/components/ProductGrid.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/components/ProductGrid.tsx"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/components/Footer.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/components/Footer.tsx"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/data/products.ts"}},
                {"type": "tool_result", "content": "Successfully created src/data/products.ts with 15 products"},
            ],
            "code_changes": [
                {"file": "src/components/Categories.tsx", "action": "created"},
                {"file": "src/components/FlashSale.tsx", "action": "created"},
                {"file": "src/components/ProductGrid.tsx", "action": "created"},
                {"file": "src/components/Footer.tsx", "action": "created"},
                {"file": "src/data/products.ts", "action": "created"},
            ]
        }),
    },
    # Message 6 - User feedback
    {
        "role": "user",
        "content": "Great! But I want a cart drawer that slides in from the right side when clicking the cart icon. Also add hover animations on the product cards.",
    },
    # Message 7 - Planner response
    {
        "role": "assistant",
        "agent_name": "Planner",
        "content": """PLAN UPDATE:
1. [x] **Core Infrastructure Creation** - Done
2. [x] **Add More Components** - Done
3. [ ] **Add Cart Drawer** - Create sliding drawer from right
4. [ ] **Add Hover Animations** - Enhance ProductCard with smooth animations
5. [ ] **Final Verification**

**Next task: Create CartDrawer component with slide-in animation**""",
    },
    # Message 8 - Coder implements cart
    {
        "role": "assistant",
        "agent_name": "Coder",
        "content": "Adding the cart drawer with slide-in animation and enhancing product card hover effects...",
        "message_metadata": json.dumps({
            "agent_interactions": [
                {"type": "thought", "content": "Creating CartDrawer with backdrop, smooth slide animation, quantity controls, and remove functionality"},
                {"type": "tool_call", "tool": "write_file", "args": {"path": "src/components/CartDrawer.tsx"}},
                {"type": "tool_result", "content": "Successfully created src/components/CartDrawer.tsx"},
                {"type": "tool_call", "tool": "edit_file", "args": {"path": "src/components/ProductCard.tsx", "description": "Enhanced hover animations"}},
                {"type": "tool_result", "content": "Successfully updated ProductCard with hover effects"},
            ],
            "code_changes": [
                {"file": "src/components/CartDrawer.tsx", "action": "created"},
                {"file": "src/components/ProductCard.tsx", "action": "modified"},
            ]
        }),
    },
    # Message 9 - User feedback 2
    {
        "role": "user",
        "content": "Perfect! Now add a Flash Sale section with a countdown timer and progress bar to show remaining stock.",
    },
    # Message 10 - Coder response
    {
        "role": "assistant",
        "agent_name": "Coder",
        "content": "I've already included the Flash Sale section with countdown timer! Let me enhance it with the progress bar for remaining stock...",
        "message_metadata": json.dumps({
            "agent_interactions": [
                {"type": "tool_call", "tool": "read_file", "args": {"path": "src/components/FlashSale.tsx"}},
                {"type": "tool_result", "content": "Read FlashSale.tsx - already has countdown timer"},
                {"type": "tool_call", "tool": "edit_file", "args": {"path": "src/components/ProductCard.tsx", "description": "Added stock progress bar for flash sale items"}},
                {"type": "tool_result", "content": "Successfully added progress bar to ProductCard"},
            ],
            "code_changes": [
                {"file": "src/components/ProductCard.tsx", "action": "modified"},
            ]
        }),
    },
    # Message 11 - User question
    {
        "role": "user",
        "content": "Is it responsive for mobile devices?",
    },
    # Message 12 - Coder explains
    {
        "role": "assistant",
        "agent_name": "Coder",
        "content": """Yes, the application is fully responsive! Here's the responsive design breakdown:

**Navbar:**
- Search bar adapts to screen width on mobile
- Top bar remains compact across all sizes

**Hero Section:**
- Grid changes from 4 columns to 1 column on mobile
- Banner carousel stays full-width
- Side banners stack below on mobile

**Product Grid:**
- Desktop: 5 columns
- Tablet: 3 columns
- Mobile: 2 columns

**Categories:**
- Desktop: 8 items per row
- Mobile: 4 items per row with horizontal scroll

**Cart Drawer:**
- Full width on mobile, max-w-md on desktop

All using Tailwind CSS responsive classes (`sm:`, `md:`, `lg:`) for smooth adaptation across all screen sizes.""",
    },
    # Message 13 - User asks for feature
    {
        "role": "user",
        "content": "Can you add a discount badge on product cards when there's a discount?",
    },
    # Message 14 - Coder
    {
        "role": "assistant",
        "agent_name": "Coder",
        "content": "The discount badge is already implemented! Each ProductCard shows a red badge with the discount percentage (e.g., '-20%') in the top-left corner when the product has a discount. Let me verify this is working correctly...",
        "message_metadata": json.dumps({
            "agent_interactions": [
                {"type": "tool_call", "tool": "read_file", "args": {"path": "src/components/ProductCard.tsx"}},
                {"type": "tool_result", "content": "Verified: Discount badge exists at line 25-28"},
            ],
            "code_changes": []
        }),
    },
    # Message 15 - User satisfaction
    {
        "role": "user",
        "content": "Awesome, thank you! The app looks complete and amazing.",
    },
    # Message 16 - Final response
    {
        "role": "assistant",
        "agent_name": "Coder",
        "content": """You're welcome! Here's a summary of the E-Commerce app we've built:

**Features:**
- Modern Shopee-style design with orange theme
- Responsive layout (mobile, tablet, desktop)
- Hero section with auto-sliding banner carousel
- Category navigation with icons
- Flash Sale section with countdown timer
- Product grid with filtering options
- Product cards with:
   - Discount badges
   - Star ratings
   - Hover animations
   - Quick add to cart
   - Wishlist button
- Cart drawer sliding from right
- Cart management (add, remove, update quantity)
- Footer with newsletter subscription

**Tech Stack:**
- React + TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Context API for cart state

The app is ready for production!

TERMINATE""",
    },
]


def create_demo_project():
    """Create the demo project with all files and chat history"""
    db = SessionLocal()

    try:
        # Check if demo project already exists
        existing = db.query(Project).filter(Project.name == "ShopeeClone - E-Commerce Demo").first()
        if existing:
            print(f"Demo project already exists with ID: {existing.id}")
            print("Delete it first if you want to recreate.")
            return existing.id

        # 1. Create Project
        print("Creating project...")
        project = Project(
            name="ShopeeClone - E-Commerce Demo",
            description="A complete Shopee-style e-commerce application with product listing, cart, flash sales, and modern UI. Built with React, TypeScript, and Tailwind CSS.",
            status=ProjectStatus.ACTIVE,
            owner_id=1,  # MOCK_USER_ID
            template="react-vite",
            framework="react",
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        project_id = project.id
        print(f"Created project with ID: {project_id}")

        # 2. Create project structure on filesystem
        print("Creating project files on filesystem...")
        FileSystemService.create_project_structure(project_id, "ShopeeClone")

        # 3. Write all files
        for filepath, content in FILES.items():
            print(f"  Writing {filepath}...")
            FileSystemService.write_file(project_id, filepath, content)

            # Also add to database
            filename = filepath.split("/")[-1]
            ext = filename.split(".")[-1] if "." in filename else ""

            project_file = ProjectFile(
                project_id=project_id,
                filename=filename,
                filepath=filepath,
                language=ext,
            )
            db.add(project_file)

        db.commit()
        print(f"Created {len(FILES)} files")

        # 4. Create Chat Session
        print("Creating chat history...")
        session = ChatSession(
            project_id=project_id,
            title="Build E-Commerce App",
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # 5. Create Chat Messages with realistic timestamps
        base_time = datetime.utcnow() - timedelta(hours=2)

        for idx, msg_data in enumerate(CHAT_MESSAGES):
            message = ChatMessage(
                session_id=session.id,
                role=MessageRole(msg_data["role"]),
                content=msg_data["content"],
                agent_name=msg_data.get("agent_name"),
                message_metadata=msg_data.get("message_metadata"),
                created_at=base_time + timedelta(minutes=idx * 3),
            )
            db.add(message)

        db.commit()
        print(f"Created {len(CHAT_MESSAGES)} chat messages")

        # 6. Initialize Git with commits
        print("Initializing git repository...")
        try:
            GitService.init_repository(project_id)
            GitService.commit_changes(
                project_id,
                "Initial commit: ShopeeClone e-commerce app",
                list(FILES.keys())
            )
            print("Git repository initialized with initial commit")
        except Exception as e:
            print(f"Warning: Git initialization failed: {e}")

        print("\n" + "="*50)
        print(f"[OK] Demo project created successfully!")
        print(f"   Project ID: {project_id}")
        print(f"   Name: ShopeeClone - E-Commerce Demo")
        print(f"   Files: {len(FILES)}")
        print(f"   Chat Messages: {len(CHAT_MESSAGES)}")
        print("="*50)

        return project_id

    except Exception as e:
        db.rollback()
        print(f"Error creating demo project: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_demo_project()
