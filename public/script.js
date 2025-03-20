document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const mapContainer = document.getElementById('map-container');
    const errorMessage = document.getElementById('error-message');
    const chargerDetails = document.getElementById('charger-details');
    const reservationForm = document.getElementById('reservation-form');
    const reserveForm = document.getElementById('reserve-form');
    const cancelReservationButton = document.getElementById('cancel-reservation');
    const modal = document.getElementById('modal');
    const closeModalButton = document.getElementById('close-modal');
    let selectedCharger = null;

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
        const map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const chargers = [
            { id: 1, lat: 40.5467295, lon: -3.6434806, type: 'TYPE 2 / 7.40kW', status: 'Not reservable', batteryLevel: '80%', estimatedTime: '30 mins', cost: '5€' }
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
        document.getElementById('pay-now').addEventListener('click', processPayment);
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
            alert(`Charger ${selectedCharger.type} reserved for ${reservationTime} minutes.`);
            reservationForm.classList.add('hidden');
            scheduleReminder(selectedCharger.type, reservationTime);
        }
    });

    cancelReservationButton.addEventListener('click', () => {
        alert('Your reservation has been canceled.');
        reservationForm.classList.add('hidden');
    });

    function scheduleReminder(chargerType, time) {
        setTimeout(() => {
            alert(`Reminder: Your reservation for ${chargerType} expires in 10 minutes.`);
        }, (time - 10) * 60000);
    }

    function processPayment() {
        alert('Payment processed successfully! Your charger is reserved.');
    }
});
