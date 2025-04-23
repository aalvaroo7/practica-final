document.addEventListener('DOMContentLoaded', async () => {
    // Declaración de variables y elementos del DOM
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
    reservationMessage.id = 'reservation-message';
    reserveForm.appendChild(reservationMessage);
    const showSurveyBtn = document.getElementById('show-survey-btn');
    const reportIssueBtn = document.getElementById("report-issue-btn");
    const reportIssueSection = document.getElementById("report-issue-section");

    if (!localStorage.getItem('currentUser')) {
        document.getElementById('favorites-container').classList.add('hidden');
    }
    showSurveyBtn.classList.add('hidden');
    if (localStorage.getItem('currentUser')) {
        showSurveyBtn.classList.remove('hidden');
    }
    showSurveyBtn.classList.add('hidden');

    // Función que oculta todas las secciones del menú lateral
    function hideSideMenuSections() {
        mapContainer.classList.add('hidden');
        editProfileContainer.classList.add('hidden');
        reservationHistoryContainer.classList.add('hidden');
        document.getElementById('personal-stat-table').classList.add('hidden');
        document.getElementById('review-section').classList.add('hidden');
        document.getElementById('survey-section').classList.add('hidden');
        showSurveyBtn.classList.add('hidden');
    }

    // Manejador de mensajes del WebSocket para notificaciones
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

    // Función para pre-cargar el formulario de edición de perfil
    function showEditProfileForm() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(localStorage.getItem(currentUser));
            // Asegurarse de que userData contenga el campo "name" y "email"
            document.getElementById('edit-name').value = userData && userData.name ? userData.name : '';
            document.getElementById('edit-email').value = userData && userData.email ? userData.email : '';
        }
        editProfileContainer.classList.remove('hidden');
    }

    const incidenceForm = document.getElementById('incidence-form');
    if (incidenceForm) {
        incidenceForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const description = document.getElementById('issue-description').value.trim();
            if (!description) return alert('La descripción es obligatoria.');

            try {
                const response = await fetch('/api/problemas', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ description })
                });

                if (!response.ok) throw new Error('Error al reportar incidencia.');
                const newIncidence = await response.json();

                const incidencesList = document.getElementById('incidences-list');
                if (incidencesList) {
                    const item = document.createElement('div');
                    item.textContent = `Incidencia: ${newIncidence.description} / Estado: ${newIncidence.status}`;
                    incidencesList.appendChild(item);
                }

                incidenceForm.reset();
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    }


    // Función para mostrar la sección de editar perfil
    function showEditProfile() {
        mapContainer.classList.add('hidden');
        editProfileContainer.classList.remove('hidden');
        showMapBtn.classList.remove('hidden');
        showEditProfileForm();
    }

    // Manejador para el botón "Editar Perfil"
    if (editProfileButton) {
        editProfileButton.removeEventListener('click', showEditProfileForm);
        editProfileButton.addEventListener('click', showEditProfile);
    }

    editProfileForm.addEventListener('submit', event => {
        event.preventDefault();
        const newName = document.getElementById('edit-name').value.trim();
        const newEmail = document.getElementById('edit-email').value.trim();
        let currentUser = localStorage.getItem('currentUser');
        let userData = JSON.parse(localStorage.getItem(currentUser)) || {};

        if (newEmail !== currentUser) {
            // Cambiar la clave en localStorage si se modificó el correo
            localStorage.removeItem(currentUser);
            localStorage.setItem(newEmail, JSON.stringify({name: newName, email: newEmail}));
            localStorage.setItem('currentUser', newEmail);
            currentUser = newEmail;  // 🔁 ACTUALIZA LA VARIABLE para futuras referencias
        } else {
            userData.name = newName;
            userData.email = newEmail;
            localStorage.setItem(currentUser, JSON.stringify(userData));
        }

        alert('Perfil actualizado correctamente.');
        editProfileContainer.classList.add('hidden');
    });

    // Manejador para mostrar el historial de reservas
    function showReservationHistory() {
        mapContainer.classList.add('hidden');
        reservationHistoryContainer.classList.remove('hidden');
        document.getElementById('personal-stat-table').classList.add('hidden');
        const showAllBtn = document.getElementById('show-all-btn');
        if (showAllBtn) {
            showAllBtn.classList.remove('hidden');
        }
        showMapBtn.classList.remove('hidden');
        loadReservationHistory();
    }

    if (reservationHistoryBtn) {
        reservationHistoryBtn.addEventListener('click', showReservationHistory);
    }

    const showAllBtn = document.getElementById('show-all-btn');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            reservationHistoryContainer.classList.add('hidden');
            mapContainer.classList.remove('hidden');
            if (buttonContainer) {
                buttonContainer.classList.remove('hidden');
            }
        });
    }

    // Verificar que el usuario esté autenticado y redirigir si no
    let currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        editProfileButton.classList.add('hidden');
        reservationHistoryBtn.classList.add('hidden');
        window.location.href = '/login.html';
    }

    async function fetchChargers(type = 'all') {
        try {
            const response = await fetch(`/api/chargers?type=${type}`);
            if (!response.ok) throw new Error('Error al obtener los cargadores');
            return await response.json(); // Devuelve la lista de cargadores
        } catch (error) {
            console.error('Error al cargar cargadores:', error);
            return []; // Devuelve una lista vacía si falla
        }
    }

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

    // Manejadores para otras secciones del menú lateral
    reservationHistoryBtn.addEventListener('click', () => {
        hideSideMenuSections();
        reservationHistoryContainer.classList.remove('hidden');
        const showAllBtn = document.getElementById('show-all-btn');
        if (showAllBtn) {
            showAllBtn.classList.remove('hidden');
        }
        loadReservationHistory();
    });

    viewStatsBtn.addEventListener('click', () => {
        hideSideMenuSections();
        mapContainer.classList.add('hidden');
        reservationHistoryContainer.classList.add('hidden');
        loadStatistics();
    });

    showSurveyBtn.addEventListener('click', () => {
        hideSideMenuSections();
        document.getElementById('survey-section').classList.remove('hidden');
        showSurveyBtn.classList.add('hidden');
    });

    const leaveReviewBtn = document.getElementById('leave-review-btn');
    const reviewSection = document.getElementById('review-section');
    if (leaveReviewBtn && reviewSection) {
        leaveReviewBtn.addEventListener('click', () => {
            hideSideMenuSections();
            reviewSection.classList.remove('hidden');
        });
    }

    // Manejador de WebSocket para reserva de cargador
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
                duration: reservationTime,
                user: localStorage.getItem('currentUser')
            }));
        }
    });



    // Cargar historial de reservas desde API
    async function loadReservationHistory() {
        try {
            const response = await fetch('/api/reservations');
            if (!response.ok) throw new Error('Error al obtener el historial de reservas');
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
                        <th>Acciones</th>
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
                    <td>
                        ${!reservation.finished ? `
                            <button onclick='showModifyReservationForm(${JSON.stringify(reservation)})'>Modificar</button>
                            <button onclick='extendReservation(${JSON.stringify(reservation)})'>Extender</button>` : '—'}
                    </td>
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

    let selectedCharger = null;
    let map;
    let markers = [];

    function initMap(lat, lon, chargers) {
        map = L.map('map').setView([lat, lon], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        chargers.forEach(charger => {
            const marker = L.marker([charger.lat, charger.lon])
                .addTo(map)
                .bindPopup(`
                <b>Charger ${charger.type}</b><br>Status: ${charger.status}<br>
                <button id="reserve-btn-${charger.id}" class="reserve-btn">Reservar</button>
                <button id="navigate-btn-${charger.id}" class="navigate-btn button-margin">Navegar</button>
                <button id="fav-btn-${charger.id}" class="fav-btn button-margin">Favorito</button>
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
        // Valores aleatorios generados cada vez
        const batteryLevel = Math.floor(Math.random() * 101); // 0 a 100%
        const estimatedTime = Math.floor(Math.random() * 31) + 10; // 10 a 40 min
        const cost = (Math.random() * 10 + 5).toFixed(2); // €5.00 a €15.00

        // Insertamos esos valores en el HTML
        chargerDetails.innerHTML = `
        <h3>Detalles del Cargador</h3>
        <p>Tipo: ${charger.type}</p>
        <p>Estado: ${charger.status}</p>
        <p>Nivel de Batería: ${batteryLevel}%</p>
        <p>Tiempo Estimado: ${estimatedTime} min</p>
        <p>Coste: €${cost}</p>
    `;

        reservationForm.classList.remove('hidden');
        modal.classList.remove('hidden');
    }

    // Abrir aplicación de navegación (Google Maps)
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

    // Actualizar mapa con una lista filtrada de cargadores
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

    // Cargar y mostrar estadísticas de reservas
    async function loadStatistics() {
        mapContainer.classList.add('hidden');
        showMapBtn.classList.remove('hidden');
        reservationHistoryContainer.classList.add('hidden');
        try {
            const response = await fetch('/api/reservations');
            if (!response.ok) throw new Error('Error al obtener las reservas');
            const reservations = await response.json();
            const finishedReservations = reservations.filter(r => r.finished);
            const totalReservations = finishedReservations.length;
            const totalDuration = finishedReservations.reduce((sum, r) => sum + Number(r.duration), 0);
            const averageDuration = totalReservations > 0 ? (totalDuration / totalReservations).toFixed(2) : 0;
            const statsTableBody = document.querySelector('#personal-stat-table tbody');
            statsTableBody.innerHTML = `
        <tr>
          <td>${totalReservations}</td>
          <td>${totalDuration}</td>
          <td>${averageDuration}</td>
        </tr>
      `;
            document.getElementById('personal-stat-table').classList.remove('hidden');
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    if (viewStatsBtn) {
        viewStatsBtn.addEventListener('click', loadStatistics);
    }

    // Funciones para favoritos
    function addChargerToFavorites(charger) {
        let favorites = JSON.parse(localStorage.getItem(`${currentUser}-favorites`)) || [];
        if (!favorites.find(fav => fav.id === charger.id)) {
            favorites.push(charger);
            localStorage.setItem(`${currentUser}-favorites`, JSON.stringify(favorites));
        }
        updateFavoritesDisplay();
    }

    function updateFavoritesDisplay() {
        const container = document.getElementById('favorites-container');
        let favorites = JSON.parse(localStorage.getItem(`${currentUser}-favorites`)) || [];
        if (favorites.length > 0) {
            let html = '<h3>Favoritos</h3><ul>';
            favorites.forEach(charger => {
                html += `<li>Cargador ${charger.type} - ID: ${charger.id}</li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>No tienes cargadores en favoritos.</p>';
        }
    }

    updateFavoritesDisplay();

    // Funcionalidad para enviar reseñas
    const reviewForm = document.getElementById('review-form');
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
                    await response.json();
                    alert('Reseña guardada correctamente.');
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

    const reviewRatingButtons = document.querySelectorAll('.rating-btn');
    reviewRatingButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            document.getElementById('review-rating').value = button.getAttribute('data-value');
        });
    });

    // Manejo del formulario de login y registro
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
            document.getElementById('show-recommendations-btn').classList.remove('hidden');
            document.getElementById('report-issue-btn').classList.remove('hidden');

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert('Geolocation not supported.');
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

        fetchChargers().then(chargers => {
            initMap(lat, lon, chargers); // Le pasamos los cargadores como parámetro
        });
    }


    function showError(error) {
        alert("Unable to retrieve location: " + error.message);
    }
    const response = await fetch('/api/problemas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ description })
    });


// Obtener los chargers desde el archivo JSON (si es local o desde una base de datos)
    function obtenerChargers() {
        return fetch('/api/chargers') // Usamos el endpoint del servidor
            .then(response => response.json()) // Parsear el archivo JSON
            .then(data => data) // Devuelve los datos de chargers
            .catch(error => {
                console.error("Error al cargar chargers:", error);
                return []; // En caso de error, devolver un array vacío
            });
    }

// Mostrar recomendaciones
    function mostrarRecomendaciones() {
        obtenerChargers().then(chargers => {
            // Filtrar chargers que estén disponibles
            const chargersDisponibles = chargers.filter(charger => charger.status === "available");

            // Filtrar chargers por tipo (por ejemplo, "fast")
            const chargersRecomendados = chargersDisponibles.filter(charger => charger.type === "fast");

            // Obtener el contenedor de recomendaciones
            const contenedorRecomendaciones = document.getElementById("favorites-container");

            // Limpiar el contenedor antes de agregar los nuevos chargers
            contenedorRecomendaciones.innerHTML = "";

            if (chargersRecomendados.length > 0) {
                chargersRecomendados.forEach(charger => {
                    // Crear el elemento HTML para cada charger recomendado
                    const divCharger = document.createElement("div");
                    divCharger.classList.add("cargador-recomendado"); // Puedes renombrar la clase si quieres consistencia
                    divCharger.innerHTML = `
                    <h3>Charger ${charger.id}</h3>
                    <p>Tipo: ${charger.type}</p>
                    <p>Estado: ${charger.status}</p>
                    <p>Precio: ${charger.price} €/hora</p>
                    <p>Horario: ${charger.availability.start} - ${charger.availability.end}</p>
                    <button class="reservar-btn" data-id="${charger.id}">Reservar</button>
                `;
                    contenedorRecomendaciones.appendChild(divCharger);

                    // Agregar evento de reserva
                    divCharger.querySelector(".reservar-btn").addEventListener("click", () => {
                        reservarCargador(charger.id);
                    });
                });
            } else {
                contenedorRecomendaciones.innerHTML = "<p>No hay chargers recomendados disponibles en este momento.</p>";
            }
        });
    }

    // Función para guardar la reserva en el localStorage.
    function saveReservationToHistory(chargerId, duration) {
        const currentUser = localStorage.getItem('currentUser');
        const reservationHistory = JSON.parse(localStorage.getItem(`${currentUser}-history`)) || [];
        const timestamp = new Date().toLocaleString();
        reservationHistory.push({chargerId, duration, timestamp});
        localStorage.setItem(`${currentUser}-history`, JSON.stringify(reservationHistory));
    }

    // Función para reservar el cargador.
    function reservarCargador(chargerId) {
        const reservationTime = prompt("Ingrese la duración de la reserva en minutos:");
        if (!reservationTime || isNaN(reservationTime) || reservationTime <= 0) {
            alert("Duración inválida.");
            return;
        }
        // Guarda la reserva en el historial del localStorage.
        saveReservationToHistory(chargerId, reservationTime);

        // Envía el mensaje por WebSocket.
        socket.send(JSON.stringify({
            type: "reserve",
            chargerId: chargerId,
            duration: reservationTime,
            user: localStorage.getItem("currentUser")
        }));

        alert(`La reserva para el cargador ${chargerId} se realizó correctamente por ${reservationTime} minutos.`);
    }

// Asignar el event listener usando el id del botón.
    const reserveBtn1 = document.getElementById("reserve-btn-1");
    if (reserveBtn1) {
        reserveBtn1.addEventListener("click", (e) => {
            e.preventDefault();
            reservarCargador(1);
        });
    }

    document.getElementById("show-recommendations-btn").addEventListener("click", function () {
        const contenedorRecomendaciones = document.getElementById("favorites-container");
        contenedorRecomendaciones.classList.toggle("hidden");
        mostrarRecomendaciones(); // Llama a la función para mostrar las recomendaciones
    });

    if (reportIssueBtn && reportIssueSection) {
        reportIssueBtn.addEventListener("click", () => {
            hideSideMenuSections();
            reportIssueSection.classList.toggle("hidden");
        });
    }
});

window.extendReservation = extendReservation;
window.showModifyReservationForm = showModifyReservationForm;

function showModifyReservationForm(reservation) {
    const newDuration = prompt(`Duración actual: ${reservation.duration} minutos.\nIntroduce nueva duración:`);
    if (!newDuration || isNaN(newDuration) || newDuration <= 0) {
        alert("Duración inválida.");
        return;
    }

    fetch(`/api/reservations/${reservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: parseInt(newDuration) })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            alert('Reserva modificada correctamente.');
            loadReservationHistory(); // refresca la tabla
        })
        .catch(err => alert(err.message));
}

function extendReservation(reservation) {
    const extension = prompt("¿Cuántos minutos deseas extender la reserva?");
    if (!extension || isNaN(extension) || extension <= 0) {
        alert("Duración inválida.");
        return;
    }

    fetch(`/api/reservations/extend/${reservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionDuration: parseInt(extension) })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            alert('Reserva extendida correctamente.');
            loadReservationHistory();
        })
        .catch(err => alert(err.message));
}

