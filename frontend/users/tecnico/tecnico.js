document.addEventListener('DOMContentLoaded', () => {
    // Listener de redirección para los botones
    const returnBtn = document.getElementById('return-btn');
    const returnBtn2 = document.getElementById('return-btn2');

    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            window.location.href = '/users/user/user.html';
        });
    }

    if (returnBtn2) {
        returnBtn2.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }

    // Listener para el formulario del técnico
    const tecnicoForm = document.getElementById('tecnico-login-form');
    if (tecnicoForm) {
        tecnicoForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/config');
                const data = await response.json();
                const tecnicoCreds = data.tecnico;

                if (username === tecnicoCreds.username && password === tecnicoCreds.password) {
                    document.getElementById('tecnico-login-container').classList.add('hidden');
                    document.getElementById('tecnico-container').classList.remove('hidden');
                } else {
                    document.getElementById('tecnico-error-message').classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error al obtener credenciales:', error);
            }
        });
    }
});