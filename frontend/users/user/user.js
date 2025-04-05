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
    const modal = document.getElementById('modal');
    const closeModalButton = document.getElementById('close-modal');
    const openNavigationButton = document.getElementById('open-navigation');
    const buttonContainer = document.querySelector('.button-container');
    const currentUser = localStorage.getItem('currentUser');

    let selectedCharger = null;
    let map;
    const markers = [];

    // Mostrar u ocultar el contenedor de filtro
    function isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    function updateFilterVisibility() {
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
            buttonContainer.classList.add('hidden');
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

    // Registro
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        localStorage.setItem(email, password);

        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    showRegisterLink.addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });

    backToLoginButton.addEventListener('click', () => {
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    // Inicializa mapa
    function showPosition(position) {
        initMap(position.coords.latitude, position.coords.longitude);
    }

    function showError(error) {
        alert("No se pudo obtener la ubicación: " + error.message);
    }

    const chargers = [
        { id: 1, lat: 40.416775, lon: -3.703790, type: 'rápido', status: 'Disponible', batteryLevel: '80%', estimatedTime: '30min', cost: '5€' },
        { id: 2, lat: 41.385064, lon: 2.173404, type: 'estándar', status: 'Disponible', batteryLevel: '60%', estimatedTime: '45min', cost: '3€' },
        { id: 3, lat: 39.469907, lon: -0.376288, type: 'compatible', status: 'Disponible', batteryLevel: '70%', estimatedTime: '35min', cost: '4€' }
    ];

    function initMap(lat = 40.416775, lon = -3.703790) {
        map = L.map('map').setView([lat, lon], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        chargers.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(`
                    <b>Cargador ${charger.type}</b><br>
                    Estado: ${charger.status}<br>
                    <button class="reserve-btn" data-id="${charger.id}">Reservar</button>
                `);

            marker.on('popupopen', () => {
                setTimeout(() => {
                    const btn = document.querySelector(`.reserve-btn[data-id="${charger.id}"]`);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            if (!isLoggedIn()) {
                                alert("Debes iniciar sesión para reservar.");
                                return;
                            }
                            selectedCharger = charger;
                            showReservationForm(charger);
                        });
                    }
                }, 100); // espera a que el DOM renderice
            });
        });
    }

    function showReservationForm(charger) {
        chargerDetails.innerHTML = `
            <h3>Detalles del Cargador</h3>
            <p>Tipo: ${charger.type}</p>
            <p>Estado: ${charger.status}</p>
            <p>Nivel batería: ${charger.batteryLevel}</p>
            <p>Tiempo estimado: ${charger.estimatedTime}</p>
            <p>Costo: ${charger.cost}</p>
        `;
        reservationForm.classList.remove('hidden');
    }

    reserveForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const time = document.getElementById('reservation-time').value;
        if (selectedCharger) {
            alert(`Tu cargador ha sido reservado por ${time} minutos.`);
            reservationForm.classList.add('hidden');
            scheduleReminder(selectedCharger.type, time);
        }
    });

    function scheduleReminder(type, time) {
        const timeMs = (time - 10) * 60000;
        if (timeMs > 0) {
            setTimeout(() => {
                alert(`Recordatorio: tu reserva de ${type} expira en 10 minutos.`);
            }, timeMs);
        }
    }

    const chargerTypeSelect = document.getElementById('charger-type');
    chargerTypeSelect.addEventListener('change', () => {
        const selectedType = chargerTypeSelect.value;
        const filtered = selectedType === 'all' ? chargers : chargers.filter(c => c.type.toLowerCase() === selectedType.toLowerCase());
        updateMap(filtered);
    });

    function updateMap(chargerList) {
        markers.forEach(marker => map.removeLayer(marker));
        chargerList.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(`<b>Cargador ${charger.type}</b><br>Estado: ${charger.status}`);
            markers.push(marker);
        });
    }

    if (currentUser) {
        loginContainer.classList.add('hidden');
        mapContainer.classList.remove('hidden');
        updateFilterVisibility();
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }

    updateFilterVisibility();
});
