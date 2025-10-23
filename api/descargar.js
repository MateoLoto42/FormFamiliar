import XLSX from 'xlsx';
import { datosGuardados } from './guardar.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    if (datosGuardados.length === 0) {
      return res.status(404).json({ error: 'No hay datos para descargar' });
    }

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos para Excel
    const excelData = datosGuardados.map(registro => ({
      'Fecha': new Date(registro.timestamp).toLocaleString('es-AR'),
      'Titular Nombre': registro.titular_nombre,
      'Titular Apellido': registro.titular_apellido,
      'Titular DNI': registro.titular_dni,
      'Titular Email': registro.titular_email,
      'Familiar Nombre': registro.familiar_nombre,
      'Familiar Apellido': registro.familiar_apellido,
      'Familiar DNI': registro.familiar_dni,
      'Parentesco': registro.parentesco,
      'Edad': registro.edad
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grupo Familiar');

    // Generar buffer de Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="grupo_familiar_${Date.now()}.xlsx"`);
    res.setHeader('Content-Length', excelBuffer.length);

    // Enviar archivo
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error al generar Excel: ' + error.message 
    });
  }
}