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
        { id: 1, lat: 40.416775, lon: -3.703790, type: 'rápido', status: 'libre' },
        { id: 2, lat: 40.418775, lon: -3.705790, type: 'estándar', status: 'ocupado' },
        { id: 3, lat: 40.420775, lon: -3.707790, type: 'rápido', status: 'libre' },
        { id: 4, lat: 40.422775, lon: -3.709790, type: 'estándar', status: 'ocupado' },
        { id: 5, lat: 40.424775, lon: -3.711790, type: 'rápido', status: 'libre' },
        { id: 6, lat: 40.426775, lon: -3.713790, type: 'estándar', status: 'ocupado' },
        { id: 7, lat: 40.428775, lon: -3.715790, type: 'rápido', status: 'libre' },
        { id: 8, lat: 40.430775, lon: -3.717790, type: 'estándar', status: 'ocupado' },
        { id: 9, lat: 40.432775, lon: -3.719790, type: 'rápido', status: 'libre' },
        { id: 10, lat: 40.434775, lon: -3.721790, type: 'estándar', status: 'ocupado' },
        { id: 11, lat: 40.607978, lon: -3.710333, type: 'rápido', status: 'libre' },
        { id: 12, lat: 40.609978, lon: -3.712333, type: 'estándar', status: 'ocupado' },
        { id: 13, lat: 40.611978, lon: -3.714333, type: 'rápido', status: 'libre' },
        { id: 14, lat: 40.537270, lon: -3.637220, type: 'estándar', status: 'ocupado' },
        { id: 15, lat: 40.539270, lon: -3.639220, type: 'rápido', status: 'libre' },
        { id: 16, lat: 40.446192, lon: -3.813528, type: 'estándar', status: 'ocupado' },
        { id: 17, lat: 40.448192, lon: -3.815528, type: 'rápido', status: 'libre' },
        { id: 18, lat: 40.450192, lon: -3.817528, type: 'estándar', status: 'ocupado' },
        { id: 19, lat: 40.473822, lon: -3.871634, type: 'rápido', status: 'libre' },
        { id: 20, lat: 40.475822, lon: -3.873634, type: 'estándar', status: 'ocupado' },
        { id: 21, lat: 40.477822, lon: -3.875634, type: 'rápido', status: 'libre' },
        { id: 22, lat: 40.423447, lon: -3.561844, type: 'estándar', status: 'ocupado' },
        { id: 23, lat: 40.425447, lon: -3.563844, type: 'rápido', status: 'libre' },
        { id: 24, lat: 40.308250, lon: -3.732393, type: 'estándar', status: 'ocupado' },
        { id: 25, lat: 40.310250, lon: -3.734393, type: 'rápido', status: 'libre' },
        { id: 26, lat: 40.312250, lon: -3.736393, type: 'estándar', status: 'ocupado' },
        { id: 27, lat: 40.314250, lon: -3.738393, type: 'rápido', status: 'libre' },
        { id: 28, lat: 40.237370, lon: -3.767017, type: 'estándar', status: 'ocupado' },
        { id: 29, lat: 40.349274, lon: -3.538680, type: 'rápido', status: 'libre' },
        { id: 30, lat: 40.351274, lon: -3.540680, type: 'estándar', status: 'ocupado' },
        { id: 31, lat: 40.678215, lon: -3.611634, type: 'rápido', status: 'libre' },
        { id: 32, lat: 40.481979, lon: -3.363542, type: 'estándar', status: 'ocupado' },
        { id: 33, lat: 40.483979, lon: -3.365542, type: 'rápido', status: 'libre' }
    ];

    chargers.forEach(charger => {
        L.marker([charger.lat, charger.lon])
            .addTo(map)
            .bindPopup(`<b>Cargador ${charger.type}</b><br>Estado: ${charger.status}`);
    });
}