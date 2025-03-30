document.getElementById("admin-login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const username = document.getElementById("admin-username").value.trim();
    const password = document.getElementById("admin-password").value.trim();

    fetch('/config')
        .then(response => response.json())
        .then(config => {
            if (username === config.admin.username && password === config.admin.password) {
                document.getElementById("admin-login-container").classList.add("hidden");
                document.getElementById("admin-container").classList.remove("hidden");
            } else {
                document.getElementById("admin-error-message").classList.remove("hidden");
            }
        })
        .catch(error => console.error("Error al obtener la configuración:", error));
});