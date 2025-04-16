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

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Variables para rutas y datos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chargersFilePath = path.join(__dirname, 'chargers.json');
let chargers = [];

// Función para cargar los cargadores !!!!!!!!!Esta mal hay que corregirla para que coja los cargadores de chargers.json
function loadChargers() {
    try {
        const chargersData = fs.readFileSync(chargersFilePath, 'utf-8');
        const parsed = JSON.parse(chargersData);
        chargers = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error al cargar datos de cargadores:', error);
        chargers = [];
    }
}

loadChargers();

// Configuración de rutas de archivos estáticos
const staticPublicPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(staticPublicPath));

const staticUsersPath = path.join(__dirname, '../../frontend/users');
app.use('/users', express.static(staticUsersPath));

app.use(express.static(path.join(__dirname, '..', 'frontend')));

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
await initLowDb(); // Se inicializa la DB antes de arrancar el servidor

// Endpoint para obtener cargadores
app.get('/api/chargers', (req, res) => {
    fs.readFile(chargersFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al leer chargers.json:', err);
            return res.status(500).json({ error: 'Error al leer chargers.json' });
        }
        try {
            const chargers = JSON.parse(data);
            res.json(chargers);
        } catch (parseError) {
            console.error('Error al parsear chargers.json:', parseError);
            res.status(500).json({ error: 'Error al parsear chargers.json' });
        }
    });
});

// Endpoint para crear un cargador en el sistema
app.post('/api/chargers', (req, res) => {
    const { id, type, status, lat, lon } = req.body;
    if (!id || !type || !status || lat === undefined || lon === undefined) {
        return res.status(400).json({ error: 'Datos incompletos del cargador.' });
    }
    const newCharger = { id, type, status, lat, lon };
    chargers.push(newCharger);
    fs.writeFile(chargersFilePath, JSON.stringify(chargers, null, 2), err => {
        if (err) {
            console.error('Error al escribir chargers.json:', err);
        } else {
            // Enviar notificación a clientes conectados
            wss.clients.forEach(client => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify({ type: 'chargerUpdate', charger: newCharger }));
                }
            });
        }
    });
    res.status(201).json(newCharger);
});

// Endpoint para modificar un cargador
app.put('/api/chargers/:id', (req, res) => {
    const chargerId = req.params.id;
    const { type, status, lat, lon } = req.body;
    const chargerIndex = chargers.findIndex(charger => charger.id === chargerId);
    if (chargerIndex === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }
    chargers[chargerIndex] = { ...chargers[chargerIndex], type, status, lat, lon };
    fs.writeFile(chargersFilePath, JSON.stringify(chargers, null, 2), err => {
        if (err) console.error('Error al escribir chargers.json:', err);
    });
    res.json(chargers[chargerIndex]);
});

// Endpoint para eliminar un cargador
app.delete('/api/chargers/:id', (req, res) => {
    const chargerId = req.params.id;
    const index = chargers.findIndex(c => c.id === chargerId);
    if (index === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }
    const deletedCharger = chargers.splice(index, 1);
    fs.writeFile(chargersFilePath, JSON.stringify(chargers, null, 2), err => {
        if (err) console.error('Error al escribir chargers.json:', err);
    });
    res.json(deletedCharger[0]);
});

// Endpoint de configuración para obtener usuarios predefinidos
const packageJsonPath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
app.get('/config', (req, res) => {
    res.json({
        admin: packageData.usuariosPredefinidos.find(user => user.rol === 'admin'),
        tecnico: packageData.usuariosPredefinidos.find(user => user.rol === 'tecnico')
    });
});

// Redireccionamiento para login
app.get('/login', (req, res) => {
    res.redirect('/users/user/user.html');
});

// Endpoint de estadísticas usando lowdb
app.get('/api/stats', async (req, res) => {
    try {
        await db.read();
        const finishedReservations = db.data.reservations.filter(r => r.finished).length;
        const reservationsByChargerType = {
            'Rápido': 0,
            'Normal': 0,
            'Compatible': 0
        };

        db.data.reservations.forEach(reservation => {
            if (reservation.finished) {
                const charger = chargers.find(c => c.id === reservation.chargerId);
                if (charger && reservationsByChargerType[charger.type] !== undefined) {
                    reservationsByChargerType[charger.type]++;
                }
            }
        });

        res.json({
            finishedReservations: finishedReservations,
            totalChargers: chargers.length,
            totalUsers: 15,
            reservationsByChargerType
        });
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
});

// Endpoint para obtener logs de auditoría
app.get('/api/logs', (req, res) => {
    const logsFilePath = path.join(__dirname, 'logs.txt');
    fs.readFile(logsFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de logs:', err);
            return res.status(500).json({ error: 'Error al obtener los logs de auditoría.' });
        }
        const logs = data.split('\n').filter(line => line.trim() !== '');
        res.json({ logs });
    });
});

// Ruta comodín para requests restantes
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPublicPath, 'index.html'));
});

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Configuración de WebSocket
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', ws => {
    console.log('Client connected');

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
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const logsFilePath = path.join(__dirname, 'logs.txt');

// Si el archivo no existe, créalo vacío
    if (!fs.existsSync(logsFilePath)) {
        fs.writeFileSync(logsFilePath, '', 'utf-8');
    }
});