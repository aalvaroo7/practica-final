import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de rutas estáticas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Cargar usuarios desde package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const users = packageData.users;

// Función para validar credenciales
function authenticateUser(username, password) {
    return users.find(user => user.username === username && user.password === password);
}

// Ruta de autenticación
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = authenticateUser(username, password);

    if (user) {
        const redirectPage = user.role === 'admin' ? '/Admin/admin.html' : '/dashboard.html';
        res.status(200).json({ success: true, redirect: redirectPage });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
});

// Ruta de autenticación de administrador (opcional, pero ya cubierta en `/login`)
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    const admin = users.find(user => user.role === 'admin' && user.username === username && user.password === password);

    if (admin) {
        res.status(200).json({ success: true, redirect: '/Admin/admin.html' });
    } else {
        res.status(401).json({ success: false, message: 'Acceso denegado' });
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
