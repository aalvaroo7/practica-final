
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#inicio nav ul li a');
    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('click', () => {
        // Redirecciona haciendo una solicitud al endpoint /login
        window.location.href = '/login';
    });
});