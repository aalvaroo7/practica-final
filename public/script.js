document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    initMap(lat, lon);
}

function initMap(lat, lon) {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat, lng: lon },
        zoom: 12
    });

    // Fetch and display chargers
    fetchChargers(map);
}

function fetchChargers(map) {
    // Example data, replace with API call
    const chargers = [
        { id: 1, lat: 40.416775, lon: -3.703790, type: 'rápido', status: 'libre' },
        { id: 2, lat: 40.416775, lon: -3.703790, type: 'estándar', status: 'ocupado' }
    ];

    chargers.forEach(charger => {
        const marker = new google.maps.Marker({
            position: { lat: charger.lat, lng: charger.lon },
            map: map,
            title: `Cargador ${charger.type} - ${charger.status}`
        });

        marker.addListener('click', () => {
            showChargerDetails(charger);
        });
    });
}

function showChargerDetails(charger) {
    const detailsDiv = document.getElementById('charger-details');
    detailsDiv.innerHTML = `
    <h2>Detalles del Cargador</h2>
    <p>Tipo: ${charger.type}</p>
    <p>Estado: ${charger.status}</p>
  `;
}