let contadorFamiliares = 0;

document.addEventListener('DOMContentLoaded', function() {
    const btnAgregar = document.getElementById('agregar-familiar');
    const contenedor = document.getElementById('contenedor-familiares');
    const formulario = document.getElementById('formulario-familiar');
    const mensajeDiv = document.getElementById('mensaje');

    function agregarFamiliar() {
        contadorFamiliares++;
        
        const nuevoFamiliar = document.createElement('div');
        nuevoFamiliar.className = 'card mb-3 familiar-card';
        nuevoFamiliar.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center bg-light">
                <h6 class="mb-0">👤 Familiar ${contadorFamiliares}</h6>
                <button type="button" class="btn btn-outline-danger btn-sm eliminar-familiar">
                    🗑️ Eliminar
                </button>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Nombre" required>
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Apellido" required>
                    </div>
                    <div class="col-md-4">
                        <input type="number" class="form-control" placeholder="DNI">
                    </div>
                    <div class="col-md-4">
                        <select class="form-select" required>
                            <option value="">Parentesco</option>
                            <option value="Cónyuge">Cónyuge</option>
                            <option value="Hijo/a">Hijo/a</option>
                            <option value="Padre">Padre</option>
                            <option value="Madre">Madre</option>
                            <option value="Hermano/a">Hermano/a</option>
                            <option value="Abuelo/a">Abuelo/a</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <input type="number" class="form-control" placeholder="Edad">
                    </div>
                </div>
            </div>
        `;
        
        contenedor.appendChild(nuevoFamiliar);
        
        // Hacer scroll al nuevo familiar
        nuevoFamiliar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    btnAgregar.addEventListener('click', agregarFamiliar);

    contenedor.addEventListener('click', function(e) {
        if (e.target.classList.contains('eliminar-familiar')) {
            if (document.querySelectorAll('.familiar-card').length > 1) {
                e.target.closest('.familiar-card').remove();
                actualizarNumerosFamiliares();
            } else {
                mostrarMensaje('❌ Debe haber al menos un familiar', 'warning');
            }
        }
    });

    function actualizarNumerosFamiliares() {
        const familiares = document.querySelectorAll('.familiar-card');
        familiares.forEach((familiar, index) => {
            const titulo = familiar.querySelector('h6');
            titulo.textContent = `👤 Familiar ${index + 1}`;
        });
        contadorFamiliares = familiares.length;
    }

    // Manejar envío del formulario
    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validaciones
        if (contadorFamiliares === 0) {
            mostrarMensaje('❌ Por favor agregue al menos un familiar', 'danger');
            return;
        }

        const datos = {
            titular: {
                nombre: document.querySelector('input[name="nombre_titular"]').value.trim(),
                apellido: document.querySelector('input[name="apellido_titular"]').value.trim(),
                dni: document.querySelector('input[name="dni_titular"]').value.trim(),
                email: document.querySelector('input[name="email_titular"]').value.trim()
            },
            familiares: []
        };

        // Validar datos del titular
        if (!datos.titular.nombre || !datos.titular.apellido || !datos.titular.dni) {
            mostrarMensaje('❌ Complete todos los datos del titular', 'danger');
            return;
        }

        // Recoger datos de familiares
        let hayErrores = false;
        document.querySelectorAll('.familiar-card').forEach((familiar, index) => {
            const inputs = familiar.querySelectorAll('input, select');
            const nombre = inputs[0].value.trim();
            const apellido = inputs[1].value.trim();
            const parentesco = inputs[3].value;
            
            if (!nombre || !apellido || !parentesco) {
                hayErrores = true;
                mostrarMensaje(`❌ Complete todos los campos del Familiar ${index + 1}`, 'danger');
                return;
            }
            
            datos.familiares.push({
                nombre: nombre,
                apellido: apellido,
                dni: inputs[2].value.trim(),
                parentesco: parentesco,
                edad: inputs[4].value
            });
        });

        if (hayErrores) return;

        // Deshabilitar botón para evitar múltiples envíos
        const submitBtn = formulario.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '🔄 Enviando...';
        submitBtn.disabled = true;

        try {
            mostrarMensaje('🔄 Enviando datos a Google Sheets...', 'info');
            
            const resultado = await enviarAGoogleSheets(datos);
            
            mostrarMensaje(`✅ ${resultado.message}`, 'success');
            
            // Limpiar formulario después de 2 segundos
            setTimeout(() => {
                formulario.reset();
                contenedor.innerHTML = '';
                contadorFamiliares = 0;
                agregarFamiliar();
                mensajeDiv.innerHTML = '';
            }, 2000);
            
        } catch (error) {
            console.error('Error completo:', error);
            mostrarMensaje(`❌ Error: ${error.message}`, 'danger');
        } finally {
            // Rehabilitar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    function mostrarMensaje(mensaje, tipo) {
        mensajeDiv.innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
    }

    // Agregar primer familiar automáticamente
    //agregarFamiliar();
});

async function enviarAGoogleSheets(datos) {
    // 🔥 Usar la API de Vercel en lugar de Google Apps Script
    const API_URL = '/api/guardar-datos';
    
    console.log('📤 Enviando datos:', datos);
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    });

    console.log('📥 Respuesta recibida:', response);

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('📋 Resultado:', result);
    
    if (!result.success) {
        throw new Error(result.error || 'Error del servidor');
    }

    return result;
}