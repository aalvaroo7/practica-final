import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { login, logout, getCurrentUser, registerUser, updateUserProfile } from '../src/auth.js';
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

// Ruta para registro de usuarios
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (registerUser(email, password)) {
        res.status(201).send('User registered successfully');
    } else {
        res.status(400).send('Registration failed');
    }
});

// Ruta para actualizar perfil de usuario
app.put('/profile', (req, res) => {
    const { email, name } = req.body;
    if (updateUserProfile(email, name)) {
        res.status(200).send('Profile updated successfully');
    } else {
        res.status(400).send('Profile update failed');
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

// Ruta para autenticación de administrador
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.status(200).send('Admin login successful');
    } else {
        res.status(401).send('Invalid admin credentials');
    }
});

// Manejar todas las demás rutas sirviendo el archivo index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});