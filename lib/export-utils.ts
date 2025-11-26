/**
 * Utilidades para exportar/descargar contenido en diferentes formatos
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Descarga contenido como archivo de texto
 */
export const downloadAsText = (content: string, filename: string = 'braille-conversion.txt') => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Descarga contenido como PNG
 */
export const downloadAsPNG = async (elementId: string, filename: string = 'braille-conversion.png') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#0A0E27',
    scale: 2, // Alta calidad
  });

  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  });
};

/**
 * Descarga contenido como PDF
 */
export const downloadAsPDF = async (elementId: string, filename: string = 'braille-conversion.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#0A0E27',
    scale: 2,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
};

/**
 * Descarga contenido como Word (formato DOCX simple)
 */
export const downloadAsWord = (
  textoOriginal: string,
  resultado: string,
  tipo: string,
  filename: string = 'braille-conversion.docx'
) => {
  // Crear contenido HTML simple que Word puede abrir
  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Conversión Braille</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          padding: 40px;
        }
        h1 {
          color: #4F46E5;
          border-bottom: 3px solid #4F46E5;
          padding-bottom: 10px;
        }
        .section {
          margin: 30px 0;
          padding: 20px;
          background-color: #F3F4F6;
          border-radius: 8px;
        }
        .label {
          font-weight: bold;
          color: #374151;
          margin-bottom: 10px;
        }
        .content {
          font-size: 14px;
          line-height: 1.8;
          color: #1F2937;
        }
        .braille {
          font-family: 'Courier New', monospace;
          font-size: 24px;
          letter-spacing: 2px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #D1D5DB;
          font-size: 12px;
          color: #6B7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Conversión Braille</h1>
      
      <div class="section">
        <div class="label">Tipo de Conversión:</div>
        <div class="content">${tipo === 'texto-a-braille' ? 'Texto → Braille' : 'Braille → Texto'}</div>
      </div>
      
      <div class="section">
        <div class="label">Texto Original:</div>
        <div class="content ${tipo === 'braille-a-texto' ? 'braille' : ''}">${textoOriginal}</div>
      </div>
      
      <div class="section">
        <div class="label">Resultado:</div>
        <div class="content ${tipo === 'texto-a-braille' ? 'braille' : ''}">${resultado}</div>
      </div>
      
      <div class="footer">
        Generado por Sistema de Conversión Braille - ${new Date().toLocaleDateString('es-ES')}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Imprime el contenido de un elemento
 */
export const printElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) {
    throw new Error('No se pudo abrir la ventana de impresión');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Imprimir - Conversión Braille</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .braille {
          font-family: 'Courier New', monospace;
          font-size: 24px;
          letter-spacing: 2px;
        }
        @media print {
          body {
            padding: 40px;
          }
        }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

/**
 * Copia texto al portapapeles
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error al copiar:', err);
    return false;
  }
};
