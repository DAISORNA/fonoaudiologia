# FonoApp Suite (completo)
- Auth con roles, pacientes, agenda, planes/objetivos, sesiones, evaluaciones (plantillas/resultados), tareas, chat y teleterapia P2P (demo).
- Frontend profesional (React + Tailwind), servido por Nginx.
- FastAPI + PostgreSQL + PgAdmin. Subida de archivos a `backend/storage` (expuesto como `/api/media/...`).

## Uso
```bash
docker compose up --build
```
- UI: http://localhost:8081
- API: proxied en `/api`
- PgAdmin: http://localhost:5051

> Cambia `JWT_SECRET` en `docker-compose.yml` para producción.
