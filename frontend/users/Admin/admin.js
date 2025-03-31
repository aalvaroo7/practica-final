document.getElementById('admin-login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const users = [
        { role: 'admin', username: 'admin', password: 'admin123' },
    ];

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        document.getElementById('admin-login-container').classList.add('hidden');
        document.getElementById('admin-container').classList.remove('hidden');
    } else {
        document.getElementById('admin-error-message').classList.remove('hidden');

    }
});