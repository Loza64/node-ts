# Documentación Técnica — Node-TS Backend Template

Backend base en **Node.js + TypeScript + Express**, organizado con **Clean Architecture /
Arquitectura Hexagonal (Ports & Adapters)**. Pensado como plantilla de arranque: sin base de
datos real conectada (usa un repositorio en memoria como placeholder) y con Docker, Jest e
imports absolutos ya configurados.

---

## 1. Stack técnico

| Categoría          | Tecnología                                   |
|---------------------|-----------------------------------------------|
| Runtime             | Node.js 22 (Alpine en Docker)                 |
| Lenguaje            | TypeScript 5.9                                |
| Framework HTTP      | Express 5                                     |
| Tiempo real         | Socket.IO 4.8                                 |
| Validación          | class-validator + class-transformer           |
| Seguridad HTTP      | Helmet, CORS                                  |
| Logging             | morgan (HTTP) + debug (interno)               |
| Subida de archivos  | Multer (memoria)                              |
| Hashing             | bcryptjs                                      |
| Testing             | Jest + ts-jest + Supertest                    |
| Lint                | ESLint (flat config) + typescript-eslint      |
| Gestor de paquetes  | pnpm (workspace)                              |
| Contenedor          | Docker multi-stage                            |
| Dev runner          | ts-node-dev + tsconfig-paths                  |
| Build               | tsc + tsc-alias (resuelve imports absolutos)  |

---

## 2. Arquitectura: 3 capas por módulo

```
src/modules/<modulo>/
├── domain/           # Entidades + interfaces (puertos). No conoce express/socket.io/db.
├── application/      # Casos de uso (Use Cases). Orquesta el dominio. No sabe de HTTP.
└── infrastructure/    # Adaptadores concretos: controllers HTTP, rutas, persistencia, websockets.
    ├── http/
    └── persistence/ (o websocket/)
```

**Regla de dependencia**: `infrastructure` → depende de → `application` → depende de →
`domain`. Nunca al revés. El dominio no sabe que existe Express, Socket.IO ni ningún ORM.

### Por qué así y no carpetas por tipo de archivo

En vez de agrupar por verbo HTTP (`get.route.ts`, `post.route.ts`...) que mezcla infraestructura
con features, cada **módulo es autocontenido** (`user`, `file-upload`, `notification`,
`product`, `health`) y las rutas quedan organizadas por **recurso**:

```http
GET    /api/health/hello
POST   /api/users
POST   /api/files/upload
GET    /api/notifications/notify
PATCH  /api/products/:id
```

### Use Cases

Cada acción de negocio es una clase con un único método público `execute()`, con nombre de
negocio (`CreateUserUseCase`, `NotifyAllUseCase`). No reciben `req`/`res`: reciben datos ya
parseados y dependen de **interfaces (puertos)**, nunca de implementaciones concretas. Esto
permite testear toda la lógica de negocio sin levantar Express ni una base de datos real.

### Ports & Adapters

- **Puerto** = interfaz definida en `domain/` (ej. `UserRepository`, `NotificationPublisher`).
- **Adaptador** = implementación concreta en `infrastructure/` (ej. `InMemoryUserRepository`,
  `SocketNotificationPublisher`).

Hoy `UserRepository` está implementado en memoria (`InMemoryUserRepository`) como placeholder.
El día que conectes una base de datos real, creás `TypeOrmUserRepository implements
UserRepository` (o Mongoose, Prisma, etc.) y cambiás **una sola línea** en
`composition-root.ts`. Ni el use case ni el controller se enteran del cambio.

### Composition Root

`src/composition-root.ts` es el único archivo que conoce simultáneamente las interfaces y sus
implementaciones concretas: aquí se instancian los repositorios/adaptadores y se inyectan "a
mano" (constructor injection) en los use cases y controllers, sin framework de DI — igual que
lo haría cualquier proyecto Express serio.

`src/app.ts` arma el `container` (llamando a `buildContainer()`) y monta las rutas de cada
módulo bajo el prefijo `/api`.

---

## 3. Estructura de carpetas completa

```
src/
├── @types/
│   └── express/index.d.ts          # Extiende Request con `files?`
├── app.ts                          # Crea y configura la app Express (createApp)
├── app.spec.ts                     # Test de integración con supertest
├── composition-root.ts             # DI manual: instancia repos/use cases/controllers
├── index.ts                        # Entry point: crea httpServer, monta sockets, escucha PORT
├── interfaces/
│   └── http/routes.ts              # Router raíz /api, monta cada módulo
├── modules/
│   ├── health/
│   │   └── infrastructure/http/health.routes.ts
│   ├── user/
│   │   ├── domain/
│   │   │   ├── user.entity.ts
│   │   │   └── user.repository.ts       # Puerto (interfaz)
│   │   ├── application/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── create-user.use-case.ts
│   │   │   └── create-user.use-case.spec.ts
│   │   └── infrastructure/
│   │       ├── http/user.controller.ts (+.spec.ts) / user.routes.ts
│   │       └── persistence/in-memory-user.repository.ts   # Adaptador
│   ├── file-upload/
│   │   ├── application/upload-files.use-case.ts
│   │   └── infrastructure/http/file.controller.ts / file.routes.ts
│   ├── notification/
│   │   ├── application/notify-all.use-case.ts
│   │   └── infrastructure/http/notification.controller.ts / notification.routes.ts
│   └── product/
│       ├── application/notify-product-updated.use-case.ts
│       └── infrastructure/http/product.controller.ts / product.routes.ts
└── shared/
    ├── config/
    │   ├── env.ts                  # Variables de entorno tipadas
    │   └── express.config.ts       # CORS, límites de JSON/urlencoded, multer
    ├── errors/AppError.ts          # Error operacional con statusCode
    ├── logger/logger.ts            # Namespaces de `debug`
    ├── middlewares/
    │   ├── error-handler.middleware.ts
    │   ├── upload-file.middleware.ts
    │   └── validate-dto.middleware.ts
    ├── realtime/
    │   ├── notification-publisher.port.ts     # Puerto
    │   └── websocket/
    │       ├── socket.gateway.ts               # Server socket.io real
    │       ├── socket.types.ts                 # Tipado de eventos
    │       └── socket-notification.publisher.ts # Adaptador del puerto
    └── utils/bcrypt.util.ts        # hash / compare de contraseñas
```

---

## 4. Flujo de arranque (`index.ts` → `app.ts`)

1. `index.ts` crea un servidor HTTP nativo con `http.createServer(app)` (no usa `app.listen`
   directo) para poder **compartir el mismo puerto entre Express y Socket.IO**.
2. `initSocket(httpServer)` monta socket.io sobre ese servidor.
3. `httpServer.listen(env.PORT, ...)` levanta todo junto.
4. `app.ts` (`createApp`):
   - Registra `reflect-metadata` (requerido por `class-validator`/`class-transformer`).
   - `buildContainer()` instancia todos los repos/use cases/controllers (DI manual).
   - Middlewares globales, en orden: `helmet()` → `cors()` → `express.json()` →
     `express.urlencoded()` → `morgan('dev')`.
   - Monta el router de la API bajo `/api`.
   - `errorHandler` al final, como manejador de errores centralizado.

---

## 5. Endpoints disponibles

| Método | Ruta                     | Descripción                                              |
|--------|--------------------------|-----------------------------------------------------------|
| GET    | `/api/health/hello`      | Health check simple                                       |
| POST   | `/api/users`              | Crea un usuario (valida DTO, hashea password, evita duplicados por email) |
| POST   | `/api/files/upload`       | Sube uno o varios archivos (multipart/form-data)          |
| GET    | `/api/notifications/notify` | Dispara un `broadcast()` por socket a todos los conectados |
| PATCH  | `/api/products/:id`       | Actualiza un producto de ejemplo y emite por socket a la sala `product:<id>` |

### Ejemplo: crear usuario

```http
POST /api/users
Content-Type: application/json

{
  "name": "Loza",
  "email": "loza@example.com",
  "password": "12345678"
}
```

Validaciones (`CreateUserDto`): `name` (string, 2-60 chars), `email` (formato válido),
`password` (string, mínimo 8 chars). Si sobra un campo no declarado en el DTO, `class-validator`
lo rechaza (`forbidNonWhitelisted: true`).

Respuesta 201:
```json
{ "message": "User created", "data": { "id": "...", "name": "Loza", "email": "loza@example.com", "createdAt": "..." } }
```

`passwordHash` nunca se serializa (el `toPublic()` de la entidad lo excluye a propósito).

---

## 6. Validación de DTOs

`shared/middlewares/validate-dto.middleware.ts` expone `validateDTO(DtoClass)`:

1. Convierte el `req.body` plano a instancia de la clase con `plainToInstance`.
2. Corre `class-validator` con `whitelist: true, forbidNonWhitelisted: true` (rechaza props
   extra no declaradas en el DTO).
3. Si hay errores, responde `400` con los mensajes concatenados.
4. Si pasa, reemplaza `req.body` por el DTO ya validado/tipado y sigue con `next()`.

Se usa como middleware de ruta: `router.post('/', validateDTO(CreateUserDto), controller.create)`.

---

## 7. Manejo de errores

- `AppError` (`shared/errors/AppError.ts`): error "operacional" con `statusCode` propio,
  hereda de `Error`, mantiene el stack trace real (`Error.captureStackTrace`).
- Cualquier use case puede lanzar `throw new AppError('mensaje', 409)`.
- `errorHandler` (middleware final en `app.ts`) intercepta todo:
  - Si es `AppError` → responde con su `statusCode` y mensaje tal cual.
  - Si es un error inesperado → responde `500`. El mensaje real solo se expone si
    `NODE_ENV=development` (`env.isDev`); en producción se oculta el detalle.

Formato de error estándar:
```json
{ "status": 401, "message": "Error message" }
```

---

## 8. Subida de archivos

`shared/middlewares/upload-file.middleware.ts`:

- Usa `multer` con `memoryStorage()` (no escribe a disco, los archivos quedan en buffer).
- Límite configurable en `shared/config/express.config.ts` → `multerConfig.fileSizeLimitMB`
  (10 MB por defecto).
- Solo procesa la request si el `Content-Type` incluye `multipart/form-data`; si no, hace
  `next()` y sigue de largo.
- Normaliza `req.files` sea cual sea la forma en que Multer los entregue (`.any()`, un solo
  `req.file`, o un objeto agrupado por campo) para que el controller siempre reciba un array
  plano `Express.Multer.File[]`.
- `UploadFilesUseCase` solo devuelve un resumen: nombre, tamaño y mimetype de cada archivo. No
  hay persistencia real todavía (sería el siguiente paso: subir a Cloudinary/S3 desde un
  adaptador nuevo).

---

## 9. Tiempo real (Socket.IO)

### Arquitectura

Sigue el mismo patrón de puertos y adaptadores que el resto de la app:

- **Puerto**: `NotificationPublisher` (`shared/realtime/notification-publisher.port.ts`) define
  `broadcast(message)` y `emitToRoom(room, message)`.
- **Adaptador**: `SocketNotificationPublisher` implementa el puerto usando el gateway real de
  socket.io.
- Los use cases (`NotifyAllUseCase`, `NotifyProductUpdatedUseCase`) solo conocen el puerto, no
  importan `socket.io` directamente. Esto permite testear esos use cases con un mock del puerto,
  sin levantar sockets reales.

### Gateway (`socket.gateway.ts`)

- `initSocket(httpServer)` crea el `Server` de socket.io usando la misma config de CORS que
  Express (`corsConfig`), y queda montado sobre el servidor HTTP nativo.
- `getSocketIO()` expone la instancia ya inicializada (lanza error si se llama antes de
  `initSocket`).
- Maneja los eventos de sala: `join`, `leave`, `event`, y loguea conexión /
  desconexión / errores con `socketLog`.

### Eventos tipados (`socket.types.ts`)

| Dirección          | Evento          | Payload                                              |
|---------------------|-----------------|-------------------------------------------------------|
| Cliente → Servidor   | `join`      | `room: string, callback?: (ok: boolean) => void`      |
| Cliente → Servidor   | `leave`     | `room: string, callback?: (ok: boolean) => void`      |
| Cliente → Servidor   | `event`   | `{ room, message }`                                   |
| Servidor → Cliente   | `user_joined`    | `{ socketId, room }`                                  |
| Servidor → Cliente   | `user_left`      | `{ socketId, room }`                                  |
| Servidor → Cliente   | `event`   | `{ from, room, message }`                             |
| Servidor → Cliente   | `notification`   | `{ message }`                                          |

### Ejemplo cliente

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

socket.emit('join', 'product:123', (ok) => console.log('joined?', ok));
socket.on('event', (payload) => console.log(payload));
socket.on('notification', (payload) => console.log(payload.message));
socket.emit('event', { room: 'product:123', message: 'hola' });
socket.emit('leave', 'product:123');
```

### Cómo emitir desde un use case nuevo

```ts
import { NotificationPublisher } from '../../../shared/realtime/notification-publisher.port';

export class MiUseCase {
  constructor(private readonly publisher: NotificationPublisher) {}

  execute(id: string): void {
    this.publisher.broadcast('algo pasó');
    this.publisher.emitToRoom(`mi-sala:${id}`, JSON.stringify({ id }));
  }
}
```

Se registra en `composition-root.ts` reutilizando la **misma instancia** de
`SocketNotificationPublisher` que ya usan `notification` y `product`.

---

## 10. Configuración y variables de entorno

`shared/config/env.ts` centraliza y tipa las variables de entorno (llama a `dotenv.config()`):

```ts
env.PORT      // number, default 4000
env.ORIGIN    // string | undefined (para CORS)
env.NODE_ENV  // 'development' | 'production' | etc.
env.isDev     // boolean, true si NODE_ENV === 'development'
```

Archivo `.env.example`:
```
PORT=4000
ORIGIN=http://localhost:12312
NODE_ENV=development
```

Para desarrollo local:
```bash
cp .env.example .env
```

`shared/config/express.config.ts` centraliza además:
- `corsConfig`: origin = `env.ORIGIN` o `'*'`, `credentials` solo si hay `ORIGIN` definido.
- `jsonConfig` / `urlEncodeConfig`: límites de tamaño de body.
- `multerConfig`: límite de tamaño de archivo.

---

## 11. Imports absolutos (`src/...`)

Configurado en tres capas para que funcione en dev, build y tests:

1. **`tsconfig.json`**: `baseUrl: "./"` + `paths: { "src/*": ["src/*"] }` → el compilador de
   TS entiende el alias.
2. **`jest.config.js`**: `moduleNameMapper: { '^src/(.*)$': '<rootDir>/$1' }` → Jest resuelve
   el mismo alias al correr tests (`rootDir` es `src`).
3. **Runtime**:
   - En desarrollo: `ts-node-dev -r tsconfig-paths/register` registra el resolver de paths.
   - En build: `tsc && tsc-alias -p tsconfig.json` — `tsc` no reescribe los imports, así que
     `tsc-alias` los reemplaza por rutas relativas reales dentro de `build/`.

Ejemplo de uso: `import { AppError } from 'src/shared/errors/AppError';` en vez de rutas
relativas largas (`../../../shared/errors/AppError`).

---

## 12. Testing

- **Framework**: Jest + `ts-jest` (preset), `testEnvironment: 'node'`.
- **Patrón de archivos**: `*.spec.ts` vive junto al archivo que prueba.
- **Cobertura**: `collectCoverageFrom` incluye todo `src/**/*.ts` excepto specs y `@types`.

Tres niveles de ejemplo ya incluidos:

| Nivel                  | Archivo                                   | Qué prueba                                                        |
|------------------------|---------------------------------------------|--------------------------------------------------------------------|
| Unitario (use case)    | `create-user.use-case.spec.ts`             | Mockea el `UserRepository` (puerto). Cero HTTP, cero Express.      |
| Unitario (controller)  | `user.controller.spec.ts`                  | Mockea el use case, prueba solo la traducción HTTP.                |
| Integración            | `app.spec.ts`                              | Levanta la app real con `supertest` y golpea las rutas.            |

```bash
pnpm test          # correr todos los tests
pnpm test:watch    # modo watch
```

El `Dockerfile` corre `pnpm test` **dentro del build** (stage `builder`), así que la imagen no
se construye si algún test falla.

---

## 13. Lint

ESLint con flat config (`eslint.config.mjs`) + `@typescript-eslint`.

```bash
pnpm run lint
```

---

## 14. Docker

### `Dockerfile` (multi-stage)

**Stage `builder`** (`node:22-alpine`):
1. Instala dependencias nativas de compilación (`python3 make g++ libc6-compat`) y `pnpm` vía
   corepack.
2. Copia solo los manifiestos (`pnpm-workspace.yaml`, `package.json`, `pnpm-lock.yaml`) y corre
   `pnpm install --frozen-lockfile` (aprovecha cache de capas de Docker).
3. Copia el resto del código.
4. Corre `pnpm test` — si falla, la imagen no se construye.
5. Corre `pnpm build` (`tsc` + `tsc-alias`).

**Stage `runner`** (`node:22-alpine`, `NODE_ENV=production`):
1. Crea un usuario no-root (`nodets`) por seguridad.
2. Copia solo lo necesario del stage anterior: `build/`, `node_modules/`, `package.json`.
3. Corre como usuario `nodets`, expone el puerto `4000`.
4. `CMD ["node", "build/index"]`.

### `docker-compose.yaml`

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nodets-backend-api
    restart: unless-stopped
    ports:
      - "${PORT}:${PORT}"
    env_file:
      - .env
```

Sin red ni base de datos externa — este template no trae persistencia real conectada. Si más
adelante se agrega una BD, se añadiría su propio servicio y una red compartida (como en el
proyecto derivado de este template que sí usa MongoDB).

```bash
docker compose up --build
```

### `.dockerignore`

Excluye `node_modules`, `build`, logs, coverage, `.env`, configuraciones de IDE, etc., para no
inflar el contexto de build.

---

## 15. Cómo agregar un módulo nuevo (ej. "product" ya es un ejemplo real)

1. `domain/<modulo>.entity.ts` + `domain/<modulo>.repository.ts` (interfaz/puerto).
2. `application/create-<modulo>.dto.ts` + `application/create-<modulo>.use-case.ts`.
3. `infrastructure/persistence/in-memory-<modulo>.repository.ts` (o el adaptador real: Mongo,
   Postgres, etc.).
4. `infrastructure/http/<modulo>.controller.ts` + `<modulo>.routes.ts`.
5. Registrar todo en `composition-root.ts` (instanciar e inyectar) y montar el router en
   `interfaces/http/routes.ts`.

---

## 16. Scripts de `package.json`

| Script              | Comando                                              | Uso                          |
|---------------------|--------------------------------------------------------|-------------------------------|
| `pnpm dev`          | `ts-node-dev -r tsconfig-paths/register src/index.ts` | Desarrollo con recarga en caliente |
| `pnpm build`        | `tsc && tsc-alias -p tsconfig.json`                    | Compila a `build/` con paths resueltos |
| `pnpm start`        | `node build/index.js`                                  | Corre el build de producción |
| `pnpm test`         | `jest`                                                  | Corre todos los tests        |
| `pnpm test:watch`   | `jest --watch`                                          | Tests en modo watch          |
| `pnpm lint`         | `eslint "src/**/*.ts"`                                  | Lint sobre todo `src/`       |

---

## 17. Siguientes pasos típicos al partir de este template

- Reemplazar `InMemoryUserRepository` por un adaptador real (Mongoose/TypeORM/Prisma) sin
  tocar `application/` ni `infrastructure/http/`.
- Agregar autenticación (JWT) como middleware + módulo `auth`.
- Conectar `UploadFilesUseCase` a un storage real (Cloudinary/S3) en vez de solo devolver el
  resumen.
- Agregar la base de datos y su red en `docker-compose.yaml` cuando se decida cuál usar.
- Documentar la API con OpenAPI/Swagger (como se hizo en otros proyectos derivados de este
  mismo template).

---

## 18. Nota

Esta aplicación es de uso libre como punto de partida. Borrá la carpeta `.git` después de
clonar el repositorio para evitar problemas al subir tu propio backend a tu propio repo.