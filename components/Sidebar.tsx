'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FileText, 
  Braces, 
  ImagePlus, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'text-to-braille', label: 'Texto → Braille', icon: FileText },
  { id: 'braille-to-text', label: 'Braille → Texto', icon: Braces },
  { id: 'signage', label: 'Señalética', icon: ImagePlus },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={cn(
          'md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl',
          'bg-white dark:bg-gray-900 shadow-lg',
          'border-2 border-gray-200 dark:border-gray-800'
        )}
      >
        <motion.div
          animate={{ rotate: isMobileOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isMobileOpen ? (
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          )}
        </motion.div>
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ 
          x: 0,
          width: isCollapsed ? 80 : 280 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed left-0 top-0 h-screen bg-white dark:bg-gray-900',
          'border-r border-gray-200 dark:border-gray-800',
          'flex flex-col z-40 shadow-xl',
          // En móvil, ocultar por defecto y mostrar solo cuando isMobileOpen es true
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0' // En desktop, siempre visible
        )}
      >
      {/* Logo/Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Braille Studio
            </span>
          </motion.div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors duration-200',
            isCollapsed && 'mx-auto'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setIsMobileOpen(false); // Cerrar sidebar en móvil después de seleccionar
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                'transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {/* Hover effect */}
              {!isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.2 }}
                />
              )}

              <Icon className={cn(
                'w-5 h-5 relative z-10',
                isActive && 'animate-pulse'
              )} />
              
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium relative z-10"
                >
                  {item.label}
                </motion.span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute right-0 w-1 h-full bg-white rounded-l-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
            'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
            'transition-colors duration-200'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Cerrar sesión</span>}
        </motion.button>
      </div>
    </motion.aside>
    </>
  );
}

