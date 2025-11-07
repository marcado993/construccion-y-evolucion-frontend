'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, User, Bell } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title: string;
  sidebarCollapsed: boolean;
}

export default function Topbar({ title, sidebarCollapsed }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80',
        'backdrop-blur-lg border-b border-gray-200 dark:border-gray-800',
        'flex items-center justify-between px-6 z-30 shadow-sm',
        'transition-all duration-300'
      )}
      style={{
        left: sidebarCollapsed ? 80 : 280
      }}
    >
      {/* Title */}
      <motion.div
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </motion.div>
        </motion.button>

        {/* User Profile */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 p-2 pl-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Usuario Demo
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              demo@braille.app
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
            <User className="w-5 h-5" />
          </div>
        </motion.button>
      </div>
    </motion.header>
  );
}
