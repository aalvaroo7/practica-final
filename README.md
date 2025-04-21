INICIAR LA APLICACIÓN:
node server/server.js

# ✅ Clasificación de Requisitos por Tipo de Usuario

---

## 🧑‍💼 Usuario

### ✅ Requisitos Funcionales Cumplidos
- **RF-01:** Localización de cargadores cercanos usando geolocalización.
- **RF-02:** Mostrar cargadores en el mapa con estado y nivel de carga.
- **RF-03:** Filtros por tipo de cargador.
- **RF-04:** Ver detalles del cargador.
- **RF-05:** Reservar plaza con límite de tiempo.
- **RF-10:** Registro y autenticación.
- **RF-24:** Guardar credenciales y reservas en localStorage.
- **RF-30:** Visualizar mapa con Leaflet.js.
- **RF-08:** Notificaciones en tiempo real sobre estado del cargador.
- **RF-09:** Abrir ubicación del cargador en apps de navegación.
- **RF-22:** Editar perfil (nombre y correo).
- 
### ❌ Requisitos Funcionales No Cumplidos
- **RF-06:** Consultar historial de reservas.
- **RF-19:** Reportar problemas y ver estado de resolución.
- **RF-20:** Ver y gestionar historial de pagos/facturas.
- **RF-21:** Agregar cargadores favoritos.
- **RF-26:** Calificar y dejar reseñas.
- **RF-27:** Reportar incidencias.
- **RF-28:** Guardar cargadores frecuentes como favoritos.
- **RF-29:** Ver estadísticas de uso personal.
- **RF-36:** Encuestas de satisfacción.
- **RF-37:** Recomendaciones basadas en uso anterior.
- **RF-38:** Historial detallado de actividades de carga.
- **RF-39:** Validar compatibilidad entre coche y cargador.
- **RF-41:** Modificar/extender reservas antes de que comiencen.


## 👨‍💼 Administrador

### ✅ Requisitos Funcionales Cumplidos
- **RF-23:** Configurar CORS para orígenes cruzados.
- **RF-25:** Servidor Express para estáticos y autenticación.
- **RF-07:** Sistema de roles.
- **RF-11:** Validación de permisos según rol.
- **RF-12:** Gestión de cargadores (CRUD).
- **RF-31:** Middleware de validación de permisos según rol. esto se cumple en este repositorio****
- **RF-32:** Interfaz de administración para gestionar cargadores.
- **RF-14:** Consultar logs de auditoría.
- 
### ❌ Requisitos Funcionales No Cumplidos
- **RF-13:** Ver estadísticas de uso/rendimiento.
- **RF-33:** Gráficos/estadísticas con Chart.js.
- **RF-40:** Configurar horarios de disponibilidad.
- - **RF-42:** Ajustar precios según demanda/horarios pico.

---
#Para cumplir con los rf del admin
para las estadisticas hay que hacer que compare los usos de los cargadores cogiendo las reservas desde el json de reservas 

ESO es lo unico asi que se como hacer 100% el resto de RF no se 
## 👷 Técnico

### ❌ Requisitos Funcionales No Cumplidos
- **RF-15:** Actualizar estado de cargadores.
- **RF-16:** Ver detalles técnicos de los cargadores.
- **RF-17:** Reportar problemas/incidencias.

Para el RF 15 tiene que actualizar el estado en el chargers.json
añadir en el chargers.json un apartado para cada cargador de detalles tecnicos 

---

## ⚙️ Requisitos No Funcionales

### ✅ Cumplidos (Generales)
- **RNF-01:** Aplicación responsiva.
- **RNF-06:** Buenas prácticas de código (modularidad, legibilidad, documentación).
- **RNF-02:** Tiempo de respuesta ≤ 2 segundos.
- **RNF-03:** Usabilidad y accesibilidad (WCAG 2.1).
- **RNF-04:** Mensajes de error claros y útiles.
- **RNF-05:** Push notifications ≤ 5 segundos.
- **RNF-08:** Tiempo de carga < 3 segundos.


### ❌ No Cumplidos (Generales)

- **RNF-07:** Compatibilidad con últimos 3 navegadores principales.
