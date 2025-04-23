document.addEventListener('DOMContentLoaded', async () => {
    // Elementos y variables globales
    const loginBtn = document.getElementById('login-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const volverBtn = document.querySelector('#Volver-btn button');
    const chargerListDiv = document.getElementById('charger-list');
    const addUserForm = document.getElementById('add-user-form');
    const btnRegresar = document.getElementById('btn-regresar');
    const btnManageChargers = document.getElementById('btn-manage-chargers');
    const editModal = document.getElementById('edit-charger-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    const adminContainer = document.getElementById('admin-container');
    const btnManageUsers = document.getElementById('btn-manage-users');
    const btnViewStats = document.getElementById('btn-view-stats');
    const btnViewLogs = document.getElementById('btn-view-logs');
    const addChargerForm = document.getElementById('add-charger-form');

    // Función para ocultar todos los paneles y el modal de cargadores
    function hideAllPanels() {
        const panels = document.querySelectorAll('main > section');
        panels.forEach(panel => {
            panel.classList.remove('visible');
            panel.style.display = 'none';
            panel.classList.add('hidden');
        });
        if (editModal) {
            editModal.classList.add('hidden');
        }
    }

    // Función para mostrar un panel específico
    function togglePanel(panelId) {
        hideAllPanels();
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove('hidden');
            panel.classList.add('visible');
            panel.style.display = 'block';
        } else {
            console.error('No se encontró el panel con ID:', panelId);
        }
    }

    // Eventos de navegación entre paneles
    if (btnManageChargers) {
        btnManageChargers.addEventListener('click', () => {
            if (editModal) {
                editModal.classList.add('hidden');
            }
            togglePanel('manage-chargers');
        });
    }

    if (cancelEdit) {
        cancelEdit.addEventListener('click', () => {
            if (editModal) {
                editModal.classList.add('hidden');
            }
        });
    }

    if (btnRegresar) {
        btnRegresar.addEventListener('click', () => {
            hideAllPanels();
            btnRegresar.style.display = 'none';
        });
    }

    if (btnManageUsers) {
        btnManageUsers.addEventListener('click', () => {
            togglePanel('manage-users');
        });
    }

    if (btnViewStats) {
        btnViewStats.addEventListener('click', () => {
            togglePanel('view-stats');
            loadStats();
        });
    }

    if (btnViewLogs) {
        btnViewLogs.addEventListener('click', () => {
            togglePanel('view-logs');
            loadLogs();
        });
    }

    // Eventos para redirección
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '/users/user/user.html';
        });
    }

    if (volverBtn) {
        volverBtn.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }

    // Autenticación del administrador
    adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('/config');
            if (!response.ok) return;

            const data = await response.json();
            const adminCreds = data.admin;

            if (username === adminCreds.username && password === adminCreds.password) {
                document.getElementById('admin-login-container').classList.add('hidden');
                document.getElementById('admin-container').classList.remove('hidden');
            } else {
                document.getElementById('admin-error-message').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error al obtener credenciales:', error);
        }
    });

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (event) => {
        if (editModal && !editModal.contains(event.target) && !event.target.classList.contains('edit-charger-btn')) {
            editModal.classList.add('hidden');
        }
    });

    if (addChargerForm) {
        addChargerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const id = document.getElementById('charger-id').value.trim();
            const type = document.getElementById('charger-type').value;
            const status = document.getElementById('charger-status').value;
            const lat = parseFloat(document.getElementById('charger-lat').value);
            const lon = parseFloat(document.getElementById('charger-lon').value);
            const availability = {
                start: document.getElementById('availability-start').value,
                end: document.getElementById('availability-end').value
            };
            const price = parseFloat(document.getElementById('charger-price').value);

            if (!id || isNaN(lat) || isNaN(lon)) {
                alert('Completa todos los campos correctamente.');
                return;
            }

            const newCharger = { id, lat, lon, type, status, price, availability };

            try {
                const response = await fetch('/api/chargers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCharger)
                });
                if (response.ok) {
                    alert('Cargador agregado correctamente.');
                    addChargerForm.reset();
                    loadChargers();
                } else {
                    alert('Error al agregar el cargador.');
                }
            } catch (error) {
                console.error('Error en la petición:', error);
            }
        });
    }

    async function loadChargers() {
        try {
            const response = await fetch('/api/chargers');
            const chargers = await response.json();
            displayChargers(chargers);
        } catch (error) {
            console.error('Error al cargar cargadores:', error);
        }
    }

    document.getElementById('edit-charger-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = document.getElementById('edit-charger-id').textContent.trim();
        const type = document.getElementById('edit-charger-type').value.trim();
        const status = document.getElementById('edit-charger-status').value.trim();
        const lat = parseFloat(document.getElementById('edit-charger-lat').value);
        const lon = parseFloat(document.getElementById('edit-charger-lon').value);
        const availability = {
            start: document.getElementById('edit-availability-start').value.trim(),
            end: document.getElementById('edit-availability-end').value.trim()
        };
        const price = parseFloat(document.getElementById('edit-charger-price').value);

        if (!id || !type || !status || isNaN(lat) || isNaN(lon) || !availability.start || !availability.end || isNaN(price)) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        const updatedCharger = { id, type, status, lat, lon, availability, price };

        try {
            const response = await fetch(`/api/chargers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCharger)
            });

            if (response.ok) {
                alert('Cargador actualizado correctamente.');
                document.getElementById('edit-charger-modal').classList.add('hidden');
                loadChargers();
            } else {
                const errorText = await response.text();
                console.error('Error del servidor:', errorText);
                alert('Error al actualizar el cargador.');
            }
        } catch (error) {
            console.error('Error al actualizar el cargador:', error);
        }
    });

    async function deleteCharger(event) {
        const id = event.target.getAttribute('data-id');
        if (confirm('¿Estás seguro de eliminar este cargador?')) {
            try {
                const response = await fetch(`/api/chargers/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Cargador eliminado correctamente.');
                    loadChargers();
                } else {
                    alert('Error al eliminar cargador.');
                }
            } catch (error) {
                console.error('Error al eliminar cargador:', error);
            }
        }
    }

    function displayChargers(chargers) {
        chargerListDiv.innerHTML = '';
        const table = document.createElement('table');
        table.classList.add('charger-table');

        const thead = document.createElement('thead');
        thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Latitud</th>
            <th>Longitud</th>
            <th>Precio (€)</th>
            <th>Disponibilidad</th>
            <th>Acciones</th>
        </tr>`;
        table.appendChild(thead);

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
            <td>${charger.availability ? `${charger.availability.start} - ${charger.availability.end}` : 'N/A'}</td>
            <td>
                <button data-id="${charger.id}" class="edit-charger-btn">Editar</button>
                <button data-id="${charger.id}" class="delete-charger-btn">Eliminar</button>
            </td>`;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        chargerListDiv.appendChild(table);

        chargerListDiv.querySelectorAll('.delete-charger-btn').forEach(button => {
            button.addEventListener('click', deleteCharger);
        });
        chargerListDiv.querySelectorAll('.edit-charger-btn').forEach(button => {
            button.addEventListener('click', () => {
                const chargerId = button.getAttribute('data-id');
                const charger = chargers.find(ch => ch.id == chargerId);
                if (!charger) return;
                document.getElementById('edit-charger-id').textContent = charger.id;
                document.getElementById('edit-charger-type').value = charger.type;
                document.getElementById('edit-charger-status').value = charger.status.toLowerCase();
                document.getElementById('edit-charger-lat').value = charger.lat;
                document.getElementById('edit-charger-lon').value = charger.lon;
                document.getElementById('edit-availability-start').value = charger.availability.start;
                document.getElementById('edit-availability-end').value = charger.availability.end;
                document.getElementById('edit-charger-price').value = charger.price;
                editModal.classList.remove('hidden');
            });
        });
    }

    async function loadStats() {
        const statsContainer = document.getElementById('stats-container');
        statsContainer.innerHTML = `
        <canvas id="statsChartBar"></canvas>
        <canvas id="statsChartPie"></canvas>`;
        const ctxBar = document.getElementById('statsChartBar').getContext('2d');
        const ctxPie = document.getElementById('statsChartPie').getContext('2d');

        try {
            const response = await fetch('/api/stats');
            if (!response.ok) return;

            const stats = await response.json();
            const barLabels = Object.keys(stats.reservationsByChargerType);
            const barDataValues = Object.values(stats.reservationsByChargerType);

            new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: barLabels,
                    datasets: [{
                        label: 'Reservas por Tipo de Cargador',
                        data: barDataValues,
                        backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        }
                    }
                }
            });

            const pieLabels = stats.usagePercentage.map(item => item.type);
            const pieDataValues = stats.usagePercentage.map(item => parseFloat(item.usage));

            new Chart(ctxPie, {
                type: 'pie',
                data: {
                    labels: pieLabels,
                    datasets: [{
                        label: 'Porcentaje de Uso por Cargador',
                        data: pieDataValues,
                        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56']
                    }]
                },
                options: {
                    responsive: true
                }
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    async function loadLogs() {
        const logsContainer = document.getElementById('logs-container');
        try {
            const response = await fetch('/api/logs');
            if (response.ok) {
                const data = await response.json();
                const logs = data.logs;
                let tableHTML = '<table class="table-logs"><caption>Logs de Auditoría</caption><thead><tr><th>IP</th><th>Conectado En</th></tr></thead><tbody>';
                logs.forEach(log => {
                    tableHTML += `<tr><td>${log.ip}</td><td>${log.connectedAt}</td></tr>`;
                });
                tableHTML += '</tbody></table>';
                logsContainer.innerHTML = tableHTML;
            } else {
                logsContainer.textContent = 'No se pudieron cargar los logs.';
            }
        } catch (error) {
            console.error('Error al cargar logs:', error);
            logsContainer.textContent = 'Error al cargar logs.';
        }
    }

    particlesJS("particles-js", {
        particles: {
            number: { value: 100, density: { enable: true, value_area: 2000 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: 3 },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 3 }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            },
            modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });

    loadChargers();
});