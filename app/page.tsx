'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import HomePage from '@/components/HomePage';
import LoginPage from '@/components/LoginPage';
import TextToBraille from '@/components/TextToBraille';
import BrailleToText from '@/components/BrailleToText';
import SignageGenerator from '@/components/SignageGenerator';
import { Loader2 } from 'lucide-react';

const sectionTitles: Record<string, string> = {
  home: 'Inicio',
  'text-to-braille': 'Texto → Braille',
  'braille-to-text': 'Braille → Texto',
  signage: 'Generar Señalética',
  settings: 'Configuración',
};

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading inicial
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // App principal (protegida)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div 
        className="transition-all duration-300 md:ml-[280px]"
      >
        <Topbar 
          title={sectionTitles[activeSection]} 
          sidebarCollapsed={sidebarCollapsed} 
        />
        
        <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 px-4 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {activeSection === 'home' && (
                <HomePage onGetStarted={() => setActiveSection('text-to-braille')} />
              )}
              
              {activeSection === 'text-to-braille' && (
                <div className="max-w-4xl mx-auto">
                  <TextToBraille />
                </div>
              )}
              
              {activeSection === 'braille-to-text' && (
                <div className="max-w-4xl mx-auto">
                  <BrailleToText />
                </div>
              )}
              
              {activeSection === 'signage' && (
                <div className="max-w-4xl mx-auto">
                  <SignageGenerator />
                </div>
              )}
              
              {activeSection === 'settings' && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      Configuración
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Próximamente: Ajustes de tamaño de fuente, idioma, preferencias de accesibilidad y más...
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
