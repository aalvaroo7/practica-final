document.addEventListener('DOMContentLoaded', async () => {
    const loginBtn = document.getElementById('login-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const volverBtn = document.querySelector('#Volver-btn button');
    // Listener para el botón "Volver al Inicio de Sesión"
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '/users/user/user.html';
        });
    }

    if (volverBtn) {
        volverBtn.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }
    // Listener para el formulario de inicio de sesión de administrador
    adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Se obtienen las credenciales desde el endpoint /config
            const response = await fetch('/config');
            const data = await response.json();
            const adminCreds = data.admin;

            // Comparar credenciales ingresadas con las obtenidas
            if (username === adminCreds.username && password === adminCreds.password) {
                document.getElementById('admin-login-container').classList.add('hidden');
                document.getElementById('admin-container').classList.remove('hidden');
            } else {
                document.getElementById('admin-error-message').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error al obtener credenciales:', error);
        }
    });
});