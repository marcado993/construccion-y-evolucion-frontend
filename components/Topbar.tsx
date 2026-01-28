'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, User, Bell, Check, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TopbarProps {
  title: string;
  sidebarCollapsed: boolean;
}

// Notificaciones de ejemplo
const notifications = [
  {
    id: 1,
    type: 'success',
    icon: Check,
    title: '¡Conversión exitosa!',
    message: 'Tu texto ha sido convertido a Braille correctamente',
    time: 'Hace 5 minutos',
    unread: true,
  },
  {
    id: 2,
    type: 'info',
    icon: Info,
    title: 'Nueva característica',
    message: 'Ahora puedes exportar tus señaléticas en formato PNG',
    time: 'Hace 2 horas',
    unread: true,
  },
  {
    id: 3,
    type: 'update',
    icon: Sparkles,
    title: 'Actualización disponible',
    message: 'Braille Studio v2.1 con mejoras de rendimiento',
    time: 'Hace 1 día',
    unread: false,
  },
  {
    id: 4,
    type: 'warning',
    icon: AlertCircle,
    title: 'Recordatorio',
    message: 'Tienes 3 conversiones sin guardar en tu historial',
    time: 'Hace 2 días',
    unread: false,
  },
];

export default function Topbar({ title, sidebarCollapsed }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'success': return 'from-green-500 to-emerald-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'info': return 'from-blue-500 to-cyan-500';
      case 'update': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80',
        'backdrop-blur-lg border-b border-gray-200 dark:border-gray-800',
        'flex items-center justify-between px-4 md:px-6 z-30 shadow-sm',
        'transition-all duration-300',
        'left-0 md:left-[280px]' // En móvil ocupa todo el ancho, en desktop deja espacio para el sidebar
      )}
    >
      {/* Title */}
      <motion.div
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Panel de Notificaciones */}
          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotifications(false)}
                  className="fixed inset-0 z-40"
                />
                
                {/* Panel */}
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute right-0 top-14 w-screen max-w-sm md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        Notificaciones
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tienes {unreadCount} sin leer
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Lista de Notificaciones */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification, index) => {
                      const Icon = notification.icon;
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            'p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer',
                            notification.unread && 'bg-blue-50/50 dark:bg-blue-900/10'
                          )}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                              'bg-gradient-to-br',
                              getNotificationColor(notification.type)
                            )}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {notification.title}
                                </h4>
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
