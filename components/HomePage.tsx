'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface HomePageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Zap,
    title: 'Conversión Instantánea',
    description: 'Traduce texto a Braille y viceversa en tiempo real con alta precisión',
  },
  {
    icon: Shield,
    title: 'Accesible y Seguro',
    description: 'Cumple con WCAG AA y respeta tu privacidad al 100%',
  },
  {
    icon: Sparkles,
    title: 'Señalética Profesional',
    description: 'Genera diseños listos para imprimir en PDF o PNG de alta calidad',
  },
  {
    icon: Rocket,
    title: 'Moderno y Rápido',
    description: 'Interfaz fluida con animaciones y rendimiento optimizado',
  },
];

export default function HomePage({ onGetStarted }: HomePageProps) {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 transition-colors duration-300"
            >
              <Sparkles className="w-4 h-4" />
              Sistema de conversión Braille profesional
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Braille Studio
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto transition-colors duration-300"
            >
              La herramienta más moderna para convertir texto a Braille y generar
              señalización accesible de forma profesional.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Comenzar Ahora 🚀
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              >
                Ver Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="py-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center text-white">
          <div>
            <p className="text-4xl font-bold mb-2">100%</p>
            <p className="text-blue-100">Accesible</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">WCAG AA</p>
            <p className="text-blue-100">Certificado</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">0ms</p>
            <p className="text-blue-100">Lag</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
