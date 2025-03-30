import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Configuración de rutas estáticas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Cargar usuarios desde package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const users = packageData.users;

// Ruta para obtener credenciales preestablecidas
app.get('/config', (req, res) => {
    res.json({
        admin: packageData.admin,
        tecnico: packageData.tecnico
    });
});

// Función para validar credenciales
function authenticateUser(username, password) {
    return users.find(user => user.username === username && user.password === password);
}

// Ruta de autenticación
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = authenticateUser(username, password);

    if (user) {
        const redirectPage = user.role === 'admin' ? '/Admin/admin.html' : (user.role === 'tecnico' ? '/tecnico/tecnico.html' : '/dashboard.html');
        res.status(200).json({ success: true, redirect: redirectPage });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales incorrectas', redirect: '/index.html' });
    }
});

// Ruta de autenticación para administrador
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    const user = authenticateUser(username, password);

    if (user && user.role === 'admin') {
        res.status(200).json({ success: true, redirect: '/Admin/admin.html' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales incorrectas', redirect: '/index.html' });
    }
});

// Ruta de autenticación para técnico
app.post('/tecnico-login', (req, res) => {
    const { username, password } = req.body;
    const user = authenticateUser(username, password);

    if (user && user.role === 'tecnico') {
        res.status(200).json({ success: true, redirect: '/tecnico/tecnico.html' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales incorrectas', redirect: '/index.html' });
    }
});

// Manejar todas las demás rutas sirviendo index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
