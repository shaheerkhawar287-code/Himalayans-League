import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Trophy, User, LogIn, LogOut, Sun, Moon, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Players', path: '/players' },
  { name: 'Stats', path: '/stats' },
  { name: 'Matches', path: '/matches' },
  { name: 'Contact', path: '/contact' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-orange-500 rounded-lg group-hover:rotate-12 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                Himalayans League
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-orange-500",
                    location.pathname === item.path ? "text-orange-500" : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-500",
                    location.pathname === '/admin' ? "text-blue-500" : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  Admin
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="hidden sm:flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{profile?.name || user.displayName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Join League</span>
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === item.path
                        ? "bg-orange-50 text-orange-500 dark:bg-orange-500/10"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                  >
                    Admin Panel
                  </Link>
                )}
                {!user && (
                  <button
                    onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <Activity className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold">Himalayans League</span>
              </Link>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                Where Families Compete & Champions Rise. Join the most vibrant table tennis community in the Himalayas.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-zinc-500 hover:text-orange-500 transition-colors">Home</Link></li>
                <li><Link to="/players" className="text-zinc-500 hover:text-orange-500 transition-colors">Players</Link></li>
                <li><Link to="/stats" className="text-zinc-500 hover:text-orange-500 transition-colors">Stats</Link></li>
                <li><Link to="/matches" className="text-zinc-500 hover:text-orange-500 transition-colors">Matches</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Community</h3>
              <ul className="space-y-2">
                <li><Link to="/stats" className="text-zinc-500 hover:text-orange-500 transition-colors">Statistics</Link></li>
                <li><Link to="/contact" className="text-zinc-500 hover:text-orange-500 transition-colors">Contact Us</Link></li>
                <li><Link to="/register" className="text-zinc-500 hover:text-orange-500 transition-colors">Join League</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-sm">
            © {new Date().getFullYear()} Himalayans League. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
