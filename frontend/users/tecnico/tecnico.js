// File: frontend/users/tecnico/tecnico.js
document.getElementById('tecnico-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Se obtienen las credenciales desde el endpoint /config
        const response = await fetch('/config');
        const data = await response.json();
        const tecnicoCreds = data.tecnico;

        // Se comparan las credenciales ingresadas con las obtenidas
        if (username === tecnicoCreds.username && password === tecnicoCreds.password) {
            // Remueve la clase `hidden` de todos los elementos
            document.querySelectorAll('.hidden').forEach(el => {
                el.classList.remove('hidden');
            });
        } else {
            // Muestra el mensaje de error en caso de credenciales incorrectas
            document.getElementById('tecnico-error-message').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al obtener credenciales:', error);
    }
});