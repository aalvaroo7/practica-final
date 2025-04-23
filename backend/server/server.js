import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fsPromises from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resenasFilePath = path.join(__dirname, 'resenas.json');
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

// Función para inicializar el archivo de reseñas
async function initResenasFile() {
    try {
        await fsPromises.writeFile(resenasFilePath, JSON.stringify([]));
        console.log('Archivo resenas.json inicializado.');
    } catch (error) {
        console.error('Error al inicializar resenas.json:', error);
    }
}

await initClientsFile();
await initLogsFile();
await initResenasFile();

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

// Endpoint para modificar una reserva
app.put('/api/reservations/:id', async (req, res) => {
    const reservationId = req.params.id;
    const { duration } = req.body;  // Duración a modificar
    const currentDate = new Date().toISOString();  // Fecha actual

    if (!duration || isNaN(duration) || duration <= 0) {
        return res.status(400).json({ error: 'Duración inválida.' });
    }

    try {
        await db.read();
        const reservationIndex = db.data.reservations.findIndex(r => r.id === reservationId);

        if (reservationIndex === -1) {
            return res.status(404).json({ error: 'Reserva no encontrada.' });
        }

        const reservation = db.data.reservations[reservationIndex];

        // Verificar si la reserva ya ha comenzado
        if (new Date(reservation.startTime) <= new Date(currentDate)) {
            return res.status(400).json({ error: 'No se puede modificar una reserva que ya ha comenzado.' });
        }

        // Modificar la duración
        reservation.duration = duration;
        reservation.startTime = new Date().toISOString();  // Se puede modificar también la fecha de inicio si es necesario

        await db.write();

        res.json(reservation);
    } catch (error) {
        console.error('Error al modificar la reserva:', error);
        res.status(500).json({ error: 'Error al modificar la reserva.' });
    }
});

// Endpoint para extender una reserva
app.put('/api/reservations/extend/:id', async (req, res) => {
    const reservationId = req.params.id;
    const { extensionDuration } = req.body;  // Duración de extensión en minutos
    const currentDate = new Date().toISOString();

    if (!extensionDuration || isNaN(extensionDuration) || extensionDuration <= 0) {
        return res.status(400).json({ error: 'Duración de extensión inválida.' });
    }

    try {
        await db.read();
        const reservationIndex = db.data.reservations.findIndex(r => r.id === reservationId);

        if (reservationIndex === -1) {
            return res.status(404).json({ error: 'Reserva no encontrada.' });
        }

        const reservation = db.data.reservations[reservationIndex];

        // Verificar si la reserva ya ha comenzado
        if (new Date(reservation.startTime) <= new Date(currentDate)) {
            return res.status(400).json({ error: 'No se puede extender una reserva que ya ha comenzado.' });
        }

        // Extender la duración
        reservation.duration += extensionDuration;  // Aumentamos la duración actual
        await db.write();

        res.json(reservation);
    } catch (error) {
        console.error('Error al extender la reserva:', error);
        res.status(500).json({ error: 'Error al extender la reserva.' });
    }
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

// Endpoint para reportar incidencias
app.post('/api/incidences', (req, res) => {
    const { description } = req.body;
    if (!description) {
        return res.status(400).json({ error: 'La descripción es obligatoria.' });
    }
    const problems = loadProblems(); // loadProblems debe estar definido globalmente
    const newProblem = {
        id: Date.now(),
        description,
        status: 'pendiente',
        reportedAt: new Date().toISOString()
    };
    problems.push(newProblem);
    saveProblems(problems); // saveProblems también debe estar definido globalmente
    res.status(201).json(newProblem);
});

app.get('/api/problems', (req, res) => {
    const problems = loadProblems();
    res.json(problems);
});
// Endpoint para consultar y, si se indican parámetros, para crear una reserva vía GET
app.get('/api/reservations', async (req, res) => {
    try {
        await db.read();
        const { userEmail, chargerId, duration, create } = req.query;

        // Si se indica que se crea y se tienen los parámetros requeridos,
        // se crea la nueva reserva.
        if (create && userEmail && chargerId && duration) {
            const newReservation = {
                id: Date.now(),
                chargerId: Number(chargerId),
                user: userEmail,
                duration: duration,
                date: new Date().toISOString(),
                finished: false
            };
            db.data.reservations.push(newReservation);
            await db.write();
            return res.status(201).json(newReservation);
        }

        // Si se especifica userEmail, se devuelven solo sus reservas.
        if (userEmail) {
            const userReservations = db.data.reservations.filter(r => r.user === userEmail);
            return res.json(userReservations);
        }

        // En otro caso se devuelven todas las reservas.
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

    async function initResenasFile() {
        try {
            await fsPromises.writeFile(resenasFilePath, JSON.stringify([], null, 2));
            console.log('Archivo resenas.json inicializado y vaciado.');
        } catch (error) {
            console.error('Error al inicializar resenas.json:', error);
        }
    }
// Función para cargar reseñas (actualizada para usar fs/promises)
    async function loadResenas() {
        try {
            await fsPromises.access(resenasFilePath);
            const data = await fsPromises.readFile(resenasFilePath, 'utf-8');
            return data.trim() ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al cargar resenas:', error);
            return [];
        }
    }

//  Función para guardar reseñas (actualizada para usar fs/promises)
    async function saveResenas(resenas) {
        try {
            await fsPromises.writeFile(resenasFilePath, JSON.stringify(resenas, null, 2));
            console.log('Reseña guardada correctamente.');
        } catch (error) {
            console.error('Error al guardar resenas:', error);
        }
    }

    app.post('/api/resenas', async (req, res) => {
        const { user, rating, comentario, chargerId } = req.body;
        if (!user || rating === undefined || !comentario) {
            return res.status(400).json({ error: 'Datos incompletos para la reseña.' });
        }
        try {
            const resenas = await loadResenas();
            const nuevaResena = {
                id: Date.now(),
                user,
                rating,
                comentario,
                chargerId: chargerId || null,
                fecha: new Date().toISOString()
            };
            resenas.push(nuevaResena);
            await saveResenas(resenas);
            res.status(201).json(nuevaResena);
        } catch (error) {
            console.error('Error al procesar el POST de reseñas:', error);
            res.status(500).json({ error: 'Error interno al guardar la reseña.' });
        }
    });

    app.get('/api/chargers', (req, res) => {
        const { type } = req.query;
        if (type && type !== 'all') {
            const filtered = chargers.filter(c => c.type.toLowerCase() === type.toLowerCase());
            return res.json(filtered);
        }
        res.json(chargers);
    });
    app.post('/api/incidences', (req, res) => {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'La descripción es obligatoria.' });
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
                    finished: false,
                    user: data.user || null
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

            if (data.type === 'modify-reservation') {
                const { chargerId, newDuration } = data;

                await db.read();
                const reservation = db.data.reservations.find(r => r.chargerId === chargerId && !r.finished);

                if (reservation) {
                    const remainingTime = reservation.date.getTime() + reservation.duration * 60000 - Date.now();

                    if (remainingTime > 0) {
                        reservation.duration = newDuration;
                        await db.write();

                        ws.send(JSON.stringify({ type: 'notification', message: 'Tu reserva ha sido modificada.' }));
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: 'No se puede modificar la reserva porque ya ha terminado.' }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'No se encontró una reserva activa para modificar.' }));
                }
            }
        } catch (err) {
            console.error('Error al procesar el mensaje:', err);
        }
    });

// Definición global para guardar problemas en problemas.json
    function saveProblems(problems) {
        fs.writeFile(problemasFilePath, JSON.stringify(problems, null, 2), err => {
            if (err) {
                console.error('Error al guardar problemas:', err);
            } else {
                console.log('Problemas guardados correctamente.');
            }
        });
    }

// Función para cargar problemas (existente)
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



});
