document.getElementById('tecnico-login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const users = [
        { role: 'tecnico', username: 'tecnico', password: 'tecnico123' },
    ];

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        document.getElementById('tecnico-login-container').classList.add('hidden');
        document.getElementById('tecnico-container').classList.remove('hidden');
    } else {
        document.getElementById('tecnico-error-message').classList.remove('hidden');
    }
});