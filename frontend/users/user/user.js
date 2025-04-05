document.addEventListener('DOMContentLoaded', async () => {
    // Variables de referencia a elementos del DOM
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
    const openNavigationButton = document.getElementById('open-navigation');
    const buttonContainer = document.querySelector('.button-container');
    const currentUser = localStorage.getItem('currentUser');
    const reservationHistoryContainer = document.getElementById('reservation-history-container');
    const reservationHistoryBtn = document.getElementById('reservation-history-btn');
    const reservationMessage = document.createElement('p');
    const socket = new WebSocket('ws://localhost:8080');

    reservationMessage.id = 'reservation-message';
    reserveForm.appendChild(reservationMessage);

    socket.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
            alert(data.message);
        }
    });

    let selectedCharger = null;

    if (!currentUser) {
        window.location.href = '/login.html';
    }

    let chargers = [
        { id: 1, lat: 40.416775, lon: -3.703790, type: 'fast', status: 'Available' },
        { id: 2, lat: 41.385064, lon: 2.173404, type: 'standard', status: 'Available' },
        { id: 3, lat: 39.469907, lon: -0.376288, type: 'compatible', status: 'Available' }
    ];

    if (currentUser) {
        fetch(`/user-reservations?email=${currentUser}`)
            .then(response => response.json())
            .then(reservations => {
                if (reservations.length > 0) {
                    reservationHistoryContainer.innerHTML = reservations.map(reservation =>
                        `<div class="reservation">
                            <p>Charger: ${reservation.charger}</p>
                            <p>Time: ${reservation.time}</p>
                        </div>`
                    ).join('');
                } else {
                    reservationHistoryContainer.innerHTML = '<p>No reservations found.</p>';
                }
            });
    }

    function isLoggedIn() {
        console.log("Usuario autenticado:", localStorage.getItem('currentUser'));
        return localStorage.getItem('currentUser') !== null;
    }

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

    updateFilterVisibility();

    document.getElementById('admin-btn').addEventListener('click', () => {
        window.location.href = '/users/Admin/admin.html';
    });

    document.getElementById('tecnico-btn').addEventListener('click', () => {
        window.location.href = '/users/Tecnico/tecnico.html';
    });

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

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        initMap(lat, lon);
    }

    function showError(error) {
        alert("Unable to retrieve location: " + error.message);
    }

    let map;
    let markers = [];

    function initMap(lat, lon) {
        map = L.map('map').setView([lat, lon], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        chargers.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(`
                    <b>Charger ${charger.type}</b><br>Status: ${charger.status}<br>
                    <button id="reserve-btn-${charger.id}" class="reserve-btn">Reserve Now</button>
                `);

            marker.on('popupopen', () => {
                const reserveButton = document.getElementById(`reserve-btn-${charger.id}`);
                if (reserveButton) {
                    reserveButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        selectedCharger = charger;
                        showReservationForm(charger);
                    });
                }
            });

            markers.push(marker);
        });
    }

    function showReservationForm(charger) {
        chargerDetails.innerHTML = `
            <h3>Charger Details</h3>
            <p>Type: ${charger.type}</p>
            <p>Status: ${charger.status}</p>
            <p>Battery Level: ${charger.batteryLevel || 'N/A'}</p>
            <p>Estimated Time: ${charger.estimatedTime || 'N/A'}</p>
            <p>Cost: ${charger.cost || 'N/A'}</p>
        `;
        reservationForm.classList.remove('hidden');
        modal.classList.remove('hidden');
    }

    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });

    reserveForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const reservationTime = document.getElementById('reservation-time').value;
        const currentUser = localStorage.getItem('currentUser');
        console.log("Reservando para usuario:", currentUser);

        if (!currentUser) {
            alert("Tu sesión ha expirado. Por favor vuelve a iniciar sesión.");
            window.location.href = '/login.html';
            return;
        }

        if (selectedCharger) {
            alert(`Tu cargador ha sido reservado correctamente por ${reservationTime} minutos.`);
            reservationForm.classList.add('hidden');
            modal.classList.add('hidden');

            // Enviar mensaje al servidor para iniciar la reserva
            socket.send(JSON.stringify({
                type: 'reserve',
                chargerId: selectedCharger.id,
                duration: reservationTime
            }));
        }
    });

    cancelReservationButton.addEventListener('click', () => {
        alert('Tu reserva ha sido cancelada.');
        reservationForm.classList.add('hidden');
        modal.classList.add('hidden');
    });

    function scheduleReminder(chargerType, time) {
        setTimeout(() => {
            alert(`Recordatorio: Tu reserva de ${chargerType} expira en 10 minutos.`);
        }, (time - 10) * 60000);
    }

    function updateMap(chargerList) {
        markers.forEach(marker => {
            map.removeLayer(marker);
        });
        markers.length = 0;

        chargerList.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(
                    `<b>Cargador ${charger.type}</b><br>Status: ${charger.status}`
                );
            markers.push(marker);
        });
    }

    const chargerTypeSelect = document.getElementById('charger-type');
    chargerTypeSelect.addEventListener('change', () => {
        const selectedType = chargerTypeSelect.value;
        let filteredChargers;

        if (selectedType === 'all') {
            filteredChargers = chargers;
        } else {
            filteredChargers = chargers.filter(charger =>
                charger.type.toLowerCase() === selectedType.toLowerCase()
            );
        }

        updateMap(filteredChargers);
    });

    // Evento de clic para el botón de historial de reservas
    reservationHistoryBtn.addEventListener('click', () => {
        reservationHistoryContainer.classList.toggle('hidden');
    });
});