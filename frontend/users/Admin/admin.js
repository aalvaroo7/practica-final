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
    const socket = new WebSocket('ws://localhost:8080');
    const addChargerForm = document.getElementById('add-charger-form');
    const addChargerBtn = document.getElementById('add-charger-btn');
    const chargerListContainer = document.getElementById('charger-list'); // contenedor para actualizar la lista
    let users = [];



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
            console.log('Click en Gestión de Usuarios');
            togglePanel('manage-users');
        });
    }

    if (btnViewStats) {
        btnViewStats.addEventListener('click', () => {
            console.log('Click en Ver Estadísticas');
            togglePanel('view-stats');
            loadStats();
        });
    }

    if (btnViewLogs) {
        btnViewLogs.addEventListener('click', () => {
            console.log('Click en Ver Logs de Auditoría');
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
        console.log('Intento de login:', username, password);

        try {
            const response = await fetch('/config');
            if (!response.ok) {
                console.error('Error en el servidor:', response.status);
                return;
            }
            const data = await response.json();
            console.log('Datos recibidos:', data);
            const adminCreds = data.admin;
            if (!adminCreds) {
                console.error('Credenciales de admin no encontradas');
                return;
            }

            // Configura el fondo
            document.body.style.backgroundImage = "url('FOTO.jpg')";
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundPosition = 'center';

            if (username === adminCreds.username && password === adminCreds.password) {
                document.getElementById('admin-login-container').classList.add('hidden');
                document.getElementById('admin-container').classList.remove('hidden');
            } else {
                document.getElementById('admin-error-message').classList.remove('hidden');
                console.warn('Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error al obtener credenciales:', error);
        }
    });

    // Función para actualizar la lista de usuarios en la interfaz
    function updateUserList(users) {
        const userListDiv = document.getElementById("user-list");
        userListDiv.innerHTML = "";

        const table = document.createElement("table");
        table.classList.add("user-table");

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const headers = ["Usuario", "Correo", "Rol", "Acciones"];
        headers.forEach(text => {
            const th = document.createElement("th");
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        users.forEach((user, index) => {
            const tr = document.createElement("tr");
            ["username", "email", "role"].forEach(prop => {
                const td = document.createElement("td");
                td.textContent = user[prop];
                tr.appendChild(td);
            });
            const tdActions = document.createElement("td");
            const btnEdit = document.createElement("button");
            btnEdit.textContent = "Editar";
            btnEdit.addEventListener("click", () => openEditUserModal(user, index));

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Eliminar";
            btnDelete.addEventListener("click", () => {
                if (confirm("¿Seguro que deseas eliminar este usuario?")) {
                    users.splice(index, 1);
                    updateUserList(users);
                }
            });

            tdActions.appendChild(btnEdit);
            tdActions.appendChild(btnDelete);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        userListDiv.appendChild(table);
    }

    // Evento del formulario para agregar un nuevo usuario (sin duplicidad)
    addUserForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const newUser = {
            username: document.getElementById("new-username").value.trim(),
            email: document.getElementById("new-email").value.trim(),
            password: document.getElementById("new-password").value.trim(),
            role: document.getElementById("new-role").value
        };
        users.push(newUser);
        updateUserList(users);
        addUserForm.reset();
    });

    // Función para cargar los cargadores desde el servidor
    async function loadChargers() {
        try {
            const response = await fetch('/api/chargers');
            const chargers = await response.json();
            displayChargers(chargers);
        } catch (error) {
            console.error('Error al cargar cargadores:', error);
        }
    }

    // Función para mostrar los cargadores en la interfaz
    function displayChargers(chargers) {
        chargerListDiv.innerHTML = '';
        chargers.forEach(charger => {
            const chargerItem = document.createElement('div');
            chargerItem.innerHTML = `
                <p>ID: ${charger.id}</p>
                <p>Tipo: ${charger.type}</p>
                <p>Estado: ${charger.status}</p>
                <button data-id="${charger.id}" class="edit-charger-btn">Editar</button>
                <button data-id="${charger.id}" class="delete-charger-btn">Eliminar</button>
            `;
            chargerListDiv.appendChild(chargerItem);
        });
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
                document.getElementById('edit-charger-modal').classList.remove('hidden');
            });
        });
    }

    document.getElementById('add-charger-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('charger-id').value.trim();
        const type = document.getElementById('charger-type').value.trim();
        const status = document.getElementById('charger-status').value;
        const lat = document.getElementById('charger-lat').value.trim();
        const lon = document.getElementById('charger-lon').value.trim();

        const newCharger = { id, type, status, lat, lon };

        try {
            const response = await fetch('/api/chargers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCharger)
            });
            if (!response.ok) {
                console.error('Error al agregar cargador:', response.status);
                return;
            }
            const result = await response.json();
            console.log('Cargador agregado correctamente:', result);
            // Actualiza la interfaz o realiza alguna acción luego de agregar el cargador.
        } catch (error) {
            console.error('Error en la petición:', error);
        }
    });

// Listener para el botón de editar cargadores para actualizar solo el type y status
    document.getElementById('edit-charger-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('edit-charger-id').textContent;
        const type = document.getElementById('edit-charger-type').value.trim();
        const status = document.getElementById('edit-charger-status').value;
        const lat = document.getElementById('edit-charger-lat').value.trim();
        const lon = document.getElementById('edit-charger-lon').value.trim();

        try {
            const response = await fetch(`/api/chargers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, status })
            });
            if (response.ok) {
                alert('Cargador actualizado correctamente.');
                loadChargers();
            } else {
                alert('Error al actualizar cargador.');
            }
        } catch (error) {
            console.error('Error al actualizar cargador:', error);
        }
        document.getElementById('edit-charger-modal').classList.add('hidden');
    });

    // Función para actualizar un cargador
    async function updateCharger(id, updatedData) {
        try {
            const response = await fetch(`/api/chargers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (response.ok) {
                alert('Cargador actualizado correctamente.');
                loadChargers();
            } else {
                alert('Error al actualizar cargador.');
            }
        } catch (error) {
            console.error('Error al actualizar cargador:', error);
        }
    }

    // Función para eliminar un cargador
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

    // Manejador para el formulario de edición de cargador
    document.getElementById('edit-charger-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('edit-charger-id').textContent;
        const type = document.getElementById('edit-charger-type').value.trim();
        const status = document.getElementById('edit-charger-status').value;
        try {
            const response = await fetch(`/api/chargers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, status })
            });
            if (response.ok) {
                alert('Cargador actualizado correctamente.');
                loadChargers();
            } else {
                alert('Error al actualizar el cargador.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        document.getElementById('edit-charger-modal').classList.add('hidden');
    });

    // Función para abrir el modal de edición de usuario y cargar datos actuales
    function openEditUserModal(user, index) {
        const modal = document.getElementById('edit-user-modal');
        modal.querySelector('#edit-user-index').value = index;
        modal.querySelector('#edit-username').value = user.username;
        modal.querySelector('#edit-email').value = user.email;
        modal.querySelector('#edit-role').value = user.role;
        modal.classList.remove('hidden');
    }

    // Función para cerrar el modal de edición de usuario
    function closeEditUserModal() {
        document.getElementById('edit-user-modal').classList.add('hidden');
    }

    // Manejador para el formulario de edición de usuario
    document.getElementById('edit-user-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const index = parseInt(document.getElementById('edit-user-index').value, 10);
        const newUsername = document.getElementById('edit-username').value.trim();
        const newEmail = document.getElementById('edit-email').value.trim();
        const newRole = document.getElementById('edit-role').value;
        users[index] = { ...users[index], username: newUsername, email: newEmail, role: newRole };
        updateUserList(users);
        closeEditUserModal();
    });

    // Manejador para el botón "Cancelar" del modal de usuario
    const cancelEditUserBtn = document.getElementById("cancel-edit-user");
    if (cancelEditUserBtn) {
        cancelEditUserBtn.addEventListener("click", closeEditUserModal);
    }

    // Cargar estadísticas de uso
    async function loadStats() {
        const statsContainer = document.getElementById('stats-container');
        statsContainer.innerHTML = '<canvas id="statsChart"></canvas>';
        const ctx = document.getElementById('statsChart').getContext('2d');

        try {
            const response = await fetch('/api/stats');
            if (!response.ok) {
                console.error('Error al obtener estadísticas:', response.status);
                return;
            }
            const stats = await response.json();
            const labels = Object.keys(stats.chargersByType);
            const dataValues = Object.values(stats.chargersByType);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Cantidad de Cargadores',
                        data: dataValues,
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
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    // Función para cargar y desplegar los logs de auditoría
    async function loadLogs() {
        try {
            const response = await fetch('/api/logs');
            if (!response.ok) {
                console.error('Error al obtener los logs de auditoría');
                return;
            }
            const data = await response.json();
            const logsContainer = document.getElementById('logs-container');
            logsContainer.innerHTML = '';
            if (data.logs && data.logs.length > 0) {
                const ul = document.createElement('ul');
                data.logs.forEach(log => {
                    const li = document.createElement('li');
                    li.textContent = log;
                    ul.appendChild(li);
                });
                logsContainer.appendChild(ul);
            } else {
                logsContainer.innerHTML = '<p>No hay logs de auditoría.</p>';
            }
        } catch (error) {
            console.error('Error al cargar logs de auditoría:', error);
        }
    }

    // Inicializa partículas y carga los cargadores
    particlesJS("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: 3 },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 3 }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
            modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
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
        const socket = new WebSocket('ws://localhost:8080');
        const addChargerForm = document.getElementById('add-charger-form');
        const addChargerBtn = document.getElementById('add-charger-btn');
        const chargerListContainer = document.getElementById('charger-list'); // contenedor para actualizar la lista
        let users = [];

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
                console.log('Click en Gestión de Usuarios');
                togglePanel('manage-users');
            });
        }

        if (btnViewStats) {
            btnViewStats.addEventListener('click', () => {
                console.log('Click en Ver Estadísticas');
                togglePanel('view-stats');
                loadStats();
            });
        }

        if (btnViewLogs) {
            btnViewLogs.addEventListener('click', () => {
                console.log('Click en Ver Logs de Auditoría');
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
            console.log('Intento de login:', username, password);

            try {
                const response = await fetch('/config');
                if (!response.ok) {
                    console.error('Error en el servidor:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('Datos recibidos:', data);
                const adminCreds = data.admin;
                if (!adminCreds) {
                    console.error('Credenciales de admin no encontradas');
                    return;
                }

                // Configura el fondo
                document.body.style.backgroundImage = "url('FOTO.jpg')";
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundRepeat = 'no-repeat';
                document.body.style.backgroundPosition = 'center';

                if (username === adminCreds.username && password === adminCreds.password) {
                    document.getElementById('admin-login-container').classList.add('hidden');
                    document.getElementById('admin-container').classList.remove('hidden');
                } else {
                    document.getElementById('admin-error-message').classList.remove('hidden');
                    console.warn('Credenciales incorrectas');
                }
            } catch (error) {
                console.error('Error al obtener credenciales:', error);
            }
        });

        // Función para actualizar la lista de usuarios en la interfaz
        function updateUserList(users) {
            const userListDiv = document.getElementById("user-list");
            userListDiv.innerHTML = "";

            const table = document.createElement("table");
            table.classList.add("user-table");

            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headers = ["Usuario", "Correo", "Rol", "Acciones"];
            headers.forEach(text => {
                const th = document.createElement("th");
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            users.forEach((user, index) => {
                const tr = document.createElement("tr");
                ["username", "email", "role"].forEach(prop => {
                    const td = document.createElement("td");
                    td.textContent = user[prop];
                    tr.appendChild(td);
                });
                const tdActions = document.createElement("td");
                const btnEdit = document.createElement("button");
                btnEdit.textContent = "Editar";
                btnEdit.addEventListener("click", () => openEditUserModal(user, index));

                const btnDelete = document.createElement("button");
                btnDelete.textContent = "Eliminar";
                btnDelete.addEventListener("click", () => {
                    if (confirm("¿Seguro que deseas eliminar este usuario?")) {
                        users.splice(index, 1);
                        updateUserList(users);
                    }
                });

                tdActions.appendChild(btnEdit);
                tdActions.appendChild(btnDelete);
                tr.appendChild(tdActions);
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            userListDiv.appendChild(table);
        }

        // Evento del formulario para agregar un nuevo usuario (sin duplicidad)
        addUserForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const newUser = {
                username: document.getElementById("new-username").value.trim(),
                email: document.getElementById("new-email").value.trim(),
                password: document.getElementById("new-password").value.trim(),
                role: document.getElementById("new-role").value
            };
            users.push(newUser);
            updateUserList(users);
            addUserForm.reset();
        });

        // Listener para agregar cargador utilizando el nuevo código
        if (addChargerForm && addChargerBtn) {
            addChargerForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const id = document.getElementById('charger-id').value.trim();
                const type = document.getElementById('edit-charger-type').value;
                const status = document.getElementById('edit-charger-status').value;
                const lat = parseFloat(document.getElementById('charger-lat').value);
                const lon = parseFloat(document.getElementById('charger-lon').value);

                if (!id || isNaN(lat) || isNaN(lon)) {
                    alert('Completa todos los campos correctamente.');
                    return;
                }

                const newCharger = { id, type, status, lat, lon };

                try {
                    const response = await fetch('/api/chargers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newCharger)
                    });
                    if (response.ok) {
                        const chargerAdded = await response.json();
                        alert('Cargador agregado correctamente.');

                        if (chargerListContainer) {
                            const chargerItem = document.createElement('div');
                            chargerItem.innerHTML = `
                            <p>ID: ${chargerAdded.id}</p>
                            <p>Tipo: ${chargerAdded.type}</p>
                            <p>Estado: ${chargerAdded.status}</p>
                            <p>Latitud: ${chargerAdded.lat}</p>
                            <p>Longitud: ${chargerAdded.lon}</p>
                        `;
                            chargerListContainer.appendChild(chargerItem);
                        }
                        addChargerForm.reset();
                    } else {
                        alert('Error al agregar el cargador.');
                    }
                } catch (error) {
                    console.error('Error en la petición:', error);
                    alert('Hubo un error en el servidor.');
                }
            });
        }

        // Función para cargar los cargadores desde el servidor
        async function loadChargers() {
            try {
                const response = await fetch('/api/chargers');
                const chargers = await response.json();
                displayChargers(chargers);
            } catch (error) {
                console.error('Error al cargar cargadores:', error);
            }
        }

        // Función para mostrar los cargadores en la interfaz
        function displayChargers(chargers) {
            chargerListDiv.innerHTML = '';
            chargers.forEach(charger => {
                const chargerItem = document.createElement('div');
                chargerItem.innerHTML = `
                <p>ID: ${charger.id}</p>
                <p>Tipo: ${charger.type}</p>
                <p>Estado: ${charger.status}</p>
                <button data-id="${charger.id}" class="edit-charger-btn">Editar</button>
                <button data-id="${charger.id}" class="delete-charger-btn">Eliminar</button>
            `;
                chargerListDiv.appendChild(chargerItem);
            });
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
                    document.getElementById('edit-charger-modal').classList.remove('hidden');
                });
            });
        }

        // Listener para el formulario de edición de cargador (actualizar type y status)
        document.getElementById('edit-charger-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const id = document.getElementById('edit-charger-id').textContent;
            const type = document.getElementById('edit-charger-type').value.trim();
            const status = document.getElementById('edit-charger-status').value;
            try {
                const response = await fetch(`/api/chargers/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, status })
                });
                if (response.ok) {
                    alert('Cargador actualizado correctamente.');
                    loadChargers();
                } else {
                    alert('Error al actualizar el cargador.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
            document.getElementById('edit-charger-modal').classList.add('hidden');
        });

        // Función para actualizar un cargador
        async function updateCharger(id, updatedData) {
            try {
                const response = await fetch(`/api/chargers/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                if (response.ok) {
                    alert('Cargador actualizado correctamente.');
                    loadChargers();
                } else {
                    alert('Error al actualizar cargador.');
                }
            } catch (error) {
                console.error('Error al actualizar cargador:', error);
            }
        }

        // Función para eliminar un cargador
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

        // Función para abrir el modal de edición de usuario y cargar datos actuales
        function openEditUserModal(user, index) {
            const modal = document.getElementById('edit-user-modal');
            modal.querySelector('#edit-user-index').value = index;
            modal.querySelector('#edit-username').value = user.username;
            modal.querySelector('#edit-email').value = user.email;
            modal.querySelector('#edit-role').value = user.role;
            modal.classList.remove('hidden');
        }

        // Función para cerrar el modal de edición de usuario
        function closeEditUserModal() {
            document.getElementById('edit-user-modal').classList.add('hidden');
        }

        // Manejador para el formulario de edición de usuario
        document.getElementById('edit-user-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const index = parseInt(document.getElementById('edit-user-index').value, 10);
            const newUsername = document.getElementById('edit-username').value.trim();
            const newEmail = document.getElementById('edit-email').value.trim();
            const newRole = document.getElementById('edit-role').value;
            users[index] = { ...users[index], username: newUsername, email: newEmail, role: newRole };
            updateUserList(users);
            closeEditUserModal();
        });

        // Manejador para el botón "Cancelar" del modal de usuario
        const cancelEditUserBtn = document.getElementById("cancel-edit-user");
        if (cancelEditUserBtn) {
            cancelEditUserBtn.addEventListener("click", closeEditUserModal);
        }

        // Cargar estadísticas de uso
        async function loadStats() {
            const statsContainer = document.getElementById('stats-container');
            statsContainer.innerHTML = '<canvas id="statsChart"></canvas>';
            const ctx = document.getElementById('statsChart').getContext('2d');

            try {
                const response = await fetch('/api/stats');
                if (!response.ok) {
                    console.error('Error al obtener estadísticas:', response.status);
                    return;
                }
                const stats = await response.json();
                const labels = Object.keys(stats.chargersByType);
                const dataValues = Object.values(stats.chargersByType);

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Cantidad de Cargadores',
                            data: dataValues,
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
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
            }
        }

        // Función para cargar y desplegar los logs de auditoría
        async function loadLogs() {
            try {
                const response = await fetch('/api/logs');
                if (!response.ok) {
                    console.error('Error al obtener los logs de auditoría');
                    return;
                }
                const data = await response.json();
                const logsContainer = document.getElementById('logs-container');
                logsContainer.innerHTML = '';
                if (data.logs && data.logs.length > 0) {
                    const ul = document.createElement('ul');
                    data.logs.forEach(log => {
                        const li = document.createElement('li');
                        li.textContent = log;
                        ul.appendChild(li);
                    });
                    logsContainer.appendChild(ul);
                } else {
                    logsContainer.innerHTML = '<p>No hay logs de auditoría.</p>';
                }
            } catch (error) {
                console.error('Error al cargar logs de auditoría:', error);
            }
        }

        // Inicializa partículas y carga los cargadores
        particlesJS("particles-js", {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5 },
                size: { value: 3 },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 3 }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
                modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
            },
            retina_detect: true
        });

        // Carga inicial de cargadores
        loadChargers();
    });
    // Carga inicial de cargadores
    loadChargers();
});