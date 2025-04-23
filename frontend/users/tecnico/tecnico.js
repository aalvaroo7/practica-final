document.addEventListener('DOMContentLoaded', () => {
    const returnBtn = document.getElementById('return-btn');
    const returnBtn2 = document.getElementById('return-btn2');
    const tecnicoLoginContainer = document.getElementById('tecnico-login-container');
    const tecnicoContainer = document.getElementById('tecnico-container');
    const errorMessage = document.getElementById('tecnico-error-message');
    const btnShowChargers = document.getElementById('btn-show-chargers');
    const loginForm = document.getElementById('tecnico-login-form');
    const tableContainer = document.getElementById('charger-table-container');

    let detailsShown = {};

    function hideAllSections() {
        document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));
    }

    function showSection(sectionId) {
        hideAllSections();
        document.getElementById(sectionId).classList.remove('hidden');
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
                <table class="charger-table">
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

            detailsShown = {};

            chargers.forEach(charger => {
                detailsShown[charger.id] = false;
            });

            tableContainer.querySelectorAll('.btn-details').forEach(button => {
                button.addEventListener('click', () => toggleChargerDetails(button.dataset.id));
            });

            reloadButtons();
        } catch (error) {
            console.error('Error al cargar los cargadores:', error);
            tableContainer.innerHTML = '<p>Error al cargar los cargadores.</p>';
        }
    }

    function toggleChargerDetails(chargerId) {
        const row = document.getElementById(`charger-row-${chargerId}`);
        const isDetailsShown = detailsShown[chargerId];

        if (!isDetailsShown) {
            fetch('/api/chargers')
                .then(response => response.json())
                .then(chargers => {
                    const charger = chargers.find(ch => ch.id == chargerId);
                    if (charger) {
                        const detailsDiv = document.createElement('div');
                        detailsDiv.id = `details-div-${chargerId}`;
                        detailsDiv.innerHTML = `
                            <strong>Estado:</strong> ${charger.status}<br>
                            <strong>Coordenadas:</strong> ${charger.lat}, ${charger.lon}<br>
                            <strong>Precio:</strong> ${charger.price} €<br>
                            <strong>Horario:</strong> ${charger.availability.start} - ${charger.availability.end}
                        `;
                        detailsDiv.style.marginTop = '10px';
                        row.querySelector('td').appendChild(detailsDiv);

                        detailsShown[chargerId] = true;

                        const detailsButton = row.querySelector('.btn-details');
                        if (detailsButton) detailsButton.textContent = 'Ocultar';
                    } else {
                        alert('Cargador no encontrado.');
                    }
                })
                .catch(error => console.error('Error al obtener detalles del cargador:', error));
        } else {
            const detailsDiv = document.getElementById(`details-div-${chargerId}`);
            if (detailsDiv) detailsDiv.remove();

            detailsShown[chargerId] = false;

            const detailsButton = row.querySelector('.btn-details');
            if (detailsButton) detailsButton.textContent = 'Detalles';
        }
    }

    function reloadButtons() {
        tableContainer.querySelectorAll('.btn-update').forEach(button => {
            button.addEventListener('click', () => {
                const chargerId = button.dataset.id;
                showUpdateFormModal(chargerId);
            });
        });

        tableContainer.querySelectorAll('.btn-report').forEach(button => {
            button.addEventListener('click', () => {
                const chargerId = button.dataset.id;
                showReportIssueModal(chargerId);
            });
        });
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

    function showReportIssueModal(chargerId) {
        const modal = document.createElement('div');
        modal.classList.add('modal-overlay');
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Reportar Problema</h3>
                <textarea id="issue-description" placeholder="Describe el problema..." rows="5" style="width: 100%;"></textarea>
                <div class="modal-buttons">
                    <button id="confirm-report" class="btn">Reportar</button>
                    <button id="cancel-report" class="btn">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('cancel-report').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('confirm-report').addEventListener('click', async () => {
            const description = document.getElementById('issue-description').value.trim();
            if (!description) {
                alert('La descripción del problema es obligatoria.');
                return;
            }

            try {
                const response = await fetch('/api/problems', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chargerId, description })
                });

                if (response.ok) {
                    alert('Problema reportado correctamente.');
                    document.body.removeChild(modal);
                } else {
                    const errorData = await response.json();
                    alert(`Error al reportar el problema: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Error al reportar el problema:', error);
                alert('Error al reportar el problema.');
            }
        });
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
        console.error('El botón Mostrar Cargadores no se encontró en el DOM.');
    }

    loadAndDisplayChargers();
});