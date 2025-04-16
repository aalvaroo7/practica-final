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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let chargers = [
    { id: 1, type: 'Rápido', status: 'Disponible' },
    { id: 2, type: 'Normal', status: 'Ocupado' },
    { id: 3, type: 'Compatible', status: 'En reparación' }
];

app.get('/api/chargers', (req, res) => {
    res.json(chargers);
});

app.post('/api/chargers', (req, res) => {
    const { id, type, status } = req.body;
    if (!id || !type || !status) {
        return res.status(400).json({ error: 'Datos incompletos del cargador.' });
    }
    const newCharger = { id, type, status };
    chargers.push(newCharger);
    res.status(201).json(newCharger);
});

app.put('/api/chargers/:id', (req, res) => {
    const chargerId = Number(req.params.id);
    const { type, status } = req.body;
    const chargerIndex = chargers.findIndex(charger => charger.id === chargerId);
    if (chargerIndex === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }
    chargers[chargerIndex] = { ...chargers[chargerIndex], type, status };
    res.json(chargers[chargerIndex]);
});

app.delete('/api/chargers/:id', (req, res) => {
    const chargerId = Number(req.params.id);
    const index = chargers.findIndex(c => c.id === chargerId);
    if (index === -1) {
        return res.status(404).json({ error: 'Cargador no encontrado.' });
    }
    const deletedCharger = chargers.splice(index, 1);
    res.json(deletedCharger[0]);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPublicPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(staticPublicPath));

const staticUsersPath = path.join(__dirname, '../../frontend/users');
app.use('/users', express.static(staticUsersPath));

const packageJsonPath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/config', (req, res) => {
    res.json({
        admin: packageData.usuariosPredefinidos.find(user => user.rol === 'admin'),
        tecnico: packageData.usuariosPredefinidos.find(user => user.rol === 'tecnico')
    });
});

app.get('/login', (req, res) => {
    res.redirect('/users/user/user.html');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(staticPublicPath, 'index.html'));
});

// Instancia global de lowdb con datos por defecto
const adapter = new JSONFile('db.json');
const db = new Low(adapter, { default: { reservations: [] } });
await db.read();
if (!db.data) {
    db.data = { reservations: [] };
    await db.write();
}

// Endpoint de estadísticas usando la instancia global
app.get('/api/stats', async (req, res) => {
    try {
        await db.read();
        // Contar sólo las reservas que hayan finalizado
        const finishedReservations = db.data.reservations.filter(r => r.finished).length;
        const chargersByType = {
            'Rápido': chargers.filter(c => c.type.toLowerCase() === 'rápido').length,
            'Normal': chargers.filter(c => c.type.toLowerCase() === 'normal').length,
            'Compatible': chargers.filter(c => c.type.toLowerCase() === 'compatible').length
        };
        res.json({
            finishedReservations,
            totalChargers: chargers.length,
            totalUsers: 15,
            chargersByType
        });
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
});

// Endpoint global para obtener los logs de auditoría
app.get('/api/logs', (req, res) => {
    const logsFilePath = path.join(__dirname, 'logs.txt');
    fs.readFile(logsFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de logs:', err);
            return res.status(500).json({ error: 'Error al obtener los logs de auditoría.' });
        }
        // Se separan las líneas para enviar el log como arreglo
        const logs = data.split('\n').filter(line => line.trim() !== '');
        res.json({ logs });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', async message => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'reserve') {
                ws.send(JSON.stringify({ type: 'notification', message: 'Tu tiempo de reserva ha comenzado.' }));
                await db.read();
                // Se crea una reserva con ID único y propiedad finished en false
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

                // Actualiza la reserva cuando finalice el tiempo de reserva
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