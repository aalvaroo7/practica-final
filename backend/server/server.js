import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Variables de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chargersFilePath = path.join(__dirname, 'chargers.json');
const staticPublicPath = path.join(__dirname, '../../frontend/public');
const staticUsersPath = path.join(__dirname, '../../frontend/users');
const staticFrontendPath = path.join(__dirname, '..', 'frontend');

// Carga inicial de cargadores
let chargers = [];
function loadChargers() {
    try {
        const data = fs.readFileSync(chargersFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        chargers = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error al cargar datos de cargadores:', error);
        chargers = [];
    }
}
loadChargers();

// Rutas de archivos estáticos
app.use(express.static(staticPublicPath));
app.use('/users', express.static(staticUsersPath));
app.use(express.static(staticFrontendPath));

// Configuración de la base de datos lowdb
const adapter = new JSONFile(path.join(__dirname, 'reservas.json'));
const db = new Low(adapter, { default: { reservations: [] } });
async function initLowDb() {
    await db.read();
    if (!db.data) {
        db.data = { reservations: [] };
        await db.write();
    }
}
await initLowDb();

// Endpoints de cargadores
app.get('/api/chargers', (req, res) => {
    res.json(chargers);
});

app.post('/api/chargers', (req, res) => {
    const { id, type, status, lat, lon } = req.body;
    if (!id || !type || !status || lat === undefined || lon === undefined) {
        return res.status(400).json({ error: 'Datos incompletos del cargador.' });
    }
    const newCharger = { id, lat, lon, type, status };
    chargers.push(newCharger);
    fs.writeFile(chargersFilePath, JSON.stringify(chargers, null, 2), err => {
        if (err) {
            console.error('Error al escribir chargers.json:', err);
        } else {
            // Notificar a clientes conectados vía WebSocket
            wss.clients.forEach(client => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify({ type: 'chargerUpdate', charger: newCharger }));
                }
            });
        }
    });
    res.status(201).json(newCharger);
});

app.put('/api/chargers/:id', (req, res) => {
    const chargerId = req.params.id;
    const { type, status, lat, lon } = req.body;
    const index = chargers.findIndex(charger => charger.id == chargerId);
    if (index === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }
    chargers[index] = { ...chargers[index], type, status, lat, lon };
    fs.writeFile(chargersFilePath, JSON.stringify(chargers, null, 2), err => {
        if (err) console.error('Error al escribir chargers.json:', err);
    });
    res.json(chargers[index]);
});

app.delete('/api/chargers/:id', (req, res) => {
    const chargerId = req.params.id;
    const index = chargers.findIndex(charger => charger.id == chargerId);
    if (index === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }
    const deletedCharger = chargers.splice(index, 1);
    fs.writeFile(chargersFilePath, JSON.stringify(chargers, null, 2), err => {
        if (err) console.error('Error al escribir chargers.json:', err);
    });
    res.json(deletedCharger[0]);
});

const packageJsonPath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
app.get('/config', (req, res) => {
    res.json({
        admin: packageData.usuariosPredefinidos.find(user => user.rol === 'admin'),
        tecnico: packageData.usuariosPredefinidos.find(user => user.rol === 'tecnico')
    });
});

app.get('/login', (req, res) => {
    res.redirect('/users/user/user.html');
});

app.get('/api/stats', async (req, res) => {
    try {
        await db.read();
        const finishedReservations = db.data.reservations.filter(r => r.finished).length;
        const reservationsByChargerType = { 'Rápido': 0, 'Normal': 0, 'Compatible': 0 };

        db.data.reservations.forEach(reservation => {
            if (reservation.finished) {
                const charger = chargers.find(c => c.id === reservation.chargerId);
                if (charger && reservationsByChargerType[charger.type] !== undefined) {
                    reservationsByChargerType[charger.type]++;
                }
            }
        });

        res.json({
            finishedReservations,
            totalChargers: chargers.length,
            totalUsers: 15,
            reservationsByChargerType
        });
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
});

// Endpoint para obtener los clientes registrados (para admin.js)
const clientsFilePath = path.join(__dirname, 'clients.json');
function loadClients() {
    try {
        if (!fs.existsSync(clientsFilePath)) {
            fs.writeFileSync(clientsFilePath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(clientsFilePath, 'utf-8').trim();
        if (!data) return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`Error al cargar datos de clientes: ${error}`);
        return [];
    }
}
function saveClients(clients) {
    fs.writeFile(clientsFilePath, JSON.stringify(clients, null, 2), err => {
        if (err) console.error('Error al escribir clients.json:', err);
    });
}
app.get('/api/clients', (req, res) => {
    const clients = loadClients();
    res.json({ clients });
});

// Definición global del endpoint para obtener logs (usando clients.json)
app.get('/api/logs', (req, res) => {
    fs.readFile(clientsFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al cargar clients.json:', err);
            return res.status(500).json({ error: 'Error al cargar logs' });
        }
        try {
            const clients = JSON.parse(data);
            res.json({ logs: clients });
        } catch (error) {
            console.error('Error al parsear clients.json:', error);
            res.status(500).json({ error: 'Error al parsear logs' });
        }
    });
});

// Función logAudit para registrar logs de auditoría
function logAudit(message) {
    const logsFilePath = path.join(__dirname, 'logs.txt');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp}: ${message}\n`;
    fs.appendFile(logsFilePath, logEntry, err => {
        if (err) console.error('Error al registrar log:', err);
    });
}

// Rutas comodín
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPublicPath, 'index.html'));
});

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Configuración de WebSocket
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws, req) => {
    console.log('Client connected');

    // Obtener información del cliente (por ejemplo, IP y timestamp)
    const clientIp = req.socket.remoteAddress;
    const clientData = {
        ip: clientIp,
        connectedAt: new Date().toISOString()
    };

    // Cargar clientes existentes, agregar este cliente y guardarlos
    const clients = loadClients();
    clients.push(clientData);
    saveClients(clients);

    // Registrar en logs de auditoría
    logAudit(`Nuevo cliente conectado desde ${clientIp}`);

    ws.on('message', async message => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'reserve') {
                ws.send(JSON.stringify({ type: 'notification', message: 'Tu tiempo de reserva ha comenzado.' }));
                await db.read();
                const reservation = {
                    id: Date.now(),
                    chargerId: data.chargerId,
                    duration: data.duration,
                    date: new Date(),
                    finished: false
                };
                if (!db.data) {
                    db.data = { reservations: [] };
                }
                db.data.reservations.push(reservation);
                await db.write();

                setTimeout(async () => {
                    await db.read();
                    const index = db.data.reservations.findIndex(r => r.id === reservation.id);
                    if (index !== -1) {
                        db.data.reservations[index].finished = true;
                        await db.write();
                    }
                    ws.send(JSON.stringify({ type: 'notification', message: 'Tu tiempo de reserva ha terminado.' }));
                }, data.duration * 60000);
            }
        } catch (err) {
            console.error('Error al procesar el mensaje:', err);
        }
    });
});