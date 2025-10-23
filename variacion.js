let contadorFamiliares = 0;

document.addEventListener('DOMContentLoaded', function() {
    const btnAgregar = document.getElementById('agregar-familiar');
    const contenedor = document.getElementById('contenedor-familiares');
    const formulario = document.getElementById('formulario-familiar');
    const mensajeDiv = document.getElementById('mensaje');

    function agregarFamiliar() {
        contadorFamiliares++;
        
        const nuevoFamiliar = document.createElement('div');
        nuevoFamiliar.className = 'card mb-3';
        nuevoFamiliar.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Familiar ${contadorFamiliares}</h6>
                <button type="button" class="btn btn-danger btn-sm eliminar-familiar">Eliminar</button>
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
                        </select>
                    </div>
                    <div class="col-md-4">
                        <input type="number" class="form-control" placeholder="Edad">
                    </div>
                </div>
            </div>
        `;
        
        contenedor.appendChild(nuevoFamiliar);
    }

    btnAgregar.addEventListener('click', agregarFamiliar);

    contenedor.addEventListener('click', function(e) {
        if (e.target.classList.contains('eliminar-familiar')) {
            e.target.closest('.card').remove();
            actualizarNumerosFamiliares();
        }
    });

    function actualizarNumerosFamiliares() {
        const familiares = document.querySelectorAll('.card.mb-3');
        familiares.forEach((familiar, index) => {
            const titulo = familiar.querySelector('h6');
            titulo.textContent = `Familiar ${index + 1}`;
        });
        contadorFamiliares = familiares.length;
    }

    // MANEJAR ENVÍO A GOOGLE SHEETS
    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar que haya al menos un familiar
        if (contadorFamiliares === 0) {
            mostrarMensaje('Por favor agregue al menos un familiar', 'danger');
            return;
        }

        const datos = {
            titular: {
                nombre: document.querySelector('input[name="nombre_titular"]').value,
                apellido: document.querySelector('input[name="apellido_titular"]').value,
                dni: document.querySelector('input[name="dni_titular"]').value,
                email: document.querySelector('input[name="email_titular"]').value
            },
            familiares: []
        };

        // Recoger datos de familiares
        document.querySelectorAll('.card.mb-3').forEach(familiar => {
            const inputs = familiar.querySelectorAll('input, select');
            datos.familiares.push({
                nombre: inputs[0].value,
                apellido: inputs[1].value,
                dni: inputs[2].value,
                parentesco: inputs[3].value,
                edad: inputs[4].value
            });
        });

        // Mostrar loading
        mostrarMensaje('🔄 Enviando datos a Google Sheets...', 'info');

        try {
            await enviarAGoogleSheets(datos);
            mostrarMensaje('✅ Datos guardados en Google Sheets correctamente!', 'success');
            
            // Limpiar formulario después de 2 segundos
            setTimeout(() => {
                formulario.reset();
                contenedor.innerHTML = '';
                contadorFamiliares = 0;
                agregarFamiliar(); // Agregar primer familiar nuevamente
                mensajeDiv.innerHTML = '';
            }, 2000);
            
        } catch (error) {
            mostrarMensaje(`❌ Error: ${error.message}`, 'danger');
        }
    });

    function mostrarMensaje(mensaje, tipo) {
        mensajeDiv.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
    }

    // Agregar primer familiar automáticamente
    //agregarFamiliar();
});

// FUNCIÓN PARA ENVIAR A GOOGLE SHEETS
async function enviarAGoogleSheets(datos) {
    // 🔥 IMPORTANTE: Reemplaza esta URL con la de tu Google Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKBLd3YcihDvieSf8eX21iB4M1YSCbBHzPYE9CpeCeKJu0qnFTQP8RDhUDfDl0ceipaw/exec';
    
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        throw new Error('Error al enviar los datos al servidor');
    }

    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
    }

    return result;
}