Aquí tienes la lista de requisitos funcionales formateada para un documento de Word:

---

**Requisitos Funcionales**

1. **Inicio de Sesión de Usuario**:
  - El usuario debe poder iniciar sesión con su correo electrónico y contraseña.
  - Si las credenciales son incorrectas, se debe mostrar un mensaje de error.

2. **Registro de Usuario**:
  - El usuario debe poder registrarse proporcionando un correo electrónico y una contraseña.
  - Las credenciales deben guardarse en `localStorage`.

3. **Inicio de Sesión de Administrador**:
  - El administrador debe poder iniciar sesión con un nombre de usuario y contraseña predefinidos en `package.json`.
  - Si las credenciales son incorrectas, se debe mostrar un mensaje de error y redirigir a la página principal `index.html`.

4. **Inicio de Sesión de Técnico**:
  - El técnico debe poder iniciar sesión con un nombre de usuario y contraseña.
  - Si las credenciales son incorrectas, se debe mostrar un mensaje de error.

5. **Mapa de Cargadores**:
  - Mostrar un mapa con la ubicación de los cargadores.
  - Permitir al usuario reservar un cargador disponible.

6. **Reserva de Cargadores**:
  - El usuario debe poder reservar un cargador seleccionando el tiempo de reserva.
  - Mostrar un recordatorio cuando la reserva esté a punto de expirar.

7. **Perfil de Usuario**:
  - El usuario debe poder actualizar su perfil con su nombre y correo electrónico.

8. **Configuración de Notificaciones**:
  - El usuario debe poder configurar notificaciones para ser alertado cuando un cargador esté disponible.

9. **Filtrado de Cargadores**:
  - Permitir al usuario filtrar los cargadores por tipo (rápido, estándar, compatible).

10. **Pago de Sesión de Carga**:
  - El usuario debe poder realizar el pago de la sesión de carga proporcionando los detalles de la tarjeta.

11. **Navegación a Cargadores**:
  - Permitir al usuario abrir la ubicación del cargador en una aplicación de navegación.

12. **Historial de Reservas**:
  - Mostrar al usuario un historial de sus reservas anteriores.

13. **Gestión de Usuarios**:
  - Permitir al administrador gestionar usuarios (crear, editar, eliminar).

14. **Gestión de Cargadores**:
  - Permitir al administrador gestionar cargadores (añadir, editar, eliminar).

15. **Soporte Multilenguaje**:
  - Implementar soporte para múltiples idiomas en la aplicación.

16. **Diseño Responsivo**:
  - Asegurarse de que la aplicación sea responsiva y funcione bien en dispositivos móviles.

17. **Seguridad**:
  - Implementar medidas de seguridad como la protección contra ataques XSS y CSRF.

18. **Pruebas Unitarias**:
  - Escribir pruebas unitarias para las funciones críticas de la aplicación.

19. **Documentación**:
  - Proveer documentación detallada sobre cómo configurar y ejecutar el proyecto.

20. **Despliegue en Producción**:
  - Proveer instrucciones detalladas para desplegar la aplicación en un entorno de producción.

21. **Manejo de Errores**:
  - Implementar manejo de errores adecuado para mostrar mensajes claros al usuario en caso de fallos en la aplicación.

22. **Autenticación de Usuarios**:
  - Implementar autenticación de usuarios en el servidor utilizando `express`.

23. **Autenticación de Administradores**:
  - Implementar autenticación de administradores en el servidor utilizando `express`.

24. **Almacenamiento Local**:
  - Utilizar `localStorage` para guardar credenciales de usuario y reservas.

25. **Configuración del Servidor**:
  - Configurar un servidor Express para servir archivos estáticos y manejar autenticación.

---

Puedes copiar y pegar este texto en un documento de Word.
# Encuentra tu Cargador

## Requisitos Funcionales

### ✅ Requisitos funcionales implementados

- **RF-01:** Permitir la localización de cargadores de coches eléctricos cercanos utilizando la geolocalización del dispositivo del usuario.
- **RF-02:** Mostrar en un mapa los cargadores disponibles, indicando nivel de carga y estado (libre, ocupado, en reparación).
- **RF-04:** Ofrecer la opción de consulta de detalles del cargador (tipo, nivel de batería, tiempo estimado de carga, coste).
- **RF-05:** Permitir a los usuarios reservar una plaza de aparcamiento con cargador, con un tiempo límite de reserva.
- **RF-06:** Registrar el historial de reservas y permitir su consulta por parte del usuario.
- **RF-07:** Implementar un sistema de roles (usuario, administrador, técnico) con diferentes permisos y accesos.
- **RF-08:** Integrar notificaciones en tiempo real para actualizar al usuario sobre el estado del cargador durante el proceso de carga.
- **RF-10:** Permitir a los usuarios registrarse y autenticarse en la aplicación.
- **RF-11:** Implementar validación de permisos en cada acción realizada según el rol del usuario.

### 🚀 Requisitos funcionales por implementar

- **RF-03:** Permitir a los usuarios filtrar los cargadores según tipo (rápido, estándar, compatible).
- **RF-09:** Proporcionar la opción de abrir la ubicación del cargador en aplicaciones de navegación.
- **RF-12:** Gestionar cargadores (añadir, eliminar, actualizar) por parte del administrador.
- **RF-13:** Ver estadísticas de uso y rendimiento por parte del administrador.
- **RF-14:** Consultar logs de auditoría por parte del administrador.
- **RF-15:** Actualizar el estado de los cargadores por parte del técnico.
- **RF-16:** Ver detalles técnicos de los cargadores por parte del técnico.
- **RF-17:** Reportar problemas o incidencias por parte del técnico.
- **RF-18:** Integrar un sistema de pago para que los usuarios puedan pagar las sesiones de carga directamente a través de la aplicación.
- **RF-19:** Proporcionar una función para que los usuarios reporten problemas con cargadores específicos y puedan seguir el estado de resolución.
- **RF-20:** Implementar una función para que los usuarios puedan ver y gestionar su historial de pagos y facturas.
- **RF-21:** Permitir a los usuarios agregar cargadores favoritos a una lista para acceso rápido.
- **RF-22:** Habilitar opciones de inicio de sesión social (por ejemplo, Google, Facebook) para facilitar el registro y autenticación de usuarios.
- **RF-23:** Implementar un modo oscuro para la aplicación para mejorar la experiencia del usuario en condiciones de poca luz.
- **RF-24:** Proporcionar una función para que los usuarios comparen diferentes cargadores según varios criterios (por ejemplo, costo, velocidad, distancia).
- **RF-25:** Permitir a los usuarios compartir los detalles de su sesión de carga con amigos o familiares a través de correo electrónico o redes sociales.

## Requisitos No Funcionales


### ✅ Requisitos no funcionales implementados

- **RNF-01:** Responsividad
    - Cumplido parcialmente: El `public/styles.css` contiene algunas reglas básicas de estilo, pero no se observa un diseño completamente responsivo. Se necesitarían media queries y ajustes adicionales para asegurar la adaptabilidad a diferentes dispositivos.
- **RNF-04:** Mensajes de error claros
    - Cumplido parcialmente: Hay algunos mensajes de error en `public/script.js`, pero no todos proporcionan instrucciones claras sobre cómo resolver el problema. Se recomienda mejorar los mensajes de error.
- **RNF-06:** Buenas prácticas de programación
    - Cumplido parcialmente: El código muestra modularidad y legibilidad, pero la documentación es limitada. Se recomienda agregar más comentarios y documentación.
- **RNF-08:** Seguridad
    - Cumplido parcialmente: No se observa la implementación de HTTPS en el código proporcionado. Se recomienda configurar HTTPS y revisar otras medidas de seguridad.
- **RNF-10:** Mantenibilidad
    - Cumplido parcialmente: El código es modular y legible, lo que facilita la mantenibilidad. Sin embargo, se recomienda mejorar la documentación para facilitar futuras actualizaciones.

### 🚀 Requisitos no funcionales por evaluar e implementar

- **RNF-02:** Tiempo de respuesta
    - No evaluado: No se puede determinar el tiempo de respuesta sin pruebas de rendimiento específicas. Se recomienda realizar pruebas de rendimiento para verificar este requisito.
- **RNF-03:** Usabilidad y accesibilidad
    - No cumplido: No se observan indicaciones claras de que se sigan las pautas de accesibilidad WCAG 2.1. Se necesitarían revisiones y ajustes adicionales para cumplir con este requisito.
- **RNF-05:** Notificaciones push
    - No cumplido: No se observa la implementación de notificaciones push en el código proporcionado.
- **RNF-07:** Compatibilidad con navegadores
    - No evaluado: No se puede determinar la compatibilidad sin pruebas específicas en los navegadores mencionados. Se recomienda realizar pruebas de compatibilidad.
- **RNF-09:** Escalabilidad
    - No evaluado: No se puede determinar la escalabilidad sin pruebas específicas. Se recomienda realizar pruebas de carga y escalabilidad.
- **RNF-11:** Testeabilidad
    - No cumplido: No se observan pruebas unitarias o de integración en el código proporcionado. Se recomienda agregar pruebas para asegurar la calidad del código.
- **RNF-12:** Respaldo y recuperación de datos
    - No cumplido: No se observa la implementación de un sistema de respaldo y recuperación de datos en el código proporcionado.
- **RNF-13:** Monitoreo y registro
    - No cumplido: No se observa la implementación de un sistema de monitoreo y registro en el código proporcionado.
- **RNF-14:** Cumplimiento de normativas
    - No evaluado: No se puede determinar el cumplimiento de normativas sin una revisión específica de las políticas y prácticas de manejo de datos. Se recomienda revisar y asegurar el cumplimiento de GDPR y otras regulaciones aplicables.
- **RNF-15:** Tiempos de carga rápidos
    - No evaluado: No se ha optimizado el uso de recursos ni minimizado el tamaño de los archivos estáticos. Se recomienda realizar optimizaciones para mejorar los tiempos de carga.
- **RNF-16:** Interfaz de usuario intuitiva
    - No evaluado: No se ha verificado si la interfaz de usuario es intuitiva y fácil de navegar. Se recomienda realizar pruebas de usabilidad.
- **RNF-17:** Retroalimentación visual inmediata
    - No evaluado: No se ha implementado retroalimentación visual inmediata para las acciones del usuario. Se recomienda agregar esta funcionalidad.
- **RNF-18:** Animaciones suaves y transiciones
    - No evaluado: No se han implementado animaciones suaves y transiciones. Se recomienda agregar esta funcionalidad para mejorar la experiencia visual.
- **RNF-19:** Personalización de la interfaz
    - No evaluado: No se ha implementado la personalización de la interfaz. Se recomienda agregar opciones para cambiar temas de color y fuentes.
- **RNF-20:** Multilingüe
    - No evaluado: No se ha implementado la funcionalidad multilingüe. Se recomienda agregar soporte para múltiples idiomas.
- **RNF-21:** Sistema de ayuda y soporte
    - No evaluado: No se ha implementado un sistema de ayuda y soporte accesible. Se recomienda agregar una sección de preguntas frecuentes y un chat de soporte.
- **RNF-22:** Recordar preferencias del usuario
    - No evaluado: No se ha implementado la funcionalidad para recordar las preferencias del usuario entre sesiones. Se recomienda agregar esta funcionalidad.
- **RNF-23:** Diseño minimalista y limpio
    - No evaluado: No se ha verificado si el diseño es minimalista y limpio. Se recomienda revisar y ajustar el diseño para evitar el desorden visual.
- **RNF-24:** Accesos directos y teclas de acceso rápido
    - No evaluado: No se han implementado accesos directos y teclas de acceso rápido. Se recomienda agregar esta funcionalidad para usuarios avanzados.
- **RNF-25:** Búsqueda rápida y eficiente
    - No evaluado: No se ha implementado una función de búsqueda rápida y eficiente. Se recomienda agregar esta funcionalidad para mejorar la experiencia del usuario.


