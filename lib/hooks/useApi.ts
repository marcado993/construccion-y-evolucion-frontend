/**
 * Hook personalizado para interactuar con el backend
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService, ConversionResponseData, HistorialItem, EstadisticasData, SenaleticaResponseData } from '@/lib/api-service';

/**
 * Hook para verificar la conexión con el backend
 */
export function useBackendStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      const connected = await apiService.verificarConexion();
      setIsConnected(connected);
      setIsChecking(false);
    };

    checkConnection();
  }, []);

  const recheckConnection = useCallback(async () => {
    setIsChecking(true);
    const connected = await apiService.verificarConexion();
    setIsConnected(connected);
    setIsChecking(false);
  }, []);

  return { isConnected, isChecking, recheckConnection };
}

/**
 * Hook para realizar conversiones
 */
export function useConversion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertir = useCallback(async (
    texto: string,
    tipo: 'texto-a-braille' | 'braille-a-texto',
    guardar: boolean = true
  ): Promise<ConversionResponseData | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.convertir(texto, tipo, guardar);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en conversión:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { convertir, loading, error };
}

/**
 * Hook para gestionar el historial
 */
export function useHistorial(tipo?: 'texto-a-braille' | 'braille-a-texto') {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = useCallback(async (limite: number = 50) => {
    // Verificar que el usuario esté autenticado
    // AuthContext guarda el usuario en 'braille_user'
    const userStr = typeof window !== 'undefined' ? (localStorage.getItem('braille_user') || localStorage.getItem('user')) : null;
    if (!userStr) {
      setHistorial([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data: HistorialItem[];
      if (tipo) {
        data = await apiService.obtenerHistorialPorTipo(tipo, limite);
      } else {
        data = await apiService.obtenerHistorial(limite);
      }
      setHistorial(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar historial';
      setError(errorMessage);
      console.error('Error al cargar historial:', err);
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    try {
      const success = await apiService.eliminarConversion(id);
      if (success) {
        setHistorial(prev => prev.filter(item => item.id !== id));
      }
      return success;
    } catch (err) {
      console.error('Error al eliminar conversión:', err);
      return false;
    }
  }, []);

  const limpiar = useCallback(async (): Promise<boolean> => {
    try {
      await apiService.limpiarHistorial();
      setHistorial([]);
      return true;
    } catch (err) {
      console.error('Error al limpiar historial:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  return { historial, loading, error, recargar: cargarHistorial, eliminar, limpiar };
}

/**
 * Hook para obtener estadísticas
 */
export function useEstadisticas() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.obtenerEstadisticas();
      setEstadisticas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  return { estadisticas, loading, error, recargar: cargarEstadisticas };
}

/**
 * Hook para gestionar señaléticas
 */
export function useSenaleticas() {
  const [senaleticas, setSenaleticas] = useState<SenaleticaResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarSenaleticas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.obtenerSenaleticas();
      setSenaleticas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar señaléticas';
      setError(errorMessage);
      console.error('Error al cargar señaléticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const crear = useCallback(async (
    titulo: string,
    textoOriginal: string,
    textoBraille: string,
    altoContraste: boolean = false
  ): Promise<SenaleticaResponseData | null> => {
    try {
      const nueva = await apiService.crearSenaletica({
        titulo,
        textoOriginal,
        textoBraille,
        altoContraste,
      });
      setSenaleticas(prev => [nueva, ...prev]);
      return nueva;
    } catch (err) {
      console.error('Error al crear señalética:', err);
      return null;
    }
  }, []);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    try {
      await apiService.eliminarSenaletica(id);
      setSenaleticas(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error al eliminar señalética:', err);
      return false;
    }
  }, []);

  const registrarDescarga = useCallback(async (id: number): Promise<boolean> => {
    try {
      await apiService.registrarDescarga(id);
      // Actualizar el contador localmente
      setSenaleticas(prev => prev.map(s => 
        s.id === id ? { ...s, descargas: s.descargas + 1 } : s
      ));
      return true;
    } catch (err) {
      console.error('Error al registrar descarga:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    cargarSenaleticas();
  }, [cargarSenaleticas]);

  return { 
    senaleticas, 
    loading, 
    error, 
    recargar: cargarSenaleticas, 
    crear, 
    eliminar, 
    registrarDescarga 
  };
}
