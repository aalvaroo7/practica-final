document.addEventListener('DOMContentLoaded', () => {
    // Listener de redirección para los botones
    const returnBtn = document.getElementById('return-btn');
    const returnBtn2 = document.getElementById('return-btn2');
    const tecnicoLoginContainer = document.getElementById('tecnico-login-container');
    const tecnicoContainer = document.getElementById('tecnico-container');
    const errorMessage = document.getElementById('tecnico-error-message');
    const sections = document.querySelectorAll('main > section');
    const btnUpdateStatus = document.getElementById('btn-update-charger-status');
    const btnViewDetails = document.getElementById('btn-view-charger-details');
    const btnReportIssues = document.getElementById('btn-report-issues');
    const updateStatusForm = document.getElementById('update-status-form');
    const tableContainer = document.getElementById('charger-table-container');
    const btnShowChargers = document.getElementById('btn-show-chargers');
    const loginForm = document.getElementById('tecnico-login-form');

    function hideAllSections() {
        sections.forEach(section => section.classList.add('hidden'));
    }

    function showSection(sectionId) {
        hideAllSections();
        document.getElementById(sectionId).classList.remove('hidden');
    }

    if (btnUpdateStatus) {
        btnUpdateStatus.addEventListener('click', () => {
            showSection('update-charger-status');
            loadChargers(); // Cargar los datos al mostrar la sección
        });
    }

    if (btnViewDetails) {
        btnViewDetails.addEventListener('click', () => showSection('view-charger-details'));
    }

    if (btnReportIssues) {
        btnReportIssues.addEventListener('click', () => showSection('report-issues'));
    }

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
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/config');
                const data = await response.json();
                const tecnicoCreds = data.tecnico;

                if (username === tecnicoCreds.username && password === tecnicoCreds.password) {
                    tecnicoLoginContainer.classList.add('hidden');
                    tecnicoContainer.classList.remove('hidden');
                } else {
                    errorMessage.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error al obtener credenciales:', error);
            }
        });
    }

    // Función para mostrar los cargadores en una tabla
    function displayChargers(chargers) {
        const table = document.createElement('table');
        table.classList.add('charger-table');

        // Crear encabezado de la tabla
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Latitud</th>
                <th>Longitud</th>
                <th>Precio (€)</th>
                <th>Acciones</th>
            </tr>
        `;
        table.appendChild(thead);

        // Crear cuerpo de la tabla
        const tbody = document.createElement('tbody');
        chargers.forEach(charger => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${charger.id}</td>
                <td>${charger.type}</td>
                <td>${charger.status}</td>
                <td>${charger.lat || 'N/A'}</td>
                <td>${charger.lon || 'N/A'}</td>
                <td>${charger.price || 'N/A'}</td>
                <td>
                    <button class="btn-report" data-id="${charger.id}">Reportar Incidencia</button>
                    <button class="btn-details" data-id="${charger.id}">Ver Detalles</button>
                    <button class="btn-update" data-id="${charger.id}">Actualizar Estado</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // Limpiar el contenedor y añadir la tabla
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);

        // Asignar eventos a los botones
        document.querySelectorAll('.btn-report').forEach(button => {
            button.addEventListener('click', () => {
                const chargerId = button.getAttribute('data-id');
                reportIssue(chargerId);
            });
        });

        document.querySelectorAll('.btn-details').forEach(button => {
            button.addEventListener('click', () => {
                const chargerId = button.getAttribute('data-id');
                showChargerDetails(chargerId, chargers);
            });
        });

        document.querySelectorAll('.btn-update').forEach(button => {
            button.addEventListener('click', () => {
                const chargerId = button.getAttribute('data-id');
                showUpdateForm(chargerId);
            });
        });
    }

    // Función para cargar y mostrar la tabla de cargadores
    async function loadAndDisplayChargers() {
        try {
            const response = await fetch('/api/chargers');
            if (!response.ok) throw new Error('Error al obtener los cargadores');
            const chargers = await response.json();

            const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Latitud</th>
                        <th>Longitud</th>
                        <th>Precio (€)</th>
                        <th>Disponibilidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${chargers.map(charger => `
                        <tr>
                            <td>${charger.id}</td>
                            <td>${charger.type}</td>
                            <td>${charger.status}</td>
                            <td>${charger.lat}</td>
                            <td>${charger.lon}</td>
                            <td>${charger.price}</td>
                            <td>${charger.availability.start} - ${charger.availability.end}</td>
                            <td>
                                <button onclick="showChargerDetails(${charger.id})">Detalles</button>
                                <button onclick="showUpdateForm(${charger.id})">Actualizar</button>
                                <button onclick="reportIssue(${charger.id})">Reportar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

            tableContainer.innerHTML = tableHTML;
            tableContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error al cargar los cargadores:', error);
            tableContainer.innerHTML = '<p>Error al cargar los cargadores.</p>';
        }
    }

    // Función para mostrar los detalles del cargador
    function showChargerDetails(chargerId) {
        fetch('/api/chargers')
            .then(response => response.json())
            .then(chargers => {
                const charger = chargers.find(ch => ch.id == chargerId);
                if (charger) {
                    const detailsHTML = `
                    <div>
                        <h3>Detalles del Cargador</h3>
                        <p>ID: ${charger.id}</p>
                        <p>Tipo: ${charger.type}</p>
                        <p>Estado: ${charger.status}</p>
                        <p>Latitud: ${charger.lat}</p>
                        <p>Longitud: ${charger.lon}</p>
                        <p>Precio: ${charger.price}</p>
                        <p>Disponibilidad: ${charger.availability.start} - ${charger.availability.end}</p>
                    </div>
                `;
                    // Mostrar en un modal o contenedor
                    document.getElementById('details-modal').innerHTML = detailsHTML;
                    document.getElementById('details-modal').classList.remove('hidden');
                } else {
                    alert('Cargador no encontrado.');
                }
            })
            .catch(error => console.error('Error al obtener detalles del cargador:', error));
    }

    // Función para reportar incidencias
    async function reportIssue(chargerId) {
        const issue = prompt('Describe la incidencia:');
        if (!issue) return alert('La descripción de la incidencia es obligatoria.');

        try {
            const response = await fetch('/api/issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chargerId, issue })
            });

            if (response.ok) {
                alert('Incidencia reportada correctamente.');
            } else {
                const errorData = await response.json();
                alert(`Error al reportar la incidencia: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error al reportar la incidencia:', error);
            alert('Error al reportar la incidencia.');
        }
    }

// Función para mostrar el formulario de actualización de estado
    function showUpdateForm(chargerId) {
        const validStatuses = ['available', 'occupied', 'in-repair'];
        const newStatus = prompt('Ingrese el nuevo estado del cargador (available, occupied, in-repair):').toLowerCase();

        if (!validStatuses.includes(newStatus)) {
            return alert('Estado inválido. Los estados válidos son: available, occupied, in-repair.');
        }

        updateChargerStatus(chargerId, newStatus);
    }

// Función para actualizar el estado del cargador
    async function updateChargerStatus(chargerId, status) {
        try {
            const response = await fetch(`/api/chargers/${chargerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                alert('Estado del cargador actualizado correctamente.');
                loadAndDisplayChargers(); // Recargar la tabla
            } else {
                const errorData = await response.json();
                alert(`Error al actualizar el cargador: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error al actualizar el estado del cargador:', error);
            alert('Error al actualizar el estado del cargador.');
        }
    }

    // Función para cargar los cargadores desde el servidor
    async function loadChargers() {
        try {
            const response = await fetch('/api/chargers');
            const chargers = await response.json();
            displayChargers(chargers);
        } catch (error) {
            console.error('Error al cargar los cargadores:', error);
        }
    }

    // Evento para mostrar los cargadores al hacer clic en el botón
    if (btnShowChargers) {
        btnShowChargers.addEventListener('click', loadAndDisplayChargers);
    } else {
        console.error('El botón Mostrar Cargadores no se encontró en el DOM.');
    }

    // Cargar los datos al iniciar
    loadChargers();
});