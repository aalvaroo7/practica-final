export function saveReservation(reservation) {
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
}

export function getReservations() {
    return JSON.parse(localStorage.getItem('reservations')) || [];
}