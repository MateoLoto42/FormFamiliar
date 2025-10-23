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

    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const datos = {
            titular: {
                nombre: document.querySelector('input[name="nombre_titular"]').value,
                apellido: document.querySelector('input[name="apellido_titular"]').value,
                dni: document.querySelector('input[name="dni_titular"]').value,
                email: document.querySelector('input[name="email_titular"]').value
            },
            familiares: []
        };

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

        mostrarMensaje('🔄 Enviando datos...', 'info');

        try {
            const response = await fetch('/api/guardar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            const result = await response.json();

            if (result.success) {
                mostrarMensaje('✅ ' + result.message, 'success');
                formulario.reset();
                contenedor.innerHTML = '';
                contadorFamiliares = 0;
                agregarFamiliar();
            } else {
                mostrarMensaje('❌ ' + result.error, 'danger');
            }
        } catch (error) {
            mostrarMensaje('❌ Error de conexión', 'danger');
        }
    });

    function mostrarMensaje(mensaje, tipo) {
        mensajeDiv.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
    }

    //agregarFamiliar();
});