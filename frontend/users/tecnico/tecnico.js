document.addEventListener('DOMContentLoaded', () => {
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

    let headersExpanded = false;

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
            loadAndDisplayChargers();
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
                            <th style="text-align: right; padding-left: 100px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chargers.map(charger => `
                            <tr id="charger-row-${charger.id}">
                                <td>${charger.id}</td>
                                <td style="text-align: right; padding-left: 100px; white-space: nowrap;">
                                    <button class="btn-details" data-id="${charger.id}">Detalles</button>
                                    <button class="btn-update" data-id="${charger.id}">Actualizar</button>
                                    <button class="btn-report" data-id="${charger.id}">Reportar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            tableContainer.innerHTML = tableHTML;
            tableContainer.classList.remove('hidden');

            tableContainer.querySelectorAll('.btn-details').forEach(button => {
                button.addEventListener('click', () => {
                    const chargerId = button.dataset.id;
                    showChargerDetails(chargerId);
                });
            });

            tableContainer.querySelectorAll('.btn-update').forEach(button => {
                button.addEventListener('click', () => {
                    const chargerId = button.dataset.id;
                    showUpdateFormModal(chargerId);
                });
            });

            tableContainer.querySelectorAll('.btn-report').forEach(button => {
                button.addEventListener('click', () => {
                    const chargerId = button.dataset.id;
                    reportIssue(chargerId);
                });
            });

        } catch (error) {
            console.error('Error al cargar los cargadores:', error);
            tableContainer.innerHTML = '<p>Error al cargar los cargadores.</p>';
        }
    }

    function showChargerDetails(chargerId) {
        fetch('/api/chargers')
            .then(response => response.json())
            .then(chargers => {
                const charger = chargers.find(ch => ch.id == chargerId);
                if (charger) {
                    const row = document.getElementById(`charger-row-${charger.id}`);

                    if (!headersExpanded) {
                        const thead = row.closest('table').querySelector('thead tr');
                        thead.innerHTML = `
                            <th>ID</th>
                            <th>Estado</th>
                            <th>Coordenadas</th>
                            <th>Precio</th>
                            <th>Horario</th>
                            <th style="text-align: right; padding-left: 100px;">Acciones</th>
                        `;
                        headersExpanded = true;
                    }

                    row.innerHTML = `
                        <td>${charger.id}</td>
                        <td>${charger.status}</td>
                        <td>${charger.lat}, ${charger.lon}</td>
                        <td>${charger.price}</td>
                        <td>${charger.availability.start} - ${charger.availability.end}</td>
                        <td style="text-align: right; padding-left: 100px; white-space: nowrap;">
                            <button class="btn-update" data-id="${charger.id}">Actualizar</button>
                            <button class="btn-report" data-id="${charger.id}">Reportar</button>
                        </td>
                    `;
                } else {
                    alert('Cargador no encontrado.');
                }
            })
            .catch(error => console.error('Error al obtener detalles del cargador:', error));
    }

    function showUpdateFormModal(chargerId) {
        const modal = document.createElement('div');
        modal.classList.add('modal-overlay');
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Cambiar Estado del Cargador</h3>
                <select id="status-select">
                    <option value="available">Disponible</option>
                    <option value="occupied">Ocupado</option>
                    <option value="in-repair">En Reparación</option>
                </select>
                <div class="modal-buttons">
                    <button id="confirm-update" class="btn">Actualizar</button>
                    <button id="cancel-update" class="btn">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('cancel-update').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('confirm-update').addEventListener('click', () => {
            const selectedStatus = document.getElementById('status-select').value;
            updateChargerStatus(chargerId, selectedStatus);
            document.body.removeChild(modal);
        });
    }

    async function reportIssue(chargerId) {
        const issue = prompt('Describe la incidencia:');
        if (!issue) return alert('La descripcion de la incidencia es obligatoria.');

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

    async function updateChargerStatus(chargerId, status) {
        try {
            const response = await fetch(`/api/chargers/${chargerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                alert('Estado del cargador actualizado correctamente.');
                loadAndDisplayChargers();
            } else {
                const errorData = await response.json();
                alert(`Error al actualizar el cargador: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error al actualizar el estado del cargador:', error);
            alert('Error al actualizar el estado del cargador.');
        }
    }

    if (btnShowChargers) {
        btnShowChargers.addEventListener('click', loadAndDisplayChargers);
    } else {
        console.error('El boton Mostrar Cargadores no se encontro en el DOM.');
    }

    loadAndDisplayChargers();
});