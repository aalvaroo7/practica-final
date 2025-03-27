document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const showRegisterLink = document.getElementById('show-register');
    const backToLoginButton = document.getElementById('back-to-login');
    const mapContainer = document.getElementById('map-container');
    const filterContainer = document.getElementById('filter-container');
    const errorMessage = document.getElementById('error-message');
    const chargerDetails = document.getElementById('charger-details');
    const reservationForm = document.getElementById('reservation-form');
    const reserveForm = document.getElementById('reserve-form');
    const cancelReservationButton = document.getElementById('cancel-reservation');
    const modal = document.getElementById('modal');
    const closeModalButton = document.getElementById('close-modal');
    const chargerTypeSelect = document.getElementById('charger-type-filter');
    const openNavigationButton = document.getElementById('open-navigation');
    const adminLink = document.getElementById('admin-link');
    const adminContainer = document.getElementById('admin-container');
    const addChargerForm = document.getElementById('add-charger-form');
    const chargerList = document.getElementById('charger-list');
    const statsContainer = document.getElementById('stats-container');
    const logsContainer = document.getElementById('logs-container');
    const adminLoginContainer = document.getElementById('admin-login-container');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminErrorMessage = document.getElementById('admin-error-message');
    let selectedCharger = null;

    adminLink.addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        adminLoginContainer.classList.remove('hidden');
    });

    // Función para verificar si el usuario está logueado
    function isLoggedIn() {
        console.log("Usuario autenticado:", localStorage.getItem('currentUser'));
        return localStorage.getItem('currentUser') !== null;
    }

    // Mostrar u ocultar el contenedor de filtro basado en el estado de inicio de sesión
    function updateFilterVisibility() {
        console.log("Ejecutando updateFilterVisibility, isLoggedIn:", isLoggedIn());
        if (isLoggedIn()) {
            filterContainer.classList.remove('hidden');
        } else {
            filterContainer.classList.add('hidden');
        }
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const storedPassword = localStorage.getItem(email);

        if (storedPassword === password) {
            localStorage.setItem('currentUser', email);
            loginContainer.classList.add('hidden');
            mapContainer.classList.remove('hidden');
            updateFilterVisibility();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation not supported.");
            }
        } else {
            errorMessage.classList.remove('hidden');
        }
    });

    // Llamar a updateFilterVisibility al cargar la página
    updateFilterVisibility();

    // Código de registro
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        // Guardar las credenciales en localStorage
        localStorage.setItem(email, password);

        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    // Mostrar formulario de registro
    showRegisterLink.addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });

    // Volver al formulario de inicio de sesión
    backToLoginButton.addEventListener('click', () => {
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    // Mostrar posición en el mapa
    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        initMap(lat, lon);
    }

    // Mostrar error de geolocalización
    function showError(error) {
        alert("Unable to retrieve location: " + error.message);
    }

    // Inicializar el mapa
    function initMap(lat, lon) {
        const map = L.map('map').setView([lat, lon], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const chargers = [
            { id: 1, lat: 40.416775, lon: -3.703790, type: 'fast', status: 'Available' },
            { id: 2, lat: 41.385064, lon: 2.173404, type: 'standard', status: 'Available' },
            { id: 3, lat: 39.469907, lon: -0.376288, type: 'compatible', status: 'Available' }
        ];

        chargers.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(`
                    <b>Charger ${charger.type}</b><br>Status: ${charger.status}<br>
                    <button id='reserve-btn-${charger.id}' class='reserve-btn'>Reserve Now</button>
                `);

            marker.on('popupopen', () => {
                const reserveButton = document.getElementById(`reserve-btn-${charger.id}`);
                reserveButton.addEventListener('click', () => {
                    selectedCharger = charger;
                    showReservationForm(charger);
                });
            });
        });
    }

    // Mostrar formulario de reserva
    function showReservationForm(charger) {
        chargerDetails.innerHTML = `
            <h3>Charger Details</h3>
            <p>Type: ${charger.type}</p>
            <p>Status: ${charger.status}</p>
            <p>Battery Level: ${charger.batteryLevel}</p>
            <p>Estimated Time: ${charger.estimatedTime}</p>
            <p>Cost: ${charger.cost}</p>
        `;
        reservationForm.classList.remove('hidden');
        modal.classList.remove('hidden');
    }

    // Cerrar modal
    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Manejo del formulario de reserva
    reserveForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const reservationTime = document.getElementById('reservation-time').value;

        if (selectedCharger) {
            alert(`Tu cargador ha sido reservado correctamente por ${reservationTime} minutos.`);
            reservationForm.classList.add('hidden');
            modal.classList.add('hidden');
            scheduleReminder(selectedCharger.type, reservationTime);
        }
    });

    // Cancelar reserva
    cancelReservationButton.addEventListener('click', () => {
        alert('Tu reserva ha sido cancelada.');
        reservationForm.classList.add('hidden');
        modal.classList.add('hidden');
    });

    // Programar recordatorio
    function scheduleReminder(chargerType, time) {
        setTimeout(() => {
            alert(`Recordatorio: Tu reserva de ${chargerType} expira en 10 minutos.`);
        }, (time - 10) * 60000);
    }

    // Manejo del filtro de cargadores
    chargerTypeSelect.addEventListener('change', filterChargers);

    function filterChargers() {
        const selectedType = chargerTypeSelect.value;
        const filteredChargers = chargers.filter(charger => {
            if (selectedType === 'all') return true;
            return charger.type.toLowerCase().includes(selectedType.toLowerCase());
        });
        updateMap(filteredChargers);
    }

    function updateMap(filteredChargers) {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        filteredChargers.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(`
                    <b>Charger ${charger.type}</b><br>Status: ${charger.status}<br>
                    <button id='reserve-btn-${charger.id}' class='reserve-btn'>Reserve Now</button>
                `);

            marker.on('popupopen', () => {
                const reserveButton = document.getElementById(`reserve-btn-${charger.id}`);
                reserveButton.addEventListener('click', () => {
                    selectedCharger = charger;
                    showReservationForm(charger);
                });
            });
        });
    }

    // Abrir en la aplicación de navegación
    openNavigationButton.addEventListener('click', () => {
        if (selectedCharger) {
            const lat = selectedCharger.lat;
            const lon = selectedCharger.lon;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
        } else {
            alert("Please select a charger first.");
        }
    });

    // Inicializar el mapa con todos los cargadores
    initMap();

    // Funcionalidades de administración
    adminLink.addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        adminLoginContainer.classList.remove('hidden');
    });

    adminLoginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('admin-username').value.trim();
        const password = document.getElementById('admin-password').value.trim();

        const adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };

        if (username === adminCredentials.username && password === adminCredentials.password) {
            localStorage.setItem('currentUser', 'admin');
            adminLoginContainer.classList.add('hidden');
            adminContainer.classList.remove('hidden');
            loadUsageStats();
            loadAuditLogs();
        } else {
            adminErrorMessage.classList.remove('hidden');
        }
    });

    // Función para añadir un cargador
    addChargerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const chargerName = document.getElementById('charger-name').value;
        const chargerType = document.getElementById('charger-type').value;
        const li = document.createElement('li');
        li.textContent = `${chargerName} - ${chargerType}`;
        chargerList.appendChild(li);
        addChargerForm.reset();
    });

    // Función para cargar estadísticas de uso y rendimiento
    function loadUsageStats() {
        // Simulación de datos de estadísticas
        const stats = `
            <p>Total de Cargadores: 10</p>
            <p>Sesiones de Carga Completadas: 50</p>
            <p>Tiempo Promedio de Carga: 30 minutos</p>
        `;
        statsContainer.innerHTML = stats;
    }

    // Función para cargar logs de auditoría
    function loadAuditLogs() {
        // Simulación de datos de logs
        const logs = `
            <p>Usuario admin inició sesión a las 10:00 AM</p>
            <p>Usuario t��cnico actualizó el estado del cargador a las 11:00 AM</p>
        `;
        logsContainer.innerHTML = logs;
    }
});