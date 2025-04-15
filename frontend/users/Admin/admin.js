document.addEventListener('DOMContentLoaded', async () => {
    const loginBtn = document.getElementById('login-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const volverBtn = document.querySelector('#Volver-btn button');
    const addChargerForm = document.getElementById('add-charger-form');
    const chargerListDiv = document.getElementById('charger-list');
    const addUserForm = document.getElementById('add-user-form');
    const btnRegresar = document.getElementById('btn-regresar');
    const btnManageChargers = document.getElementById('btn-manage-chargers');
    const editModal = document.getElementById('edit-charger-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    const adminContainer = document.getElementById('admin-container');
    let users = [];

    // Función para ocultar todos los paneles
    function hideAllPanels() {
        const panels = document.querySelectorAll('main > section');
        panels.forEach(panel => {
            panel.classList.remove('visible');
            panel.style.display = 'none';
            panel.classList.add('hidden');
            editModal.classList.add('hidden');
        });
    }

    // Función que muestra el panel deseado
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

    // Eventos para navegación
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

    const btnManageUsers = document.getElementById('btn-manage-users');
    const btnViewStats = document.getElementById('btn-view-stats');
    const btnViewLogs = document.getElementById('btn-view-logs');

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
        });
    }

    if (btnViewLogs) {
        btnViewLogs.addEventListener('click', () => {
            console.log('Click en Ver Logs de Auditoría');
            togglePanel('view-logs');
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

    // Autenticación del admin
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

    // Resto de funciones para Gestión de Usuarios y Cargadores
    function updateUserList(users) {
        const userListDiv = document.getElementById("user-list");
        userListDiv.innerHTML = "";

        // Crear tabla y encabezado
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

        // Crear cuerpo de la tabla con filas para cada usuario
        const tbody = document.createElement("tbody");
        users.forEach((user, index) => {
            const tr = document.createElement("tr");

            // Crear celdas de usuario, correo y rol
            ["username", "email", "role"].forEach(prop => {
                const td = document.createElement("td");
                td.textContent = user[prop];
                tr.appendChild(td);
            });

            // Celda de acciones
            const tdActions = document.createElement("td");

            // Botón para editar
            const btnEdit = document.createElement("button");
            btnEdit.textContent = "Editar";
            btnEdit.addEventListener("click", () => {
                const newUsername = prompt("Ingresa el nuevo nombre de usuario:", user.username);
                const newEmail = prompt("Ingresa el nuevo correo electrónico:", user.email);
                const newRole = prompt("Ingresa el nuevo rol:", user.role);
                if (newUsername && newEmail && newRole) {
                    users[index] = { ...user, username: newUsername, email: newEmail, role: newRole };
                    updateUserList(users);
                }
            });

            // Botón para eliminar
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

// Evento del formulario de agregar usuario existente
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

    addUserForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newUser = {
            username: document.getElementById('new-username').value.trim(),
            email: document.getElementById('new-email').value.trim(),
            password: document.getElementById('new-password').value.trim(),
            role: document.getElementById('new-role').value
        };
        users.push(newUser);
        updateUserList(users);
        addUserForm.reset();
    });

    async function loadChargers() {
        try {
            const response = await fetch('/api/chargers');
            const chargers = await response.json();
            displayChargers(chargers);
        } catch (error) {
            console.error('Error al cargar cargadores:', error);
        }
    }

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

    addChargerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const chargerId = document.getElementById('charger-id').value.trim();
        const chargerType = document.getElementById('charger-type').value.trim();
        const chargerStatus = document.getElementById('charger-status').value.trim();
        const newCharger = { id: chargerId, type: chargerType, status: chargerStatus };
        try {
            const response = await fetch('/api/chargers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCharger)
            });
            if (response.ok) {
                alert('Cargador agregado correctamente.');
                loadChargers();
            } else {
                alert('Error al agregar cargador.');
            }
        } catch (error) {
            console.error('Error al agregar cargador:', error);
        }
    });

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

    document.getElementById('cancel-edit').addEventListener('click', () => {
        document.getElementById('edit-charger-modal').classList.add('hidden');
    });

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

    loadChargers();
});