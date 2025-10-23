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
    console.log('✅ API funcionando - Datos recibidos');
    
    const datos = req.body;
    console.log('Datos del formulario:', JSON.stringify(datos, null, 2));

    // Simular éxito por ahora
    res.status(200).json({ 
      success: true, 
      message: `✅ Prueba exitosa! Se recibieron datos de ${datos.titular.nombre} ${datos.titular.apellido} con ${datos.familiares.length} familiar(es)`
    });

  } catch (error) {
    console.error('❌ Error en API:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno: ' + error.message 
    });
  }
}