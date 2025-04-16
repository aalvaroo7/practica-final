import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Arreglo en memoria para almacenar los cargadores
let chargers = [
    { id: 1, type: 'Rápido', status: 'Disponible' },
    { id: 2, type: 'Nomal', status: 'Ocupado' },
    { id: 3, type: 'compatible', status: 'En reparación' }
];

// Endpoint para obtener la lista de cargadores
app.get('/api/chargers', (req, res) => {
    res.json(chargers);
});

// Endpoint para agregar un nuevo cargador (CREATE)
app.post('/api/chargers', (req, res) => {
    const { id, type, status } = req.body;
    if (!id || !type || !status) {
        return res.status(400).json({ error: 'Datos incompletos del cargador.' });
    }
    const newCharger = { id, type, status };
    chargers.push(newCharger);
    res.status(201).json(newCharger);
});

// Actualizar estado o cualquier dato de un cargador existente
app.put('/api/chargers/:id', (req, res) => {
    const chargerId = Number(req.params.id);
    const { type, status } = req.body;
    const chargerIndex = chargers.findIndex(charger => charger.id === chargerId);
    if (chargerIndex === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }
    // Actualiza solo las propiedades recibidas
    chargers[chargerIndex] = { ...chargers[chargerIndex], type, status };
    res.json(chargers[chargerIndex]);
});

// Endpoint para eliminar un cargador (DELETE)
app.delete('/api/chargers/:id', (req, res) => {
    const chargerId = Number(req.params.id);
    const index = chargers.findIndex(c => c.id === chargerId);
    if (index === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }
    const deletedCharger = chargers.splice(index, 1);
    res.json(deletedCharger[0]);
});

// Middleware para servir archivos de la carpeta "public"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPublicPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(staticPublicPath));

// Middleware para servir archivos de "users" (Admin, Técnico, etc.)
const staticUsersPath = path.join(__dirname, '../../frontend/users');
app.use('/users', express.static(staticUsersPath));

// Ruta para obtener credenciales preestablecidas
const packageJsonPath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/config', (req, res) => {
    res.json({
        admin: packageData.usuariosPredefinidos.find(user => user.rol === 'admin'),
        tecnico: packageData.usuariosPredefinidos.find(user => user.rol === 'tecnico')
    });
});

// Redirección para la ruta /login (se define antes de la ruta catch-all)
app.get('/login', (req, res) => {
    res.redirect('/users/user/user.html');
});

// Manejar todas las demás rutas con index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPublicPath, 'index.html'));
});

app.get('/api/stats', (req, res) => {
    // Datos de ejemplo para las estadísticas
    const stats = {
        chargersByType: {
            'Rapido': 2,
            'Normal': 5,
            'Compatible': 3
        },
        totalChargers: 10,
        totalUsers: 15
    };
    res.json(stats);
});


app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ port: 8080 });

let reservations = {};

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.type === 'reserve') {
            const { chargerId, duration } = data;
            reservations[chargerId] = ws;

            // Notificar al usuario que la reserva ha comenzado
            ws.send(JSON.stringify({ type: 'notification', message: 'Tu tiempo de reserva ha comenzado.' }));

            // Programar notificación para el final de la reserva
            setTimeout(() => {
                ws.send(JSON.stringify({ type: 'notification', message: 'Tu tiempo de reserva ha terminado.' }));
                delete reservations[chargerId];
            }, duration * 60000);
        }
    });
});