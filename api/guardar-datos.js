// Simulamos una "base de datos" en memoria
let datosGuardados = [];

export default async function handler(req, res) {
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
    const timestamp = new Date();
    
    // 🔥 MEJORA: Cada familiar en una fila SEPARADA con mismos datos del titular
    const nuevosRegistros = datos.familiares.map(familiar => {
      return {
        id: timestamp.getTime() + Math.random(), // ID único
        timestamp: timestamp.toISOString(),
        fecha_legible: timestamp.toLocaleString('es-AR'),
        titular_nombre: datos.titular.nombre,
        titular_apellido: datos.titular.apellido,
        titular_dni: datos.titular.dni,
        titular_email: datos.titular.email,
        familiar_nombre: familiar.nombre,
        familiar_apellido: familiar.apellido,
        familiar_dni: familiar.dni || '',
        parentesco: familiar.parentesco,
        edad: familiar.edad || ''
      };
    });

    // Agregar todos los nuevos registros
    datosGuardados.push(...nuevosRegistros);

    console.log(`✅ Guardados ${nuevosRegistros.length} registros. Total en sistema: ${datosGuardados.length}`);

    res.status(200).json({ 
      success: true, 
      message: `Se guardaron ${datos.familiares.length} familiar(es) correctamente`,
      totalRegistros: datosGuardados.length,
      detalles: `Titular: ${datos.titular.nombre} ${datos.titular.apellido}`
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al guardar los datos: ' + error.message 
    });
  }
}

// Exportamos los datos para que la otra API pueda acceder
export { datosGuardados };