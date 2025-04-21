document.addEventListener('DOMContentLoaded', () => {
    // Listener de redirección para los botones
    const returnBtn = document.getElementById('return-btn');
    const returnBtn2 = document.getElementById('return-btn2');
    const tecnicoLoginContainer = document.getElementById('tecnico-login-container');
    const tecnicoContainer = document.getElementById('tecnico-container');
    const errorMessage = document.getElementById('tecnico-error-message');
    const sections = document.querySelectorAll('main > section');


    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            window.location.href = '/users/user/user.html';
        });
    }

    if (returnBtn2) {
        returnBtn2.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }

    // Listener para el formulario del técnico
    const tecnicoForm = document.getElementById('tecnico-login-form');
    if (tecnicoForm) {
        tecnicoForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/config');
                const data = await response.json();
                const tecnicoCreds = data.tecnico;

                if (username === tecnicoCreds.username && password === tecnicoCreds.password) {
                    document.getElementById('tecnico-login-container').classList.add('hidden');
                    document.getElementById('tecnico-container').classList.remove('hidden');
                } else {
                    document.getElementById('tecnico-error-message').classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error al obtener credenciales:', error);
            }
        });
    }

    // Listener para actualizar el estado del cargador
    const updateStatusForm = document.getElementById('update-status-form');
    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const chargerId = document.getElementById('charger-id').value;
            const status = document.getElementById('charger-status').value;

            // Detalles técnicos adicionales
            const technicalDetails = {
                power: prompt('Ingrese la potencia del cargador (ej. 50kW):'),
                connectorType: prompt('Ingrese el tipo de conector (ej. Type 2):'),
                lastMaintenance: prompt('Ingrese la última fecha de mantenimiento (YYYY-MM-DD):'),
                manufacturer: prompt('Ingrese el fabricante del cargador:')
            };

            try {
                const response = await fetch(`/api/chargers/${chargerId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status, technicalDetails })
                });

                if (response.ok) {
                    alert('Estado del cargador actualizado correctamente.');
                } else {
                    const errorData = await response.json();
                    alert(`Error al actualizar el cargador: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Error al actualizar el estado del cargador:', error);
                alert('Error al actualizar el estado del cargador.');
            }
        });
    }
});