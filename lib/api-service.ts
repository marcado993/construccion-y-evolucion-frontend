/**
 * Servicio de API para comunicación con el backend Spring Boot
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-service-8ts6.onrender.com/api';

// Tipos para las peticiones y respuestas
export interface ConversionRequestData {
  texto: string;
  tipo: 'texto-a-braille' | 'braille-a-texto';
  dispositivo?: string;
  navegador?: string;
  ipOrigen?: string;
}

export interface ConversionResponseData {
  id?: number;
  textoOriginal: string;
  resultado: string;
  tipo: string;
  fecha?: string;
  exito: boolean;
  mensaje: string;
  longitudOriginal?: number;
  longitudResultado?: number;
  tiempoConversionMs?: number;
}

export interface HistorialItem {
  id: number;
  textoOriginal: string;
  resultado: string;
  tipo: string;
  fecha: string;
  longitudOriginal: number;
  longitudResultado: number;
  dispositivo?: string;
  navegador?: string;
  tiempoConversionMs?: number;
}

export interface EstadisticasData {
  totalConversiones: number;
  conversionesTextoBraille: number;
  conversionesBrailleTexto: number;
  caracteresConvertidos: number;
}

export interface SenaleticaRequestData {
  titulo: string;
  textoOriginal: string;
  textoBraille: string;
  altoContraste: boolean;
}

export interface SenaleticaResponseData {
  id: number;
  titulo: string;
  textoOriginal: string;
  textoBraille: string;
  altoContraste: boolean;
  descargas: number;
  fechaCreacion: string;
  ultimaDescarga?: string;
}

/**
 * Obtiene información del dispositivo y navegador
 */
function getDeviceInfo() {
  if (typeof window === 'undefined') return { dispositivo: 'unknown', navegador: 'unknown' };
  
  const ua = navigator.userAgent;
  let dispositivo = 'Desktop';
  let navegador = 'Unknown';
  
  // Detectar dispositivo
  if (/mobile/i.test(ua)) dispositivo = 'Mobile';
  else if (/tablet/i.test(ua)) dispositivo = 'Tablet';
  
  // Detectar navegador
  if (ua.indexOf('Firefox') > -1) navegador = 'Firefox';
  else if (ua.indexOf('Chrome') > -1) navegador = 'Chrome';
  else if (ua.indexOf('Safari') > -1) navegador = 'Safari';
  else if (ua.indexOf('Edge') > -1) navegador = 'Edge';
  
  return { dispositivo, navegador };
}

/**
 * Clase para manejar las peticiones al backend
 */
class ApiService {
  private baseUrl: string;
  private userId: number = 1; // ID de usuario por defecto

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadUserFromStorage();
  }

  /**
   * Carga el usuario desde localStorage si existe
   */
  private loadUserFromStorage() {
    if (typeof window !== 'undefined') {
      // La aplicación guarda el usuario en 'braille_user' desde AuthContext
      const userStr = localStorage.getItem('braille_user') || localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            this.userId = user.id;
          }
        } catch (error) {
          console.error('Error al cargar usuario:', error);
        }
      }
    }
  }

  /**
   * Establece el ID del usuario actual
   */
  setUserId(userId: number) {
    this.userId = userId;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getUserId(): number {
    return this.userId;
  }

  /**
   * Realiza una conversión texto ↔ Braille
   */
  async convertir(
    texto: string,
    tipo: 'texto-a-braille' | 'braille-a-texto',
    guardar: boolean = true
  ): Promise<ConversionResponseData> {
    const { dispositivo, navegador } = getDeviceInfo();
    
    const requestData: ConversionRequestData = {
      texto,
      tipo,
      dispositivo,
      navegador,
    };

    const response = await fetch(
      `${this.baseUrl}/convertir?userId=${this.userId}&guardar=${guardar}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en conversión: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene el historial completo del usuario
   */
  async obtenerHistorial(limite: number = 50): Promise<HistorialItem[]> {
    const response = await fetch(
      `${this.baseUrl}/historial?userId=${this.userId}&limite=${limite}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener historial: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene historial filtrado por tipo
   */
  async obtenerHistorialPorTipo(
    tipo: 'texto-a-braille' | 'braille-a-texto',
    limite: number = 50
  ): Promise<HistorialItem[]> {
    const response = await fetch(
      `${this.baseUrl}/historial/tipo/${tipo}?userId=${this.userId}&limite=${limite}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener historial por tipo: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Elimina un elemento del historial
   */
  async eliminarConversion(id: number): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/historial/${id}?userId=${this.userId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Error al eliminar conversión: ${response.statusText}`);
    }

    // Backend devuelve 204 No Content en caso de éxito; manejar sin intentar parsear JSON
    if (response.status === 204) {
      return true;
    }

    try {
      const data = await response.json();
      return data?.success ?? true;
    } catch (err) {
      // Si no hay body JSON, asumimos que fue exitoso
      return true;
    }
  }

  /**
   * Limpia todo el historial del usuario
   */
  async limpiarHistorial(): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/historial?userId=${this.userId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Error al limpiar historial: ${response.statusText}`);
    }
  }

  /**
   * Obtiene estadísticas del usuario
   */
  async obtenerEstadisticas(): Promise<EstadisticasData> {
    const response = await fetch(
      `${this.baseUrl}/historial/estadisticas?userId=${this.userId}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Crea una nueva señalética
   */
  async crearSenaletica(data: SenaleticaRequestData): Promise<SenaleticaResponseData> {
    const response = await fetch(
      `${this.baseUrl}/senaletica?userId=${this.userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al crear señalética: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene todas las señaléticas del usuario
   */
  async obtenerSenaleticas(): Promise<SenaleticaResponseData[]> {
    const response = await fetch(
      `${this.baseUrl}/senaletica?userId=${this.userId}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener señaléticas: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene una señalética por ID
   */
  async obtenerSenaletica(id: number): Promise<SenaleticaResponseData> {
    const response = await fetch(
      `${this.baseUrl}/senaletica/${id}?userId=${this.userId}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener señalética: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Registra una descarga de señalética
   */
  async registrarDescarga(id: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/senaletica/${id}/descarga?userId=${this.userId}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`Error al registrar descarga: ${response.statusText}`);
    }
  }

  /**
   * Elimina una señalética
   */
  async eliminarSenaletica(id: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/senaletica/${id}?userId=${this.userId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Error al eliminar señalética: ${response.statusText}`);
    }
  }

  /**
   * Obtiene señaléticas populares
   */
  async obtenerSenaleticasPopulares(limite: number = 10): Promise<SenaleticaResponseData[]> {
    const response = await fetch(
      `${this.baseUrl}/senaletica/populares?userId=${this.userId}&limite=${limite}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener señaléticas populares: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Verifica el estado del backend
   */
  async verificarConexion(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/test`);
      return response.ok;
    } catch (error) {
      console.error('Error al verificar conexión con backend:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();

// Exportar también la clase para poder crear instancias personalizadas
export default ApiService;
