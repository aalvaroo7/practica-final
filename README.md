
FALTA POR IMPLEMENTAR:

FALTA HACER QUE CUANDO SE PULSE EL BOTON CON EL USUARIO CORRECTO Y CONTRASEÑA CORRECTA
CON EL TÉCNICO
DISEÑAR LOS METODOS DEL TECNICO QUE ESTAN EN LOS REQUISITOS TECNICOS


INICIAR LA APLICACIÓN:
node server/server.js

LO QUE PASA:
cuando se pulsa el boton de acceder lo que pasa es que intenta redirigir a una pagina que no existe 

### Requisitos Funcionales Cumplidos

1. **RF-01:** Permitir la localización de cargadores de coches eléctricos cercanos utilizando la geolocalización del dispositivo del usuario.
2. **RF-02:** Mostrar en un mapa los cargadores disponibles, indicando nivel de carga y estado (libre, ocupado, en reparación).
3. **RF-03:** Permitir a los usuarios filtrar los cargadores según tipo (rápido, estándar, compatible).
4. **RF-04:** Ofrecer la opción de consulta de detalles del cargador (tipo, nivel de batería, tiempo estimado de carga, coste).
5. **RF-05:** Permitir a los usuarios reservar una plaza de aparcamiento con cargador, con un tiempo límite de reserva.
6. **RF-10:** Permitir a los usuarios registrarse y autenticarse en la aplicación.
7. **RF-23:** Configurar CORS en el servidor para permitir solicitudes desde diferentes orígenes.
8. **RF-24:** Utilizar localStorage para guardar credenciales de usuario y reservas.
9. **RF-25:** Configurar un servidor Express para servir archivos estáticos y manejar autenticación.
10. **RF-30:** Utilizar Leaflet.js para mostrar un mapa con los cargadores disponibles.

### Requisitos Funcionales No Cumplidos

1. **RF-06:** Registrar el historial de reservas y permitir su consulta por parte del usuario.
2. **RF-07:** Implementar un sistema de roles (usuario, administrador, técnico) con diferentes permisos y accesos.
3. **RF-08:** Integrar notificaciones en tiempo real para actualizar al usuario sobre el estado del cargador durante el proceso de carga.
4. **RF-09:** Proporcionar la opción de abrir la ubicación del cargador en aplicaciones de navegación.
5. **RF-11:** Implementar validación de permisos en cada acción realizada según el rol del usuario.
6. **RF-12:** Gestionar cargadores (añadir, eliminar, actualizar) por parte del administrador.
7. **RF-13:** Ver estadísticas de uso y rendimiento por parte del administrador.
8. **RF-14:** Consultar logs de auditoría por parte del administrador.
9. **RF-15:** Actualizar el estado de los cargadores por parte del técnico.
10. **RF-16:** Ver detalles técnicos de los cargadores por parte del técnico.
11. **RF-17:** Reportar problemas o incidencias por parte del técnico.
12. **RF-19:** Proporcionar una función para que los usuarios reporten problemas con cargadores específicos y puedan seguir el estado de resolución.
13. **RF-20:** Implementar una función para que los usuarios puedan ver y gestionar su historial de pagos y facturas.
14. **RF-21:** Permitir a los usuarios agregar cargadores favoritos a una lista para acceso rápido.
15. **RF-22:** Permitir a los usuarios actualizar su perfil con su nombre y correo electrónico.
16. **RF-26:** Permitir a los usuarios calificar y dejar reseñas sobre los cargadores utilizados.
17. **RF-27:** Incluir una opción de reporte de incidencias para informar sobre problemas con un cargador.
18. **RF-28:** Implementar un sistema de favoritos para que los usuarios guarden cargadores frecuentes.
19. **RF-29:** Mostrar estadísticas de uso del usuario (consumo de energía, dinero gastado, tiempo total de carga).
20. **RF-31:** Validar permisos en cada acción realizada según el rol del usuario utilizando middleware en express.
21. **RF-32:** Crear una interfaz de administración para gestionar cargadores (añadir, eliminar, actualizar).
22. **RF-33:** Implementar gráficos y tablas para mostrar estadísticas de uso y rendimiento utilizando Chart.js.
23. **RF-34:** Implementar un diseño responsivo utilizando media queries.
24. **RF-35:** Utilizar JSON para la comunicación entre el cliente y el servidor.
25. **RF-36:** Implementar un sistema de encuestas para evaluar la satisfacción del usuario después de cada carga.
26. **RF-37:** Implementar un sistema de recomendaciones basado en el uso anterior del usuario.
27. **RF-38:** Permitir a los usuarios ver un historial detallado de sus actividades de carga, incluyendo fechas, horas y ubicaciones.
28. **RF-39:** Implementar un sistema de validación para asegurar que el usuario tiene un coche eléctrico compatible con el cargador seleccionado.
29. **RF-40:** Permitir a los administradores configurar horarios de disponibilidad de los cargadores, incluyendo mantenimiento o tiempos de inactividad programados.
30. **RF-41:** Permitir a los usuarios modificar o extender la duración de una reserva antes de que comience, dentro de los límites establecidos por la aplicación.
31. **RF-42:** Permitir a los administradores ajustar los precios de los cargadores según la demanda, horarios pico u otros factores dinámicos.

### Requisitos No Funcionales Cumplidos

1. **RNF-01:** La aplicación debe ser responsiva y adaptarse a diferentes dispositivos (móviles, tablets y desktop).
2. **RNF-06:** El código fuente debe cumplir con buenas prácticas de programación, incluyendo: modularidad, legibilidad, documentación clara y detallada.

### Requisitos No Funcionales No Cumplidos

1. **RNF-02:** El tiempo de respuesta de la aplicación no debe superar los 2 segundos para acciones comunes (búsqueda, reserva).
2. **RNF-03:** El diseño de la interfaz debe seguir buenas prácticas de usabilidad, accesibilidad (WCAG 2.1).
3. **RNF-04:** Todos los mensajes de error deben ser claros, concisos y útiles para el usuario, proporcionando instrucciones sobre cómo resolver el problema.
4. **RNF-05:** Las notificaciones push deben ser enviadas dentro de un margen de tiempo máximo de 5 segundos desde que se generan en el backend.
5. **RNF-07:** La aplicación debe ser compatible con los últimos tres lanzamientos de los principales navegadores web (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).
6. **RNF-08:** El tiempo de carga de la aplicación debe ser inferior a 3 segundos para la mayoría de las interacciones de usuario.