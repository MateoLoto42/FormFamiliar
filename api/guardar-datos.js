const { google } = require('googleapis');

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
    
    // Configurar autenticación con Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // 🔥 REEMPLAZA con tu Sheet ID
    const spreadsheetId = '1-ReHAuAJXUdaFty_stQ-1ghHoorbTPC8oiONfp8cuno';

    // Preparar datos
    const filas = datos.familiares.map(familiar => [
      new Date().toISOString(),
      datos.titular.nombre,
      datos.titular.apellido,
      datos.titular.dni,
      datos.titular.email,
      familiar.nombre,
      familiar.apellido,
      familiar.dni,
      familiar.parentesco,
      familiar.edad
    ]);

    // Agregar a Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: filas }
    });

    res.status(200).json({ 
      success: true, 
      message: `Datos de ${datos.familiares.length} familiar(es) guardados` 
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al guardar: ' + error.message 
    });
  }
}