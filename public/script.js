document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const mapContainer = document.getElementById('map-container');
    const profileContainer = document.getElementById('profile-container');
    const notificationsContainer = document.getElementById('notifications-container');
    const paymentContainer = document.getElementById('payment-container');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const profileForm = document.getElementById('profile-form');
    const notificationsForm = document.getElementById('notifications-form');
    const paymentForm = document.getElementById('payment-form');

    const showRegisterButton = document.getElementById('show-register');
    const backToLoginButton = document.getElementById('back-to-login');

    const errorMessage = document.getElementById('error-message');

    showRegisterButton.addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });

    backToLoginButton.addEventListener('click', () => {
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        localStorage.setItem(email, password);
        alert("Cuenta creada con éxito. Ahora puedes iniciar sesión.");
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
                alert("Geolocalización no soportada.");
            }
        } else {
            errorMessage.classList.remove('hidden');
        }
    });

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const currentUser = getCurrentUser();
        if (currentUser) {
            currentUser.name = name;
            currentUser.email = email;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert("Perfil actualizado con éxito.");
        }
    });

    notificationsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const notifyAvailable = document.getElementById('notify-available').checked;
        const currentUser = getCurrentUser();
        if (currentUser) {
            currentUser.notifications = { notifyAvailable };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert("Configuración de notificaciones guardada.");
        }
    });

    paymentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cardNumber = document.getElementById('card-number').value.trim();
        const cardExpiry = document.getElementById('card-expiry').value.trim();
        const cardCvc = document.getElementById('card-cvc').value.trim();
        // Implement payment processing logic here
        alert("Pago realizado con éxito.");
    });
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    initMap(lat, lon);
}

function showError(error) {
    alert("No se pudo obtener la ubicación: " + error.message);
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
    }).addTo(map).bindPopup('<b>Tu ubicación actual</b>').openPopup();

    const chargers = [
        { id: 1, lat: 40.5467295, lon: -3.6434806, type: 'TYPE 2 / 7.40kW', status: 'No se puede reservar' },
        { id: 2, lat: 40.51991, lon: -3.66149, type: 'TYPE 2 22.00kW / Schuko 3.70kW', status: 'Obligatorio reservar' },
        { id: 3, lat: 40.519326, lon: -3.657155, type: 'TYPE 2 22.00kW', status: 'No se puede reservar' },
        { id: 4, lat: 40.519896, lon: -3.65764, type: 'TYPE 2 / 7.40kW', status: 'No se puede reservar' },
        { id: 5, lat: 40.519345, lon: -3.656415, type: 'TYPE 2 7.40kW', status: 'Reservable' },
        { id: 6, lat: 40.5186645, lon: -3.6575428, type: 'Tesla Destination Charger 11.00kW', status: 'No se puede reservar' },
        { id: 7, lat: 40.516553, lon: -3.656073, type: 'TYPE 2 22.00kW', status: '24h' },
        { id: 8, lat: 40.51569, lon: -3.65682, type: 'TYPE 2 22.00kW', status: 'Laborables' },
        { id: 9, lat: 40.534582, lon: -3.618301, type: 'TYPE 2 / 7.40kW', status: 'No se puede reservar' },
        { id: 10, lat: 40.53507, lon: -3.62144, type: 'Tesla Destination Charger 11.00kW', status: '24h' },
        { id: 11, lat: 40.546684, lon: -3.65477, type: 'TYPE 2 / 11.00kW', status: 'No se puede reservar' },
        { id: 12, lat: 40.547812, lon: -3.656808, type: 'TYPE 2 / 43KW, CHAdeMO 50KW', status: 'No se puede reservar' },
        { id: 13, lat: 40.5150227, lon: -3.6661338, type: 'Schuko (EU Plug) 2.30kW, TYPE 2 7.40kW', status: 'No se puede reservar' },
        { id: 14, lat: 40.5226938, lon: -3.6608542, type: 'TYPE 2 3.70kW / TYPE 2 4.2KW', status: 'No se puede reservar' },
        { id: 15, lat: 40.5236888, lon: -3.6587782, type: 'TYPE 2 / 3.70kW', status: 'No se puede reservar' },
        { id: 16, lat: 40.5268882, lon: -3.6541821, type: 'TYPE 2 7.40kW', status: 'No se puede reservar' },
        { id: 17, lat: 40.5175784637797, lon: -3.61716063080805, type: 'TYPE 2 / 7.4KW', status: 'No se puede reservar' },
        { id: 18, lat: 40.5514555513121, lon: -3.65681299256908, type: '22 kW Tipo 2', status: 'Con aplicación móvil' },
        { id: 19, lat: 40.540929491723, lon: -3.63403863678837, type: '22 kW Tipo 2', status: 'No se puede reservar' },
        { id: 20, lat: 40.5312292871596, lon: -3.63649780420733, type: '22 kW Tipo 2', status: 'Con aplicación móvil' }
    ];

    chargers.forEach(charger => {
        L.marker([charger.lat, charger.lon])
            .addTo(map)
            .bindPopup(`<b>Cargador ${charger.type}</b><br>Estado: ${charger.status}`);
    });
}