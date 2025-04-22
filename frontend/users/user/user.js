document.addEventListener('DOMContentLoaded', async () => {
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
    const reservationHistoryContainer = document.getElementById('reservation-history-container');
    const reservationHistoryBtn = document.getElementById('reservation-history-btn');
    const reservationHistoryList = document.getElementById('reservation-history-list');
    const adminBtn = document.getElementById('admin-btn');
    const tecnicoBtn = document.getElementById('tecnico-btn');
    const editProfileContainer = document.getElementById('edit-profile-container');
    const editProfileForm = document.getElementById('edit-profile-form');
    const editProfileButton = document.getElementById('edit-profile-btn');
    const socket = new WebSocket('ws://localhost:8080');
    const showMapBtn = document.getElementById('show-map-btn');
    const viewStatsBtn = document.getElementById('view-stats-btn');
    const reservationMessage = document.createElement('p');
    const reviewForm = document.getElementById('review-form');

    reservationMessage.id = 'reservation-message';
    reserveForm.appendChild(reservationMessage);

    if (!localStorage.getItem('currentUser')) {
        document.getElementById('favorites-container').classList.add('hidden');
    }

    // Función que oculta todas las secciones relacionadas al menú lateral
    function hideSideMenuSections() {
        mapContainer.classList.add('hidden');
        editProfileContainer.classList.add('hidden');
        reservationHistoryContainer.classList.add('hidden');
        document.getElementById('personal-stat-table').classList.add('hidden');
        document.getElementById('review-section').classList.add('hidden');
    }


    socket.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
            alert(data.message);
        }
    });

    // Manejador para el botón "Mostrar Mapa"
    showMapBtn.addEventListener('click', () => {
        hideSideMenuSections();
        mapContainer.classList.remove('hidden');
    });

    // Manejador para el botón "Editar Perfil"
    editProfileButton.removeEventListener('click', showEditProfileForm);
    editProfileButton.addEventListener('click', () => {
        hideSideMenuSections();
        editProfileContainer.classList.remove('hidden');
        showEditProfileForm();
    });

    // Manejador para el botón "Ver Historial de Reservas"
    reservationHistoryBtn.addEventListener('click', () => {
        hideSideMenuSections();
        reservationHistoryContainer.classList.remove('hidden');
        // Si existe el botón "Mostrar Todo", se hace visible
        const showAllBtn = document.getElementById('show-all-btn');
        if (showAllBtn) {
            showAllBtn.classList.remove('hidden');
        }
        // Se puede llamar a la función para cargar el historial
        loadReservationHistory();
    });

// Manejador para el botón "Ver Estadísticas de Uso"
    viewStatsBtn.addEventListener('click', () => {
        hideSideMenuSections();
        mapContainer.classList.add('hidden'); // Asegurarse que el mapa esté oculto
        reservationHistoryContainer.classList.add('hidden');
        // Cargar estadísticas y mostrar la tabla correspondiente
        loadStatistics();
    });

    // Manejador para el botón "Dejar Reseña"
    const leaveReviewBtn = document.getElementById('leave-review-btn');
    const reviewSection = document.getElementById('review-section');

    if (leaveReviewBtn && reviewSection) {
        leaveReviewBtn.addEventListener('click', () => {
            hideSideMenuSections();
            reviewSection.classList.remove('hidden');
        });
    }

    // Función para mostrar el historial de reservas, ahora incluyendo el botón "Mostrar Todo"
    function showReservationHistory() {
        // Oculta el contenedor del mapa
        mapContainer.classList.add('hidden');
        // Muestra el contenedor del historial de reservas
        reservationHistoryContainer.classList.remove('hidden');
        document.getElementById('personal-stat-table').classList.add('hidden');
        // Muestra el botón adicional "Mostrar Todo"
        const showAllBtn = document.getElementById('show-all-btn');
        if (showAllBtn) {
            showAllBtn.classList.remove('hidden');
        }
        // Muestra el botón "Mostrar Mapa"
        showMapBtn.classList.remove('hidden');
        // Carga el historial de reservas
        loadReservationHistory();
    }

    // Evento para el botón "Mostrar Todo"
    const showAllBtn = document.getElementById('show-all-btn');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            // Oculta el contenedor del historial de reservas
            reservationHistoryContainer.classList.add('hidden');
            // Muestra nuevamente el contenedor del mapa y el contenedor de botones
            mapContainer.classList.remove('hidden');
            if (buttonContainer) {
                buttonContainer.classList.remove('hidden');
            }
        });
    }

    if (reservationHistoryBtn) {
        reservationHistoryBtn.addEventListener('click', showReservationHistory);
    }

    let selectedCharger = null;
    let currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        editProfileButton.classList.add('hidden');
        reservationHistoryBtn.classList.add('hidden');
        window.location.href = '/login.html';
    }

    const chargers = [
        {id: 1, lat: 40.416775, lon: -3.70379, type: 'fast', status: 'Available'},
        {id: 2, lat: 41.385064, lon: 2.173404, type: 'standard', status: 'Available'},
        {id: 3, lat: 39.469907, lon: -0.376288, type: 'compatible', status: 'Available'}
    ];

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

    // Función que pre-carga el formulario de edición de perfil
    function showEditProfileForm() {
        const userData = JSON.parse(localStorage.getItem(currentUser));
        document.getElementById('edit-name').value = userData.name;
        document.getElementById('edit-email').value = currentUser;
        editProfileContainer.classList.remove('hidden');
    }

    // Función para mostrar la sección de editar perfil con el comportamiento deseado
    function showEditProfile() {
        mapContainer.classList.add('hidden');
        editProfileContainer.classList.remove('hidden');
        showMapBtn.classList.remove('hidden');
        showEditProfileForm();
    }

    if (editProfileButton) {
        editProfileButton.removeEventListener('click', showEditProfileForm);
        editProfileButton.addEventListener('click', showEditProfile);
    }

    editProfileForm.addEventListener('submit', event => {
        event.preventDefault();
        const newName = document.getElementById('edit-name').value.trim();
        const newEmail = document.getElementById('edit-email').value.trim();
        if (newEmail !== currentUser) {
            localStorage.removeItem(currentUser);
            localStorage.setItem(newEmail, JSON.stringify({name: newName, email: newEmail}));
            localStorage.setItem('currentUser', newEmail);
        } else {
            const userData = JSON.parse(localStorage.getItem(currentUser));
            userData.name = newName;
            localStorage.setItem(currentUser, JSON.stringify(userData));
        }
        alert('Perfil actualizado correctamente.');
        editProfileContainer.classList.add('hidden');
    });

    loginForm.addEventListener('submit', event => {
        event.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const storedPassword = localStorage.getItem(email);
        if (storedPassword === password) {
            localStorage.setItem('currentUser', email);
            loginContainer.classList.add('hidden');
            mapContainer.classList.remove('hidden');
            buttonContainer.classList.add('hidden');
            viewStatsBtn.classList.remove('hidden');
            updateFilterVisibility();
            editProfileButton.classList.remove('hidden');
            reservationHistoryBtn.classList.remove('hidden');
            document.getElementById('favorites-container').classList.remove('hidden');
            localStorage.removeItem(`${email}-favorites`);
            document.getElementById('leave-review-btn').classList.remove('hidden');
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation not supported.");
            }
            adminBtn.classList.add('hidden');
            tecnicoBtn.classList.add('hidden');
        } else {
            errorMessage.classList.remove('hidden');
        }
    });

    adminBtn.addEventListener('click', () => {
        window.location.href = '/users/Admin/admin.html';
    });

    tecnicoBtn.addEventListener('click', () => {
        window.location.href = '/users/Tecnico/tecnico.html';
    });

    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', event => {
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

    // Dentro de la función initMap se modifica el contenido del popup para incluir el botón de favoritos
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
        <button id="navigate-btn-${charger.id}" class="navigate-btn button-margin">Navigate</button>
        <button id="fav-btn-${charger.id}" class="fav-btn button-margin">Favorite</button>
      `);
            marker.on('popupopen', () => {
                const reserveButton = document.getElementById(`reserve-btn-${charger.id}`);
                const navigateButton = document.getElementById(`navigate-btn-${charger.id}`);
                const favButton = document.getElementById(`fav-btn-${charger.id}`);
                if (reserveButton) {
                    reserveButton.addEventListener('click', e => {
                        e.preventDefault();
                        selectedCharger = charger;
                        showReservationForm(charger);
                    });
                }
                if (navigateButton) {
                    navigateButton.addEventListener('click', e => {
                        e.preventDefault();
                        openNavigationApp(charger.lat, charger.lon);
                    });
                }
                if (favButton) {
                    favButton.addEventListener('click', e => {
                        e.preventDefault();
                        addChargerToFavorites(charger);
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

    function openNavigationApp(lat, lon) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        window.open(url, '_blank');
    }

    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', event => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });

    function saveReservationToHistory(chargerId, duration) {
        const reservationHistory = JSON.parse(localStorage.getItem(`${currentUser}-history`)) || [];
        const timestamp = new Date().toLocaleString();
        reservationHistory.push({chargerId, duration, timestamp});
        localStorage.setItem(`${currentUser}-history`, JSON.stringify(reservationHistory));
    }

    reserveForm.addEventListener('submit', event => {
        event.preventDefault();
        const reservationTime = document.getElementById('reservation-time').value;
        if (selectedCharger) {
            saveReservationToHistory(selectedCharger.id, reservationTime);
            alert(`Tu cargador ha sido reservado correctamente por ${reservationTime} minutos.`);
            reservationForm.classList.add('hidden');
            modal.classList.add('hidden');
            socket.send(JSON.stringify({
                type: 'reserve',
                chargerId: selectedCharger.id,
                duration: reservationTime
            }));
        }
    });

    async function loadReservationHistory() {
        try {
            const response = await fetch('/api/reservations');
            if (!response.ok) {
                throw new Error('Error al obtener el historial de reservas');
            }
            const reservations = await response.json();
            const container = document.getElementById('reservation-history-container');
            if (reservations && reservations.length > 0) {
                let html = `
                    <table class="reservation-table">
                      <thead>
                        <tr>
                          <th>ID de Reserva</th>
                          <th>ID de Cargador</th>
                          <th>Duración (min)</th>
                          <th>Fecha</th>
                          <th>Finalizado</th>
                        </tr>
                      </thead>
                      <tbody>`;
                reservations.forEach(reservation => {
                    html += `
                        <tr>
                          <td>${reservation.id}</td>
                          <td>${reservation.chargerId}</td>
                          <td>${reservation.duration}</td>
                          <td>${new Date(reservation.date).toLocaleString()}</td>
                          <td>${reservation.finished ? 'Sí' : 'No'}</td>
                        </tr>`;
                });
                html += `</tbody></table>`;
                container.innerHTML = html;
            } else {
                container.innerHTML = 'No hay reservas registradas.';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function updateMap(chargerList) {
        markers.forEach(marker => map.removeLayer(marker));
        markers.length = 0;
        chargerList.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(`<b>Cargador ${charger.type}</b><br>Status: ${charger.status}`);
            markers.push(marker);
        });
    }

    async function loadStatistics() {
        mapContainer.classList.add('hidden');
        showMapBtn.classList.remove('hidden');
        reservationHistoryContainer.classList.add('hidden');

        try {
            const response = await fetch('/api/reservations');
            if (!response.ok) throw new Error('Error al obtener las reservas');
            const reservations = await response.json();

            // Filtrar las reservas finalizadas
            const finishedReservations = reservations.filter(r => r.finished);
            const totalReservations = finishedReservations.length;
            // Sumar la duración de las reservas finalizadas
            const totalDuration = finishedReservations.reduce((sum, r) => sum + Number(r.duration), 0);
            const averageDuration = totalReservations > 0 ? (totalDuration / totalReservations).toFixed(2) : 0;

            // Actualizar el cuerpo de la tabla de estadísticas
            const statsTableBody = document.querySelector('#personal-stat-table tbody');
            statsTableBody.innerHTML = `
      <tr>
        <td>${totalReservations}</td>
        <td>${totalDuration}</td>
        <td>${averageDuration}</td>
      </tr>
    `;
            // Mostrar la tabla de estadísticas
            document.getElementById('personal-stat-table').classList.remove('hidden');
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    // Evento para cargar estadísticas al hacer clic en el botón
    if (viewStatsBtn) {
        viewStatsBtn.addEventListener('click', loadStatistics);
    }

    // Función para agregar un cargador a favoritos y actualizar la vista
    function addChargerToFavorites(charger) {
        let favorites = JSON.parse(localStorage.getItem(`${currentUser}-favorites`)) || [];
        if (!favorites.find(fav => fav.id === charger.id)) {
            favorites.push(charger);
            localStorage.setItem(`${currentUser}-favorites`, JSON.stringify(favorites));
        }
        updateFavoritesDisplay();
    }

    // Función que actualiza el contenedor de favoritos
    function updateFavoritesDisplay() {
        const container = document.getElementById('favorites-container');
        let favorites = JSON.parse(localStorage.getItem(`${currentUser}-favorites`)) || [];
        if (favorites.length > 0) {
            let html = '<h3>Favoritos</h3><ul>';
            favorites.forEach(charger => {
                html += `<li>Charger ${charger.type} - ID: ${charger.id}</li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>No tienes cargadores en favoritos.</p>';
        }
    }

    // Llamada para actualizar la visualización al cargar la página
    updateFavoritesDisplay();

    // Función para enviar una reseña al servidor

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const user = document.getElementById('review-user').value.trim();
            const rating = Number(document.getElementById('review-rating').value);
            const comentario = document.getElementById('review-comentario').value.trim();
            const chargerId = document.getElementById('review-chargerId') ? document.getElementById('review-chargerId').value.trim() : null;

            try {
                const response = await fetch('/api/resenas', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({user, rating, comentario, chargerId})
                });
                if (response.ok) {
                    const nuevaResena = await response.json();
                    alert('Reseña guardada correctamente.');
                    // Opcional: actualizar la vista o limpiar el formulario
                    reviewForm.reset();
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Error al enviar la reseña:', error);
            }
        });

    }

    // Agregar el manejador para el botón de la reseña
    const reviewRatingButtons = document.querySelectorAll('.rating-btn');
    reviewRatingButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desmarcar todas las estrellas
            document.querySelectorAll('.rating-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            // Marcar la estrella seleccionada
            button.classList.add('selected');

            // Actualizar el valor del input oculto con el valor correspondiente
            document.getElementById('review-rating').value = button.getAttribute('data-value');
        });
    });

    // Verificar si el usuario ya está autenticado al cargar la página
    window.onload = function() {
        const currentUser = localStorage.getItem('currentUser');
        const surveySection = document.getElementById('survey-section');

        // Si no hay usuario logueado, la encuesta no se mostrará
        if (!currentUser) {
            surveySection.classList.add('hidden');
        }
    };

// Llamar a la función que muestra la encuesta solo si el usuario está logueado y no ha completado la encuesta
    function showSurveyIfNeeded() {
        const currentUser = localStorage.getItem('currentUser');
        const surveySection = document.getElementById('survey-section');

        // Solo mostrar la encuesta si el usuario está logueado y no ha completado la encuesta
        if (currentUser && !localStorage.getItem(`${currentUser}-surveyCompleted`)) {
            surveySection.classList.remove('hidden');

            // Ocultar la encuesta automáticamente después de 30 segundos si no se rellena
            setTimeout(() => {
                surveySection.classList.add('hidden');
            }, 30000);  // 30 segundos para rellenar la encuesta
        }
    }

// Lógica para enviar la encuesta
    const surveyForm = document.getElementById('survey-form');
    surveyForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const rating = document.getElementById('survey-rating-value').value;
        const comments = document.getElementById('survey-comments').value.trim();
        const currentUser = localStorage.getItem('currentUser');
        const surveySection = document.getElementById('survey-section');

        try {
            const response = await fetch('/api/satisfaction-survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comments })
            });

            if (response.ok) {
                alert('Gracias por completar la encuesta de satisfacción.');
                surveySection.classList.add('hidden');  // Ocultar la encuesta después de enviarla
                localStorage.setItem(`${currentUser}-surveyCompleted`, 'true');  // Marcar la encuesta como completada
            } else {
                alert('Error al enviar la encuesta. Por favor, inténtalo nuevamente.');
            }
        } catch (error) {
            console.error('Error al enviar la encuesta:', error);
            alert('Hubo un problema al enviar la encuesta. Por favor, intenta más tarde.');
        }
    });

});