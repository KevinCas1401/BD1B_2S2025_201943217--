Centros de Evaluación de Manejo – Fase 2 (Backend Oracle + API)

## Arquitectura

- **DB:** Oracle XE 21c en Docker (`gvenzl/oracle-xe:21-slim`)
- **API:** Node.js + Express + `oracledb` (conexión por pool)
- **Orquestación:** Docker Compose
- **Herramientas:** Postman (colecciones se agregarán luego), DBeaver (solo para ver estructura)

## Estructura del proyecto
.
├─ docker-compose.yml
├─ db/
│ ├─ init/
│ │ ├─ 00_create_appuser.sql
│ │ ├─ 01_schema.sql
│ │ └─ 02_views_consultas.sql
│ └─ oradata/ # datos persistentes (excluidos del repo)
└─ api/
├─ Dockerfile
├─ package.json
└─ src/
├─ server.js
├─ db.js
└─ routes/
├─ health.js
├─ centros.js
├─ escuelas.js
├─ departamentos.js
├─ municipios.js
├─ ubicaciones.js
├─ registros.js
├─ correlativos.js
├─ examenes.js
├─ preguntas.js
├─ preguntas_practico.js
├─ respuestas_usuario.js
└─ respuestas_practico_usuario.js

## PUESTA EN MARCHA
1) Clonar el repo y entrar a la carpeta del proyecto.  
2) Levantar contenedores (DB + API):
```bash
docker compose up -d --build


## PUESTA EN MARCHA
docker compose ps
oracle-xe → healthy

api-node → Up

Probar la API:
curl http://localhost:3000/health
 -- Respuesta Esperada
{"status":"ok","db":true}.

## GUIA DBEAVER
HOST: localhost
PUERO: 11521 (se utilizo este puerto debido a que ya se estaba utilizando 1521 en oracle en windows.)
Service/SID: XEPDB1
Usuario: APPUSER (Este usuario se creo el cual solo tiene permiso a las tablas de este proyecto.)

### Estado de contenedores
![Contenedores Docker](img/DBEAVER.png)


##ENDPOINT PRINCIPALES
Health: GET /health -- este se utiliza como parte de la prueba del servidor.
![PRINCIPAL](img/DBEAVER.png)

Catálogos: GET/POST/PUT/DELETE /centros, /escuelas, /departamentos, /municipios
![Consultas centros](img/centros.png)
![Consultas registro](img/registro.png)
