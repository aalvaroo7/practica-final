export function saveReservation(reservation) {
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
}

export function getReservations() {
    return JSON.parse(localStorage.getItem('reservations')) || [];
}

export function getUserReservations(email) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    return reservations.filter(reservation => reservation.email === email);
}