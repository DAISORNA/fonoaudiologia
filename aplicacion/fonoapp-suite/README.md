FonoApp Suite

FonoApp Suite es una aplicación web integral diseñada para gestionar procesos clínicos y terapéuticos en fonoaudiología.
Permite a profesionales y equipos multidisciplinarios administrar pacientes, sesiones, planes de tratamiento, evaluaciones, tareas y comunicación en tiempo real.

Incluye autenticación con roles (admin, terapeuta, asistente, paciente) y está construida con tecnologías modernas para garantizar seguridad, escalabilidad y una experiencia de usuario fluida.


🚀 -Funcionalidades principales

--Autenticación y roles
    Registro e inicio de sesión con control de accesos según rol asignado.

--Gestión de pacientes
    Crear, actualizar y consultar perfiles clínicos.

--Agenda de citas
    Manejo de calendarios y programación de sesiones.

--Planes de tratamiento y objetivos
    Registrar planes, actualizar progreso y llevar bitácora de sesiones.

--Evaluaciones
    Plantillas de tests y resultados guardados por paciente.

--Asignación de tareas
    Seguimiento de tareas terapéuticas y de apoyo.

--Chat y teleterapia (P2P demo)
    Comunicación en tiempo real entre terapeuta y paciente.

--Gestión de archivos
    Subida y consulta de documentos y recursos multimedia.

--Interfaz moderna
    Frontend en React + Tailwind, servido por Nginx.

🛠️ Tecnologías

--Frontend: React + Vite + TailwindCSS

--Backend: FastAPI (Python)

--Base de datos: PostgreSQL

--Administrador DB: PgAdmin 4

--Servidor estático y proxy: Nginx

--Contenedores: Docker Compose

💻 Lenguajes utilizados

Python → Lógica del backend con FastAPI, manejo de rutas, autenticación y seguridad.

TypeScript / JavaScript (ES6+) → Lógica del frontend en React y control del cliente.

SQL → Consultas y definición de tablas en PostgreSQL.

HTML5 → Estructura del frontend renderizado por React y plantillas básicas.

CSS3 / TailwindCSS → Estilos modernos y diseño responsivo.

YAML → Configuración de servicios en docker-compose.yml.

JSON → Intercambio de datos entre cliente y servidor (API REST).

📦 Instalación y uso
1. Clonar el repositorio
git clone https://github.com/tuusuario/fonoapp-suite.git
cd fonoapp-suite

2. Configurar variables de entorno

Crea un archivo .env en la raíz con el siguiente contenido (ajusta credenciales y secreto):

DATABASE_URL=postgresql+psycopg2://fono:password@db:5432/fonoapp
JWT_SECRET=CAMBIA_ESTE_SECRETO
CORS_ORIGINS=["http://localhost:8081","http://localhost:5173"]

3. Levantar la aplicación
docker compose up --build

4. Servicios disponibles

UI (Frontend) → http://localhost:8081

API (Backend) → http://localhost:8000
 o vía Nginx en /api

PgAdmin → http://localhost:5051

🧪 Pruebas rápidas

Verificar salud de la API:

curl http://localhost:8000/health


Crear un usuario:

curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@demo.com","password":"secret123","role":"therapist"}'

📌 Notas importantes

Cambia JWT_SECRET antes de desplegar en producción.

Los archivos cargados por usuarios se guardan en backend/storage y se sirven desde /media/....

Usa PgAdmin para explorar y administrar la base de datos (fonoapp).