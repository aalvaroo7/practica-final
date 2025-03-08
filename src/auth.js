const users = [
    { username: 'user1', password: 'password1', role: 'user' },
    { username: 'admin', password: 'adminpass', role: 'admin' },
    { username: 'tech', password: 'techpass', role: 'tech' }
];

let currentUser = null;

export function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    } else {
        return false;
    }
}

export function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
}

export function getCurrentUser() {
    if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    return currentUser;
}