document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const showRegisterLink = document.getElementById('show-register');
    const backToLoginButton = document.getElementById('back-to-login');
    const mapContainer = document.getElementById('map-container');
    const errorMessage = document.getElementById('error-message');
    const chargerDetails = document.getElementById('charger-details');
    const reservationForm = document.getElementById('reservation-form');
    const reserveForm = document.getElementById('reserve-form');
    const cancelReservationButton = document.getElementById('cancel-reservation');
    const modal = document.getElementById('modal');
    const closeModalButton = document.getElementById('close-modal');
    let selectedCharger = null;

    showRegisterLink.addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });

    backToLoginButton.addEventListener('click', () => {
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        const storedPassword = localStorage.getItem(email);

        if (storedPassword === password) {
            loginContainer.classList.add('hidden');
            mapContainer.classList.remove('hidden');
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation not supported.");
            }
        } else {
            errorMessage.classList.remove('hidden');
        }
    });

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        initMap(lat, lon);
    }

    function showError(error) {
        alert("Unable to retrieve location: " + error.message);
    }

    function initMap(lat, lon) {
        const map = L.map('map').setView([lat, lon], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const chargers = [
            // Madrid
            { id: 1, lat: 40.416775, lon: -3.703790, type: 'TYPE 2 / 22kW', status: 'Available', batteryLevel: '90%', estimatedTime: '20 mins', cost: '7€' },
            { id: 2, lat: 40.416775, lon: -3.703790, type: 'CHAdeMO / 50kW', status: 'Available', batteryLevel: '60%', estimatedTime: '15 mins', cost: '10€' },
            // Barcelona
            { id: 3, lat: 41.385064, lon: 2.173404, type: 'CCS / 150kW', status: 'Available', batteryLevel: '50%', estimatedTime: '10 mins', cost: '15€' },
            { id: 4, lat: 41.385064, lon: 2.173404, type: 'TYPE 2 / 11kW', status: 'Not reservable', batteryLevel: '70%', estimatedTime: '25 mins', cost: '6€' },
            // Valencia
            { id: 5, lat: 39.469907, lon: -0.376288, type: 'TYPE 2 / 7.40kW', status: 'Available', batteryLevel: '85%', estimatedTime: '30 mins', cost: '5€' },
            { id: 6, lat: 39.469907, lon: -0.376288, type: 'CHAdeMO / 50kW', status: 'Available', batteryLevel: '75%', estimatedTime: '20 mins', cost: '10€' },
            // Sevilla
            { id: 7, lat: 37.389092, lon: -5.984459, type: 'CCS / 150kW', status: 'Available', batteryLevel: '65%', estimatedTime: '15 mins', cost: '15€' },
            { id: 8, lat: 37.389092, lon: -5.984459, type: 'TYPE 2 / 22kW', status: 'Available', batteryLevel: '90%', estimatedTime: '20 mins', cost: '7€' },
            // Zaragoza
            { id: 9, lat: 41.648823, lon: -0.889085, type: 'TYPE 2 / 7.40kW', status: 'Available', batteryLevel: '85%', estimatedTime: '30 mins', cost: '5€' },
            { id: 10, lat: 41.648823, lon: -0.889085, type: 'CHAdeMO / 50kW', status: 'Available', batteryLevel: '75%', estimatedTime: '20 mins', cost: '10€' },
            // Málaga
            { id: 11, lat: 36.721274, lon: -4.421399, type: 'CCS / 150kW', status: 'Available', batteryLevel: '65%', estimatedTime: '15 mins', cost: '15€' },
            { id: 12, lat: 36.721274, lon: -4.421399, type: 'TYPE 2 / 22kW', status: 'Available', batteryLevel: '90%', estimatedTime: '20 mins', cost: '7€' }
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

        if (selectedCharger) {
            alert(`Tu cargador ha sido reservado correctamente por ${reservationTime} minutos.`);
            reservationForm.classList.add('hidden');
            modal.classList.add('hidden');
            scheduleReminder(selectedCharger.type, reservationTime);
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
});