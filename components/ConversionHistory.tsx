'use client';

import { useState, useEffect } from 'react';
import { Clock, Copy, Trash2, RefreshCw, ArrowRightLeft, Wifi, WifiOff } from 'lucide-react';
import { useHistorial, useBackendStatus } from '@/lib/hooks/useApi';

interface ConversionRecord {
  id: number;
  textoOriginal: string;
  resultado: string;
  tipo: 'texto-a-braille' | 'braille-a-texto';
  fecha: Date;
  longitudOriginal: number;
  longitudResultado: number;
}

interface ConversionHistoryProps {
  onRestore?: (original: string, tipo: 'texto-a-braille' | 'braille-a-texto') => void;
  tipo?: 'texto-a-braille' | 'braille-a-texto'; // Filtrar por tipo específico
}

export default function ConversionHistory({ onRestore, tipo }: ConversionHistoryProps) {
  const [localHistory, setLocalHistory] = useState<ConversionRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'texto-a-braille' | 'braille-a-texto'>('all');
  
  // Hooks para backend
  const { isConnected } = useBackendStatus();
  const { historial: backendHistory, loading, recargar, eliminar: eliminarBackend, limpiar: limpiarBackend } = useHistorial(tipo);

  // Cargar historial local al montar el componente
  useEffect(() => {
    loadLocalHistory();
  }, []);

  const loadLocalHistory = () => {
    const stored = localStorage.getItem('braille-history');
    if (stored) {
      const parsed = JSON.parse(stored);
      setLocalHistory(parsed.map((item: any) => ({
        ...item,
        fecha: new Date(item.fecha),
      })));
    }
  };

  // Decidir qué historial mostrar
  const history = isConnected && backendHistory.length > 0 
    ? backendHistory.map(item => ({
        ...item,
        fecha: new Date(item.fecha),
      }))
    : localHistory;

  const addToHistory = (record: Omit<ConversionRecord, 'id' | 'fecha'>) => {
    // Solo agregar a localStorage si no está conectado al backend
    if (!isConnected) {
      const newRecord: ConversionRecord = {
        ...record,
        id: Date.now(),
        fecha: new Date(),
      };

      const updated = [newRecord, ...localHistory].slice(0, 50); // Keep last 50
      setLocalHistory(updated);
      localStorage.setItem('braille-history', JSON.stringify(updated));
    }
    // Si está conectado, el backend ya guardó la conversión
  };

  const clearHistory = async () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
      if (isConnected) {
        // Limpiar en el backend
        const success = await limpiarBackend();
        if (success) {
          await recargar();
        }
      } else {
        // Limpiar localStorage
        setLocalHistory([]);
        localStorage.removeItem('braille-history');
      }
    }
  };

  const deleteRecord = async (id: number) => {
    if (isConnected) {
      // Eliminar del backend
      const success = await eliminarBackend(id);
      if (success) {
        await recargar();
      }
    } else {
      // Eliminar de localStorage
      const updated = localHistory.filter(item => item.id !== id);
      setLocalHistory(updated);
      localStorage.setItem('braille-history', JSON.stringify(updated));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('¡Copiado al portapapeles!');
    } catch (err) {
      alert('Error al copiar');
    }
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.tipo === filter);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A0E27 0%, #151937 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #252B4F',
      maxHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={24} color="#4F46E5" />
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}>
              Historial
            </h3>
            {/* Indicador de fuente de datos */}
            <div style={{
              padding: '4px 10px',
              background: isConnected ? '#10B98120' : '#F59E0B20',
              border: `1px solid ${isConnected ? '#10B981' : '#F59E0B'}`,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: isConnected ? '#10B981' : '#F59E0B',
            }}>
              {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isConnected ? 'Backend' : 'Local'}
            </div>
          </div>
          <button
            onClick={clearHistory}
            disabled={history.length === 0 || loading}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '2px solid #DC2626',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: 600,
              cursor: history.length === 0 || loading ? 'not-allowed' : 'pointer',
              opacity: history.length === 0 || loading ? 0.5 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseOver={(e) => {
              if (history.length > 0 && !loading) {
                e.currentTarget.style.background = '#DC262615';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Trash2 size={14} />
            Limpiar Todo
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: 'all', label: 'Todos', icon: RefreshCw },
            { value: 'texto-a-braille', label: 'Texto → Braille', icon: ArrowRightLeft },
            { value: 'braille-a-texto', label: 'Braille → Texto', icon: ArrowRightLeft },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              style={{
                padding: '8px 14px',
                background: filter === item.value ? '#4F46E5' : '#151937',
                border: `2px solid ${filter === item.value ? '#4F46E5' : '#252B4F'}`,
                borderRadius: '8px',
                color: filter === item.value ? '#FFFFFF' : '#8B92B8',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {filteredHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#8B92B8',
          }}>
            <Clock size={48} color="#252B4F" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>
              {filter === 'all' 
                ? 'No hay conversiones en el historial'
                : `No hay conversiones de tipo "${filter}"`
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredHistory.map((record) => (
              <div
                key={record.id}
                style={{
                  background: '#151937',
                  border: '1px solid #252B4F',
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#4F46E5';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#252B4F';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: record.tipo === 'texto-a-braille' ? '#06B6D4' : '#8B5CF6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {record.tipo === 'texto-a-braille' ? 'Texto → Braille' : 'Braille → Texto'}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#8B92B8',
                  }}>
                    {formatDate(record.fecha)}
                  </span>
                </div>

                {/* Content */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#FFFFFF',
                    marginBottom: '6px',
                    wordBreak: 'break-word',
                  }}>
                    {record.textoOriginal.substring(0, 100)}
                    {record.textoOriginal.length > 100 && '...'}
                  </div>
                  <div style={{
                    fontSize: record.tipo === 'texto-a-braille' ? '18px' : '13px',
                    color: '#8B92B8',
                    fontFamily: record.tipo === 'texto-a-braille' ? 'monospace' : 'inherit',
                    wordBreak: 'break-word',
                  }}>
                    {record.resultado.substring(0, 100)}
                    {record.resultado.length > 100 && '...'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                }}>
                  {onRestore && (
                    <button
                      onClick={() => onRestore(record.textoOriginal, record.tipo as 'texto-a-braille' | 'braille-a-texto')}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        background: '#4F46E515',
                        border: '1px solid #4F46E5',
                        borderRadius: '6px',
                        color: '#4F46E5',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#4F46E530';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#4F46E515';
                      }}
                    >
                      Restaurar
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(record.resultado)}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: '1px solid #252B4F',
                      borderRadius: '6px',
                      color: '#8B92B8',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#4F46E5';
                      e.currentTarget.style.color = '#4F46E5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#252B4F';
                      e.currentTarget.style.color = '#8B92B8';
                    }}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: '1px solid #252B4F',
                      borderRadius: '6px',
                      color: '#8B92B8',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#DC2626';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#252B4F';
                      e.currentTarget.style.color = '#8B92B8';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {history.length > 0 && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #252B4F',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#8B92B8',
        }}>
          <span>Total: {filteredHistory.length} conversiones</span>
          <span>
            {history.filter(h => h.tipo === 'texto-a-braille').length} texto → braille | {' '}
            {history.filter(h => h.tipo === 'braille-a-texto').length} braille → texto
          </span>
        </div>
      )}
    </div>
  );
}

// Export function to add to history from other components
export const addConversionToHistory = (
  textoOriginal: string,
  resultado: string,
  tipo: 'texto-a-braille' | 'braille-a-texto'
) => {
  const stored = localStorage.getItem('braille-history');
  const history = stored ? JSON.parse(stored) : [];

  const newRecord = {
    id: Date.now(),
    textoOriginal,
    resultado,
    tipo,
    fecha: new Date().toISOString(),
    longitudOriginal: textoOriginal.length,
    longitudResultado: resultado.length,
  };

  const updated = [newRecord, ...history].slice(0, 50);
  localStorage.setItem('braille-history', JSON.stringify(updated));
};
