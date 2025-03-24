import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { login, logout, getCurrentUser } from '../src/auth.js';
import { saveReservation, getReservations } from '../src/storage.js';
import { getChargers } from '../src/api.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para servir archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Ruta de ejemplo
app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});

// Ruta para autenticación
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (login(username, password)) {
        res.status(200).send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.post('/logout', (req, res) => {
    logout();
    res.status(200).send('Logout successful');
});

app.get('/current-user', (req, res) => {
    const user = getCurrentUser();
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(401).send('No user logged in');
    }
});

// Ruta para obtener cargadores
app.get('/chargers', async (req, res) => {
    const chargers = await getChargers();
    res.status(200).json(chargers);
});

// Ruta para guardar una reserva
app.post('/reservations', (req, res) => {
    const reservation = req.body;
    saveReservation(reservation);
    res.status(201).send('Reservation saved');
});

app.get('/reservations', (req, res) => {
    const reservations = getReservations();
    res.status(200).json(reservations);
});

// Manejar todas las demás rutas sirviendo el archivo index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});