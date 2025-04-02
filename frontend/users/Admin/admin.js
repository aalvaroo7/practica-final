// File: frontend/users/Admin/admin.js
document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Se obtienen las credenciales desde el endpoint /config
        const response = await fetch('/config');
        const data = await response.json();
        const adminCreds = data.admin;

        // Se comparan las credenciales ingresadas con las obtenidas
        if (username === adminCreds.username && password === adminCreds.password) {
            // Oculta el contenedor de login y muestra el panel de administración
            document.getElementById('admin-login-container').classList.add('hidden');
            document.getElementById('admin-container').classList.remove('hidden');
        } else {
            // Muestra el mensaje de error en caso de credenciales incorrectas
            document.getElementById('admin-error-message').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al obtener credenciales:', error);
    }
});