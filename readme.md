# Documentación Técnica — Node-TS Backend Template

Backend base en **Node.js + TypeScript + Express**, organizado con **Clean Architecture /
Arquitectura Hexagonal (Ports & Adapters)**. Pensado como plantilla de arranque: sin base de
datos real conectada (usa un repositorio en memoria como placeholder), con documentación
OpenAPI autogenerada, resiliencia (circuit breaker), tareas programadas (cron) y un adaptador
de almacenamiento de archivos (Cloudinary) ya listo para conectar cuando lo necesites.

---

## 1. Stack técnico

| Categoría              | Tecnología                                    |
|------------------------|------------------------------------------------|
| Runtime                | Node.js                                        |
| Lenguaje               | TypeScript                                     |
| Framework HTTP         | Express                                        |
| Tiempo real            | Socket.IO                                      |
| Validación             | class-validator + class-transformer            |
| Seguridad HTTP         | Helmet, CORS                                   |
| Logging                | morgan (HTTP) + debug (interno)                |
| Subida de archivos     | Multer (memoria)                               |
| Almacenamiento externo | Cloudinary (adaptador listo, aún no conectado) |
| Resiliencia            | opossum (circuit breaker)                      |
| Tareas programadas     | node-cron                                      |
| Documentación API      | swagger-jsdoc + swagger-ui-express + class-validator-jsonschema |
| Hashing                | bcryptjs                                       |
| Testing                | Jest + ts-jest + Supertest                     |

> Este documento asume que el resto del tooling de proyecto (gestor de paquetes, Docker,
> configuración de imports, lint, scripts de `package.json`) sigue vigente tal como lo tengas
> configurado; aquí nos enfocamos en documentar `src/` — el código de la aplicación.

---

## 2. Arquitectura: 3 capas por módulo

```
src/modules/<modulo>/
├── domain/            # Entidades + interfaces (puertos). No conoce express/socket.io/db.
├── application/       # Casos de uso (Use Cases). Orquesta el dominio. No sabe de HTTP.
└── infrastructure/    # Adaptadores concretos: controllers HTTP, rutas, persistencia, websockets.
    ├── http/
    └── persistence/ (o websocket/)
```

**Regla de dependencia**: `infrastructure` → depende de → `application` → depende de →
`domain`. Nunca al revés. El dominio no sabe que existe Express, Socket.IO ni ningún ORM.

No todos los módulos usan las 3 capas completas: los módulos de ejemplo más simples
(`file-upload`, `notification`, `product`) se saltan `domain/` porque no tienen una entidad de
negocio propia que proteger — son ilustrativos de un patrón (subida de archivos, tiempo real),
no de una entidad completa. `user` es el único módulo con las 3 capas completas y es la
referencia a seguir cuando agregues un módulo con persistencia real.

### Use Cases

Cada acción de negocio es una clase con un único método público `execute()`, con nombre de
negocio (`CreateUserUseCase`, `NotifyAllUseCase`). No reciben `req`/`res`: reciben datos ya
parseados y dependen de **interfaces (puertos)**, nunca de implementaciones concretas. Esto
permite testear toda la lógica de negocio sin levantar Express ni una base de datos real.

### Ports & Adapters

- **Puerto** = interfaz definida en `domain/` o `shared/` (ej. `UserRepository`,
  `SocketPublisher`, `FileStorage`).
- **Adaptador** = implementación concreta en `infrastructure/` o `shared/` (ej.
  `InMemoryUserRepository`, `SocketPublisherNotification`, `CloudinaryFileStorage`).

Hoy `UserRepository` está implementado en memoria (`InMemoryUserRepository`) como placeholder.
El día que conectes una base de datos real, creás `TypeOrmUserRepository implements
UserRepository` (o Mongoose, Prisma, etc.) y cambiás **una sola línea** en
`composition-root.ts`. Ni el use case ni el controller se enteran del cambio.

### Composition Root

`src/composition-root.ts` es el único archivo que conoce simultáneamente las interfaces y sus
implementaciones concretas: aquí se instancian los repositorios/adaptadores y se inyectan "a
mano" (constructor injection) en los use cases y controllers, sin framework de DI.

`src/app.ts` arma el `container` (llamando a `buildContainer()`), monta las rutas de cada
módulo bajo `/api` y expone la documentación interactiva en `/api-docs`.

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
├── swagger.ts                      # Arma el spec OpenAPI (swagger-jsdoc) a partir de los DTOs y comentarios @swagger
├── interfaces/
│   └── http/routes.ts              # Router raíz /api, monta cada módulo
├── modules/
│   ├── health/
│   │   └── infrastructure/http/health.routes.ts        # /health/hello, /health/circuit-breakers
│   ├── user/                                            # Módulo de referencia (3 capas completas)
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
    ├── cloudinary/                 # Adaptador de almacenamiento de archivos (ver §9)
    │   ├── cloudinary.port.ts          # Puerto: FileStorage
    │   ├── cloudinary.adapter.ts        # Adaptador: CloudinaryFileStorage (con circuit breaker)
    │   ├── cloudinary.adapter.spec.ts
    │   └── cloudinary.config.ts         # Configura el SDK de cloudinary con las env vars
    ├── database/                   # Vacía a propósito: aquí va tu data source cuando conectes un ORM
    ├── dto/
    │   └── id-ref.dto.ts            # DTO genérico { id: number } de referencia para swagger
    ├── errors/AppError.ts          # Error operacional con statusCode
    ├── logger/logger.ts            # Namespaces de `debug`
    ├── middlewares/
    │   ├── error-handler.middleware.ts
    │   ├── upload-file.middleware.ts
    │   ├── validate-dto.middleware.ts
    │   └── validation-errors.util.ts
    ├── pagination/
    │   └── pagination-query.dto.ts  # DTOs de query params (paginación/búsqueda/soft-delete), ver §7
    ├── realtime/
    │   ├── socket-publisher.port.ts             # Puerto
    │   └── websocket/
    │       ├── socket.gateway.ts                 # Server socket.io real
    │       ├── socket.types.ts                   # Tipado de eventos
    │       └── socket-publisher.notification.ts  # Adaptador del puerto
    ├── resilience/                 # Circuit breaker genérico, ver §8
    │   ├── circuit-breaker.factory.ts
    │   ├── circuit-breaker.factory.spec.ts
    │   ├── circuit-breaker.registry.ts
    │   └── circuit-breaker.errors.ts
    ├── scheduler/
    │   └── cron.factory.ts         # Factory genérico para registrar cron jobs, ver §10
    ├── swagger/
    │   └── schemas.ts               # Convierte los DTOs (decorators de class-validator) en JSON Schema
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
   - Monta Swagger UI en `/api-docs` (ver §11).
   - `errorHandler` al final, como manejador de errores centralizado.

---

## 5. Endpoints disponibles

| Método | Ruta                          | Descripción                                                                |
|--------|-------------------------------|------------------------------------------------------------------------------|
| GET    | `/api/health/hello`           | Health check simple                                                          |
| GET    | `/api/health/circuit-breakers`| Estado y estadísticas de todos los circuit breakers registrados             |
| POST   | `/api/users`                   | Crea un usuario (valida DTO, hashea password, evita duplicados por email)   |
| POST   | `/api/files/upload`            | Sube uno o varios archivos (multipart/form-data), devuelve su metadata      |
| GET    | `/api/notifications/notify`    | Dispara un `broadcast()` por socket a todos los conectados                  |
| PATCH  | `/api/products/:id`            | Actualiza un producto de ejemplo y emite por socket a la sala `product:<id>`|
| GET    | `/api-docs`                     | Swagger UI, documentación interactiva de la API                            |

### Regla de negocio: `POST /api/users`

Validaciones (`CreateUserDto`, ver §6): `name` (string, 2-60 chars), `email` (formato válido),
`password` (string, mínimo 8 chars). Si sobra un campo no declarado en el DTO, `class-validator`
lo rechaza (`forbidNonWhitelisted: true`).

```http
POST /api/users
Content-Type: application/json

{ "name": "Loza", "email": "loza@example.com", "password": "12345678" }
```

El **use case** (`CreateUserUseCase`) aplica dos reglas de negocio adicionales que el DTO por sí
solo no puede expresar:

1. **Email único**: busca primero con `userRepository.findByEmail(email)`; si ya existe,
   lanza `AppError('Ya existe un usuario con ese correo', 409)` — nunca llega a guardar un
   segundo usuario con el mismo correo.
2. **La contraseña nunca se guarda en texto plano**: se hashea con `bcryptjs`
   (`encryptPass`, costo 10) antes de construir la entidad `User`.

Respuesta 201:
```json
{ "message": "User created", "data": { "id": "...", "name": "Loza", "email": "loza@example.com", "createdAt": "..." } }
```

`passwordHash` **nunca** se serializa hacia el cliente — `User.toPublic()` lo excluye a
propósito, incluso aunque alguien accidentalmente hiciera `res.json(user)` en vez de
`res.json(user.toPublic())` en un módulo nuevo, conviene mantener esa misma convención.

### Regla de negocio: `POST /api/files/upload`

- Tamaño máximo por archivo: `multerConfig.fileSizeLimitMB` (10 MB por defecto,
  `shared/config/express.config.ts`). Si se excede, `upload-file.middleware.ts` responde
  `400` con el mensaje de Multer.
- Solo procesa la request si el `Content-Type` incluye `multipart/form-data`; si no, sigue de
  largo con `next()` sin tocar nada.
- **No hay persistencia real todavía**: `UploadFilesUseCase.execute()` solo devuelve un resumen
  (`name`, `size`, `mimetype`) de cada archivo recibido. Los bytes viven en memoria
  (`multer.memoryStorage()`) y se descartan al terminar el request — el adaptador de Cloudinary
  ya existe (§9) pero **no está conectado** a este use case.

```http
POST /api/files/upload
Content-Type: multipart/form-data; boundary=...
```
Respuesta 200:
```json
{ "total": 2, "files": [{ "name": "foto.png", "size": 20481, "mimetype": "image/png" }, ...] }
```

### Regla de negocio: `GET /api/notifications/notify` y `PATCH /api/products/:id`

Ambos son ejemplos de "fire and forget" hacia Socket.IO, no tienen reglas de validación:

- `notify` dispara un mensaje fijo (`'Hola a todos desde el servidor'`) a **todos** los clientes
  conectados vía `broadcast()` (evento `notification`).
- `PATCH /products/:id` **no valida el body** (no usa `validateDTO`): toma `req.body` tal cual,
  lo devuelve en la respuesta y lo reenvía por el evento `event` únicamente a los sockets que
  se hayan unido a la sala `product:<id>` (`emitToRoom`). Es un ejemplo de "notificar un cambio
  a quien esté mirando ese recurso en particular" — al construir un módulo real con persistencia,
  aquí deberías agregar su propio DTO de validación antes de llamar al use case.

---

## 6. Validación de DTOs

`shared/middlewares/validate-dto.middleware.ts` expone `validateDTO(DtoClass)`:

1. Convierte el `req.body` plano a instancia de la clase con `plainToInstance`.
2. Corre `class-validator` con `whitelist: true, forbidNonWhitelisted: true` (rechaza props
   extra no declaradas en el DTO).
3. Si hay errores, responde `400` con los mensajes concatenados (aplanados recursivamente por
   `flattenValidationErrors`, incluso para errores anidados de objetos/arrays dentro del DTO).
4. Si pasa, reemplaza `req.body` por el DTO ya validado/tipado y sigue con `next()`.

Se usa como middleware de ruta:
```ts
router.post('/', validateDTO(CreateUserDto), controller.create);
```

### DTOs de referencia en `shared/` (aún no wireados a una ruta)

Estos DTOs existen como **contrato listo para usar** el día que agregues un endpoint de
listado o de referencia por id — no dependen de ningún ORM en particular, así que sirven sin
importar qué elijas conectar después:

- **`IdRefDto`** (`shared/dto/id-ref.dto.ts`): `{ id: number }`, valida un id entero positivo.
  Útil para el body de un DTO anidado que solo referencia otra entidad por su id (ej.
  `category: IdRefDto` dentro de un `CreateProductDto`).
- **`PaginationQueryDto` / `SearchQueryDto` / `SoftDeleteQueryDto`**
  (`shared/pagination/pagination-query.dto.ts`): query params reutilizables para cualquier
  listado (ver ejemplo abajo).

```ts
// Ejemplo de uso al construir un endpoint de listado nuevo:
import { Router } from 'express';
import { SoftDeleteQueryDto } from '../../../../shared/pagination/pagination-query.dto';

router.get('/', validateQuery(SoftDeleteQueryDto), controller.findAll);
// GET /api/products?page=2&pageSize=20&search=camisa&delete=true
```

`SoftDeleteQueryDto` extiende `SearchQueryDto`, que extiende `PaginationQueryDto` — así que
trae `page` (default 1), `pageSize` (default 10, máx 100), `search` (opcional, recortado y
máx 100 chars) y `delete` (boolean, default `false`: `true` → solo eliminados,
`false`/ausente → solo activos). No existe hoy un middleware `validateQuery` en la plantilla
—si lo necesitás, seguí el mismo patrón que `validate-dto.middleware.ts` pero
sobre `req.query` en vez de `req.body`.

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

## 8. Resiliencia: Circuit Breaker (`shared/resilience/`)

Patrón "circuit breaker" genérico sobre [opossum](https://www.npmjs.com/package/opossum),
pensado para envolver **cualquier llamada a un servicio externo que pueda fallar o colgarse**
(una API de terceros, un storage, otro microservicio) — no depende de ningún ORM ni de
Cloudinary en particular.

### Regla de negocio

- Si una acción falla repetidamente (por defecto: **50% de error rate** con al menos
  **5 llamadas** de volumen — `CB_ERROR_THRESHOLD_PERCENTAGE` / `CB_VOLUME_THRESHOLD`), el
  circuito se **abre**: las siguientes llamadas ni siquiera intentan la acción real, fallan
  al instante con `EOPENBREAKER`.
- Tras `CB_RESET_TIMEOUT_MS` (15s por defecto) el circuito pasa a **half-open** y prueba una
  sola llamada; si funciona, vuelve a cerrar, si falla, se reabre.
- Cada llamada tiene un `timeout` propio (`CB_TIMEOUT_MS`, 8s por defecto): si tarda más, se
  cuenta como fallo aunque la promesa nunca rechace.
- `errorFilter` permite decidir qué errores **no** deben contar como falla real del servicio
  (ej. un 404 "no encontrado" es un error del cliente, no del proveedor externo — no debería
  abrir el circuito).

### Cómo usarlo en un adaptador nuevo

```ts
import { createCircuitBreaker } from '../resilience/circuit-breaker.factory';
import { isCircuitBreakerFailure } from '../resilience/circuit-breaker.errors';
import { AppError } from '../errors/AppError';

export class MiAdaptadorExterno {
  private readonly breaker = createCircuitBreaker(
    (id: string) => this.llamarServicioReal(id),
    { name: 'mi-servicio.accion', errorFilter: (err) => (err as any)?.http_code < 500 },
  );

  async ejecutar(id: string) {
    try {
      return await this.breaker.fire(id);
    } catch (err) {
      if (isCircuitBreakerFailure(err)) {
        throw new AppError('El servicio externo no está disponible ahora mismo', 503);
      }
      throw err; // error real del negocio/cliente, no del circuito
    }
  }

  private async llamarServicioReal(id: string) { /* fetch/sdk real */ }
}
```

Esto es exactamente lo que hace `CloudinaryFileStorage` (§9): un breaker por operación
(`upload`, `destroy`, `setTags`), y un `fire()` que traduce cualquier apertura de circuito en
un `503 AppError` legible para el cliente en vez de dejar escapar un error interno de opossum.

### Observabilidad: `GET /api/health/circuit-breakers`

`circuit-breaker.registry.ts` lleva un registro global (`Map`) de todos los breakers creados
con `createCircuitBreaker(...)` en toda la app. `health.routes.ts` expone su estado:

```json
{
  "data": [
    {
      "name": "cloudinary.upload",
      "state": "closed",
      "enabled": true,
      "stats": { "fires": 12, "successes": 11, "failures": 1, "rejects": 0, "timeouts": 0, "latencyMeanMs": 340 }
    }
  ]
}
```

Cada nuevo `createCircuitBreaker(...)` que agregues en cualquier módulo aparece automáticamente
aquí — no hace falta registrar nada a mano.

---

## 9. Almacenamiento de archivos: Cloudinary (`shared/cloudinary/`)

**Puerto**: `FileStorage` (`cloudinary.port.ts`) — define `upload`, `destroy`, `setTags`.
**Adaptador**: `CloudinaryFileStorage` (`cloudinary.adapter.ts`) — implementa el puerto contra
la API real de Cloudinary, con un circuit breaker independiente por operación (§8).

> ⚠️ **Este adaptador existe pero todavía no está conectado a ningún módulo.**
> `UploadFilesUseCase` (file-upload) hoy solo lee la metadata del archivo en memoria y la
> devuelve — no llama a `CloudinaryFileStorage`. Conectarlo es uno de los "siguientes pasos"
> típicos (§13): inyectás `CloudinaryFileStorage` en el use case y reemplazás el resumen plano
> por el resultado real de `storage.upload(file, env.CLOUDINARY_FOLDER)`.

### Regla de negocio

- Cada archivo subido genera automáticamente una variante "eager" de 400×400 recortada
  (`crop: 'fill', gravity: 'auto'`) además del original — pensado para tener ya un thumbnail
  sin pedirlo aparte.
- Los errores "de cliente" (`http_code < 500`, ej. `publicId` inexistente al hacer `destroy`)
  **no** cuentan para abrir el circuit breaker (`errorFilter: isClientError`) — solo los
  errores 5xx (caídas reales de Cloudinary) lo abren.
- Si el circuito está abierto, cualquier llamada (`upload`/`destroy`/`setTags`) falla con un
  `AppError('...no está disponible en este momento...', 503)` en vez de colgar el request.

```ts
// Ejemplo de cómo conectarlo en composition-root.ts el día que lo actives:
import { CloudinaryFileStorage } from './shared/cloudinary/cloudinary.adapter';

const fileStorage = new CloudinaryFileStorage();
const uploadFilesUseCase = new UploadFilesUseCase(fileStorage, env.CLOUDINARY_FOLDER);
```

---

## 10. Tareas programadas: node-cron (`shared/scheduler/cron.factory.ts`)

Factory genérico para registrar cron jobs, agnóstico de qué haga la tarea por dentro (no sabe
ni le importa si la tarea toca una base de datos, un archivo, o solo hace un `fetch`).

### Regla de negocio

- **Protección contra solapamiento**: si una corrida todavía está en curso cuando el cron
  vuelve a disparar, el nuevo tick se **omite** (no se ejecutan dos corridas del mismo job en
  paralelo).
- **Falla rápido**: si la expresión cron no es válida (`cron.validate`), lanza un error al
  registrar el job — mejor descubrirlo al arrancar el server que en producción, cuando el job
  simplemente nunca corra.
- Cualquier error no controlado dentro de la tarea se loguea (`errorLog`) pero **no tumba el
  proceso** — el próximo tick se intenta igual.

### Cómo usarlo

```ts
import { createCronJob } from './shared/scheduler/cron.factory';

// dentro de index.ts, después de armar el container:
const job = createCronJob({
  name: 'orphan-photos-cleanup',
  cronExpression: '0 * * * *', // cada hora, en punto
  task: async () => {
    await miUseCaseDeLimpieza.execute();
  },
});

// en el shutdown (SIGINT/SIGTERM):
job.stop();
```

Hoy **no hay ningún job registrado** en `index.ts` — el factory queda listo para el primer job
real que necesites (limpieza de datos huérfanos, sincronizaciones periódicas, envío de reportes,
etc.), sin acoplarlo a ningún ORM.

---

## 11. Documentación OpenAPI (Swagger)

Tres piezas trabajando juntas:

1. **`shared/swagger/schemas.ts`**: usa `class-validator-jsonschema` para convertir los
   *decorators* de `class-validator` de cualquier DTO importado (`IdRefDto`,
   `PaginationQueryDto`/`SearchQueryDto`/`SoftDeleteQueryDto`, `CreateUserDto`, ...) en JSON
   Schema real, sin escribirlo a mano. **Para que un DTO nuevo aparezca en `/api-docs`, hay
   que importarlo (aunque sea solo por su efecto secundario) en este archivo.**
2. **`src/swagger.ts`**: arma el spec OpenAPI completo con `swagger-jsdoc`, tomando los
   schemas del punto anterior más los bloques de comentario `@swagger` que escribas en los
   archivos `*.routes.ts` (ver ejemplo en `health.routes.ts`).
3. **`app.ts`**: monta `swagger-ui-express` en `/api-docs` con ese spec.

### Cómo documentar un endpoint nuevo

```ts
/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Actualiza un producto y notifica el cambio por socket
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.patch('/:id', controller.update);
```

---

## 12. Tiempo real (Socket.IO)

### Arquitectura

Sigue el mismo patrón de puertos y adaptadores que el resto de la app:

- **Puerto**: `SocketPublisher` (`shared/realtime/socket-publisher.port.ts`) define
  `broadcast(payload)` y `emitToRoom(room, payload)`.
- **Adaptador**: `SocketPublisherNotification` implementa el puerto usando el gateway real de
  socket.io.
- Los use cases (`NotifyAllUseCase`, `NotifyProductUpdatedUseCase`) solo conocen el puerto, no
  importan `socket.io` directamente. Esto permite testear esos use cases con un mock del puerto,
  sin levantar sockets reales.

### Gateway (`socket.gateway.ts`)

- `initSocket(httpServer)` crea el `Server` de socket.io usando la misma config de CORS que
  Express (`corsConfig`), y queda montado sobre el servidor HTTP nativo.
- `getSocketIO()` expone la instancia ya inicializada (lanza error si se llama antes de
  `initSocket`).
- Maneja los eventos de sala: `join`, `leave`, `event`, `message`, y loguea conexión /
  desconexión / errores con `socketLog`.

### Eventos tipados (`socket.types.ts`)

| Dirección           | Evento         | Payload                                          |
|----------------------|----------------|----------------------------------------------------|
| Cliente → Servidor   | `join`         | `room: string, callback?: (ok: boolean) => void`   |
| Cliente → Servidor   | `leave`        | `room: string, callback?: (ok: boolean) => void`   |
| Cliente → Servidor   | `event`        | `{ room, payload }`                                |
| Cliente → Servidor   | `message`      | `{ room, payload }`                                |
| Servidor → Cliente   | `event`        | `payload`                                          |
| Servidor → Cliente   | `message`      | `payload`                                          |
| Servidor → Cliente   | `notification` | `payload`                                          |

### Ejemplo cliente

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

socket.emit('join', 'product:123', (ok) => console.log('joined?', ok));
socket.on('event', (payload) => console.log(payload));
socket.on('notification', (payload) => console.log(payload));
socket.emit('event', { room: 'product:123', payload: 'hola' });
socket.emit('leave', 'product:123');
```

### Cómo emitir desde un use case nuevo

```ts
import { SocketPublisher } from '../../../shared/realtime/socket-publisher.port';

export class MiUseCase {
  constructor(private readonly publisher: SocketPublisher) {}

  execute(id: string): void {
    this.publisher.broadcast({ message: 'algo pasó' });
    this.publisher.emitToRoom(`mi-sala:${id}`, { id });
  }
}
```

Se registra en `composition-root.ts` reutilizando la **misma instancia** de
`SocketPublisherNotification` que ya usan `notification` y `product`.

---

## 13. Configuración y variables de entorno

`shared/config/env.ts` centraliza y tipa las variables de entorno (llama a `dotenv.config()`):

```ts
env.PORT                          // number, default 4000
env.ORIGIN                        // string | undefined (para CORS; admite lista separada por comas)
env.NODE_ENV                      // 'development' | 'production' | etc.
env.isDev                         // boolean, true si NODE_ENV === 'development'

env.CLOUDINARY_CLOUD_NAME         // string, default ''
env.CLOUDINARY_API_KEY            // string, default ''
env.CLOUDINARY_API_SECRET         // string, default ''
env.CLOUDINARY_FOLDER             // string, default 'uploads'

env.CB_TIMEOUT_MS                 // number, default 8000  — timeout por llamada del circuit breaker
env.CB_ERROR_THRESHOLD_PERCENTAGE // number, default 50    — % de fallas para abrir el circuito
env.CB_RESET_TIMEOUT_MS           // number, default 15000  — cuánto espera antes de medio-abrir
env.CB_VOLUME_THRESHOLD           // number, default 5      — mínimo de llamadas antes de evaluar el %
```

Ejemplo de `.env`:
```dotenv
PORT=4000
ORIGIN=http://localhost:12312
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=uploads

CB_TIMEOUT_MS=8000
CB_ERROR_THRESHOLD_PERCENTAGE=50
CB_RESET_TIMEOUT_MS=15000
CB_VOLUME_THRESHOLD=5
```

`shared/config/express.config.ts` centraliza además:
- `corsConfig`: `origin` = `env.ORIGIN` (partido por comas si trae varios) o `'*'`;
  `credentials` solo si hay `ORIGIN` definido; headers permitidos incluyen
  `X-Internal-Api-Key` de referencia para un futuro esquema de auth interna.
- `jsonConfig` / `urlEncodeConfig`: límites de tamaño de body (10mb / 50mb).
- `multerConfig`: límite de tamaño de archivo (`fileSizeLimitMB`, 10 MB).

---

## 14. Testing

Tres niveles de ejemplo ya incluidos, los tres sobre el módulo `user` (el único con las 3 capas
completas):

| Nivel                  | Archivo                          | Qué prueba                                                   |
|------------------------|-----------------------------------|-----------------------------------------------------------------|
| Unitario (use case)    | `create-user.use-case.spec.ts`   | Mockea el `UserRepository` (puerto). Cero HTTP, cero Express. Cubre la regla de email duplicado. |
| Unitario (controller)  | `user.controller.spec.ts`        | Mockea el use case, prueba solo la traducción HTTP.             |
| Integración            | `app.spec.ts`                     | Levanta la app real con `supertest`: health check, body inválido (400), creación válida (201). |

A eso se suman los tests de infraestructura compartida:

| Archivo                              | Qué prueba                                                           |
|---------------------------------------|------------------------------------------------------------------------|
| `circuit-breaker.factory.spec.ts`     | Que el breaker abre tras suficientes fallas y que `errorFilter` evita abrir el circuito por errores de cliente. |
| `cloudinary.adapter.spec.ts`          | Que un error real se deja pasar mientras el circuito está cerrado, y que tras varias fallas 5xx el circuito abre y falla rápido con `503 AppError` sin llamar de nuevo a Cloudinary. |

---

## 15. Cómo agregar un módulo nuevo

Seguí `user/` como plantilla si el módulo necesita persistencia real:

1. `domain/<modulo>.entity.ts` + `domain/<modulo>.repository.ts` (interfaz/puerto).
2. `application/create-<modulo>.dto.ts` + `application/create-<modulo>.use-case.ts`. Si vas a
   listar con paginación/búsqueda, reusá `SoftDeleteQueryDto` de `shared/pagination/` (§6) en
   vez de crear tus propios query params desde cero.
3. `infrastructure/persistence/in-memory-<modulo>.repository.ts` (o el adaptador real: Mongo,
   Postgres, etc., implementando la misma interfaz).
4. `infrastructure/http/<modulo>.controller.ts` + `<modulo>.routes.ts`. Agregá el bloque
   `@swagger` en las rutas para que aparezca en `/api-docs` (§11), e importá el DTO en
   `shared/swagger/schemas.ts` si querés que su schema se documente ahí.
5. Registrar todo en `composition-root.ts` (instanciar e inyectar) y montar el router en
   `interfaces/http/routes.ts`.

Si el módulo llama a un servicio externo (una API de terceros, otro storage), envolvé esa
llamada con `createCircuitBreaker` (§8) siguiendo el mismo patrón que
`CloudinaryFileStorage`, en vez de llamarlo "a pelo".

---

## 16. Siguientes pasos típicos al partir de este template

- Reemplazar `InMemoryUserRepository` por un adaptador real (Mongoose/TypeORM/Prisma) sin
  tocar `application/` ni `infrastructure/http/` — `shared/database/` está vacía a propósito,
  ahí va tu `data-source`/conexión cuando decidas cuál ORM usar.
- Conectar `UploadFilesUseCase` al `CloudinaryFileStorage` que ya existe en `shared/cloudinary/`
  (§9) en vez de solo devolver el resumen del archivo.
- Agregar validación (`validateDTO`) al `PATCH /api/products/:id`, que hoy acepta cualquier
  body sin chequear nada.
- Registrar el primer job real con `createCronJob` (§10) — hoy el factory existe pero no hay
  ningún job dado de alta en `index.ts`.
- Agregar autenticación (JWT) como middleware + módulo `auth`.
- Documentar cada endpoint nuevo con su bloque `@swagger` (§11) para que `/api-docs` se
  mantenga al día.

---

## 17. Nota

Esta aplicación es de uso libre como punto de partida.