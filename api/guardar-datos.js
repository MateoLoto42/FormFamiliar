import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const datos = req.body;
    
    // 🔥 CONFIGURA ESTO: Tu Google Apps Script URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby4V2YugCSurfIhvoKFr9YJiM6xarag_JapZqUTWhX08Qt-FaYqOqA6yOLzixHgaa-vWw/exec';
    
    // Enviar datos a Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos)
    });

    const result = await response.text();
    
    if (response.ok) {
      res.status(200).json({ 
        success: true, 
        message: 'Datos guardados en Google Sheets correctamente' 
      });
    } else {
      throw new Error(result);
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al guardar los datos: ' + error.message 
    });
  }
}