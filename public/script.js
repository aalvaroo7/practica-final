document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const mapContainer = document.getElementById('map-container');
    const errorMessage = document.getElementById('error-message');
    const chargerDetails = document.getElementById('charger-details');

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

        const userCircle = L.circle([lat, lon], {
            color: 'red',
            fillColor: '#30f',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(map).bindPopup('<b>Your current location</b>').openPopup();

        const chargers = [
            { id: 1, lat: 40.5467295, lon: -3.6434806, type: 'TYPE 2 / 7.40kW', status: 'Not reservable' },
            { id: 2, lat: 40.51991, lon: -3.66149, type: 'TYPE 2 22.00kW / Schuko 3.70kW', status: 'Reservation required' },
            { id: 3, lat: 40.519326, lon: -3.657155, type: 'TYPE 2 22.00kW', status: 'Not reservable' },
            { id: 4, lat: 40.519896, lon: -3.65764, type: 'TYPE 2 / 7.40kW', status: 'Not reservable' },
            { id: 5, lat: 40.519345, lon: -3.656415, type: 'TYPE 2 7.40kW', status: 'Reservable' },
            { id: 6, lat: 40.5186645, lon: -3.6575428, type: 'Tesla Destination Charger 11.00kW', status: 'Not reservable' },
            { id: 7, lat: 40.516553, lon: -3.656073, type: 'TYPE 2 22.00kW', status: '24h' },
            { id: 8, lat: 40.51569, lon: -3.65682, type: 'TYPE 2 22.00kW', status: 'Weekdays' },
            { id: 9, lat: 40.534582, lon: -3.618301, type: 'TYPE 2 / 7.40kW', status: 'Not reservable' },
            { id: 10, lat: 40.53507, lon: -3.62144, type: 'Tesla Destination Charger 11.00kW', status: '24h' },
            { id: 11, lat: 40.546684, lon: -3.65477, type: 'TYPE 2 / 11.00kW', status: 'Not reservable' },
            { id: 12, lat: 40.547812, lon: -3.656808, type: 'TYPE 2 / 43KW, CHAdeMO 50KW', status: 'Not reservable' },
            { id: 13, lat: 40.5150227, lon: -3.6661338, type: 'Schuko (EU Plug) 2.30kW, TYPE 2 7.40kW', status: 'Not reservable' },
            { id: 14, lat: 40.5226938, lon: -3.6608542, type: 'TYPE 2 3.70kW / TYPE 2 4.2KW', status: 'Not reservable' },
            { id: 15, lat: 40.5236888, lon: -3.6587782, type: 'TYPE 2 / 3.70kW', status: 'Not reservable' },
            { id: 16, lat: 40.5268882, lon: -3.6541821, type: 'TYPE 2 7.40kW', status: 'Not reservable' },
            { id: 17, lat: 40.5175784637797, lon: -3.61716063080805, type: 'TYPE 2 / 7.4KW', status: 'Not reservable' },
            { id: 18, lat: 40.5514555513121, lon: -3.65681299256908, type: '22 kW Tipo 2', status: 'With mobile app' },
            { id: 19, lat: 40.540929491723, lon: -3.63403863678837, type: '22 kW Tipo 2', status: 'Not reservable' },
            { id: 20, lat: 40.5312292871596, lon: -3.63649780420733, type: '22 kW Tipo 2', status: 'With mobile app' }
        ];

        chargers.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(`<b>Charger ${charger.type}</b><br>Status: ${charger.status}`);

            marker.on('click', () => {
                chargerDetails.innerHTML = `
                    <h3>Charger Details</h3>
                    <p>Type: ${charger.type}</p>
                    <p>Status: ${charger.status}</p>
                    <p>Battery Level: ${charger.batteryLevel}</p>
                    <p>Estimated Time: ${charger.estimatedTime}</p>
                    <p>Cost: ${charger.cost}</p>
                `;
            });
        });
    }
});