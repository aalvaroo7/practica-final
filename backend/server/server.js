import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const problemasFilePath = path.join(__dirname, 'problemas.json');
const chargersFilePath = path.join(__dirname, 'chargers.json');
const staticPublicPath = path.join(__dirname, '../../frontend/public');
const staticUsersPath = path.join(__dirname, '../../frontend/users');
const staticFrontendPath = path.join(__dirname, '..', 'frontend');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost:3000') || /https:\/\/.*\.ngrok\-free\.app/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));

// Rutas de archivos estáticos
app.use(express.static(staticPublicPath));
app.use('/users', express.static(staticUsersPath));
app.use(express.static(staticFrontendPath));

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

// Configuración de la base de datos lowdb
const adapter = new JSONFile(path.join(__dirname, 'reservas.json'));
const db = new Low(adapter, { default: { reservations: [] } });
async function initLowDb() {
    // Sobrescribir el archivo con un objeto vacío
    db.data = { reservations: [] };
    await db.write();

    await db.read();
    if (!db.data) {
        db.data = { reservations: [] };
        await db.write();
    }
}
await initLowDb();

// Funciones para inicializar archivos de clientes y logs
async function initClientsFile() {
    const clientsFilePath = path.join(__dirname, 'clients.json');
    try {
        fs.writeFileSync(clientsFilePath, JSON.stringify([]));
        console.log('Archivo clients.json inicializado.');
    } catch (error) {
        console.error('Error al inicializar clients.json:', error);
    }
}

async function initLogsFile() {
    const logsFilePath = path.join(__dirname, 'logs.txt');
    try {
        fs.writeFileSync(logsFilePath, '');
        console.log('Archivo logs.txt inicializado.');
    } catch (error) {
        console.error('Error al inicializar logs.txt:', error);
    }
}

await initClientsFile();
await initLogsFile();

// Endpoint para obtener cargadores
app.get('/api/chargers', (req, res) => {
    res.json(chargers);
});

// Endpoint para agregar un nuevo cargador (con disponibilidad obligatoria)
app.post('/api/chargers', (req, res) => {
    const { id, type, status, lat, lon, price, availability } = req.body;
    if (!id || !type || !status || lat === undefined || lon === undefined || price === undefined ||
        !availability || !availability.start || !availability.end) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos del cargador.' });
    }
    const newCharger = { id, lat, lon, type, status, price, availability };
    chargers.push(newCharger);
    fs.writeFile(chargersFilePath, JSON.stringify(chargers, null, 2), err => {
        if (err) {
            console.error('Error al escribir chargers.json:', err);
            return res.status(500).json({ error: 'Error al guardar el cargador.' });
        } else {
            // Notificar a clientes conectados vía WebSocket
            wss.clients.forEach(client => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify({ type: 'chargerUpdate', charger: newCharger }));
                }
            });
            res.status(201).json(newCharger);
        }
    });
});

// Endpoint para eliminar un cargador
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

// Endpoint para obtener configuraciones de usuarios predefinidos
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

// Endpoint para obtener estadísticas
app.get('/api/stats', async (req, res) => {
    try {
        await db.read();
        const finishedReservations = db.data.reservations.filter(r => r.finished).length;

        const reservationsByChargerType = chargers.reduce((acc, charger) => {
            acc[charger.type] = acc[charger.type] || 0;
            db.data.reservations.forEach(reservation => {
                if (reservation.chargerId === charger.id && reservation.finished) {
                    acc[charger.type]++;
                }
            });
            return acc;
        }, {});

        const usagePercentage = chargers.map(charger => {
            const totalReservations = db.data.reservations.filter(r => r.chargerId === charger.id).length;
            return {
                id: charger.id,
                type: charger.type,
                usage: ((totalReservations / finishedReservations) * 100).toFixed(2) + '%'
            };
        });

        res.json({
            finishedReservations,
            reservationsByChargerType,
            usagePercentage
        });
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
});

// Endpoint para actualizar un cargador
app.put('/api/chargers/:id', (req, res) => {
    const chargerId = req.params.id;
    const { type, status, availability, price } = req.body;

    if (!type || !status || !availability || !availability.start || !availability.end || price === undefined) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos.' });
    }

    const chargerIndex = chargers.findIndex(charger => charger.id == chargerId);
    if (chargerIndex === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }

    chargers[chargerIndex] = {
        ...chargers[chargerIndex],
        type,
        status,
        availability,
        price
    };

    fs.writeFile(chargersFilePath, JSON.stringify(chargers, null, 2), err => {
        if (err) {
            console.error('Error al guardar chargers.json:', err);
            return res.status(500).json({ error: 'Error al guardar los datos.' });
        }
        res.json(chargers[chargerIndex]);
    });
});

// Funciones para manejar clientes
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

// Endpoint para obtener logs de auditoría (usando clients.json)
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

// Funciones para problemas
function loadProblems() {
    try {
        if (!fs.existsSync(problemasFilePath)) {
            fs.writeFileSync(problemasFilePath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(problemasFilePath, 'utf-8');
        return data.trim() ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al cargar problemas:', error);
        return [];
    }
}
function saveProblems(problems) {
    fs.writeFile(problemasFilePath, JSON.stringify(problems, null, 2), err => {
        if (err) console.error('Error al guardar problemas:', err);
    });
}

// Endpoints para problemas
app.post('/api/problems', (req, res) => {
    const { description } = req.body;
    if (!description) {
        return res.status(400).json({ error: 'La descripción del problema es obligatoria.' });
    }
    const problems = loadProblems();
    const newProblem = {
        id: Date.now(),
        description,
        status: 'pendiente',
        reportedAt: new Date().toISOString()
    };
    problems.push(newProblem);
    saveProblems(problems);
    res.status(201).json(newProblem);
});

app.get('/api/problems', (req, res) => {
    const problems = loadProblems();
    res.json(problems);
});

// Endpoint para obtener reservas
app.get('/api/reservations', async (req, res) => {
    try {
        await db.read();
        res.json(db.data.reservations || []);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
});

// Función para registrar logs de auditoría
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

// Arranque del servidor HTTP
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Configuración de WebSocket
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws, req) => {
    console.log('Client connected');
    const clientIp = req.socket.remoteAddress;
    const clientData = {
        ip: clientIp,
        connectedAt: new Date().toISOString()
    };

    const clients = loadClients();
    clients.push(clientData);
    saveClients(clients);

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