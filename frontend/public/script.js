document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('#inicio nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                // Ocultar el contenedor con la imagen y marca
                document.getElementById('marca-menu-container').style.display = 'none';
                // Mostrar el contenido principal
                document.getElementById('contenido-principal').style.display = 'block';

                // Hacer scroll hasta la sección correspondiente
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});