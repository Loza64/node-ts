# Node-TS: Backend con Clean Architecture (Hexagonal + Use Cases)

Backend Node.js + TypeScript + Express organizado con **Clean Architecture / Arquitectura
Hexagonal (Ports & Adapters)**, el mismo patrón que usan equipos backend senior en
Mercado Libre, Nubank, Rappi, etc. para desacoplar la lógica de negocio del framework.

## Idea central: 3 capas por módulo

```
src/modules/<modulo>/
├── domain/           # Entidades + interfaces (puertos). No importa nada de express/socket.io/db.
├── application/       # Casos de uso (Use Cases). Orquesta el dominio. No sabe de HTTP.
└── infrastructure/    # Adaptadores concretos: controllers HTTP, rutas, persistencia, websockets.
    ├── http/
    └── persistence/ (o websocket/)
```

**Regla de dependencia**: `infrastructure` depende de `application`, que depende de `domain`.
Nunca al revés. El dominio no sabe que existe Express, Socket.io o TypeORM.

## Por qué esto y no carpetas por tipo de archivo

La versión anterior organizaba las rutas por verbo HTTP (`get.route.ts`, `post.route.ts`...),
lo cual mezcla infraestructura con features y no escala: para entender "todo lo relacionado a
usuarios" tenías que saltar entre 5 carpetas distintas.

Ahora cada **módulo es autocontenido** (`modules/user`, `modules/file-upload`,
`modules/notification`) y las rutas HTTP quedan organizadas por **recurso**, como en cualquier
REST API seria:

```http
GET    /api/health/hello
POST   /api/users
POST   /api/files/upload
GET    /api/notifications/notify
```

## Use Cases: el corazón de la arquitectura

Cada acción de negocio es una clase con un solo método público `execute()`, con nombre de
negocio (`CreateUserUseCase`, `NotifyAllUseCase`). No reciben `req`/`res`, reciben datos ya
parseados, y no dependen de implementaciones concretas — dependen de **interfaces (puertos)**,
por ejemplo `UserRepository` o `NotificationPublisher`.

Esto significa que puedes testear TODA la lógica de negocio sin levantar Express ni una base de
datos real (ver `create-user.use-case.spec.ts`, que solo mockea el puerto del repositorio).

## Ports & Adapters (Inversión de Dependencias)

- **Puerto** = interfaz definida en `domain/` (ej. `UserRepository`, `NotificationPublisher`).
- **Adaptador** = implementación concreta en `infrastructure/` (ej. `InMemoryUserRepository`,
  `SocketNotificationPublisher`).

Hoy `UserRepository` está implementado en memoria (`InMemoryUserRepository`) como placeholder.
El día que conectes una base de datos real, creas `TypeOrmUserRepository implements UserRepository`
y cambias UNA línea en `composition-root.ts`. Ni el use case ni el controller se enteran.

## Composition Root

`src/composition-root.ts` es el único archivo que conoce simultáneamente las interfaces y sus
implementaciones concretas: aquí se instancian los repositorios/adaptadores y se inyectan
"a mano" (constructor injection) en los use cases y controllers — sin un framework de DI, tal
como lo haría cualquier proyecto Express serio. `src/app.ts` arma el `container` y monta las
rutas de cada módulo bajo `/api`.

## Comandos

- **pnpm run dev** : ejecución en modo desarrollo
- **pnpm run build** : compilar para producción
- **pnpm start** : ejecución en producción
- **pnpm test** : correr los tests con Jest
- **pnpm run test:watch** : tests en modo watch
- **pnpm run lint** : ESLint sobre `src/`

## librerías instaladas

- **express**: framework HTTP
- **multer**: manejo de `multipart/form-data`
- **cors** / **helmet** / **morgan**: seguridad y logging HTTP
- **dotenv**: variables de entorno (`src/shared/config/env.ts`)
- **debug**: logging modular (`src/shared/logger/logger.ts`)
- **class-validator** / **class-transformer**: DTOs de entrada (uno por módulo, en `application/`)
- **socket.io**: tiempo real (módulo `notification`)
- **jest** + **supertest** + **ts-jest**: tests unitarios y de integración

### crear un archivo .env

```bash
cp .env.example .env
```

```.env
PORT=4000
ORIGIN=http://localhost:12312
NODE_ENV=development
```

### Capacidades transversales (ej. WebSockets) compartidas entre módulos

`src/shared/realtime/` contiene el puerto `NotificationPublisher` y su adaptador
`SocketNotificationPublisher` (socket.io). Es transversal, no pertenece a un módulo de negocio,
así que vive en `shared/` — igual que el logger o `AppError`.

Cualquier módulo puede usar salas de socket.io inyectando ese mismo puerto, sin importar nada
de otro módulo de negocio. Ejemplo real en `modules/product`:

```ts
// modules/product/application/notify-product-updated.use-case.ts
export class NotifyProductUpdatedUseCase {
  constructor(private readonly publisher: NotificationPublisher) {}

  execute(productId: string, changes: Record<string, unknown>): void {
    this.publisher.emitToRoom(`product:${productId}`, JSON.stringify({ productId, changes }));
  }
}
```

En `composition-root.ts` se crea **una sola instancia** de `SocketNotificationPublisher` y se
inyecta tanto en `notification` como en `product` (y en cualquier módulo futuro). El cliente se
suscribe igual que siempre, con el evento `join_room` ya definido en el gateway:

```js
socket.emit('join_room', 'product:q32312332', (ok) => console.log('joined?', ok));
socket.on('room_message', (payload) => console.log(payload));
```

`PATCH /api/products/:id` dispara el use case de ejemplo y emite a la sala `product:<id>`.

### Cómo agregar un módulo nuevo (ej. "product")

1. `domain/product.entity.ts` + `domain/product.repository.ts` (interfaz)
2. `application/create-product.dto.ts` + `application/create-product.use-case.ts`
3. `infrastructure/persistence/in-memory-product.repository.ts` (o el adaptador real)
4. `infrastructure/http/product.controller.ts` + `product.routes.ts`
5. Registrar en `composition-root.ts` y en `interfaces/http/routes.ts`

### tests

`*.spec.ts` vive junto al archivo que prueba. Hay tres niveles de ejemplo:

- **Unitario de use case** (`create-user.use-case.spec.ts`): mockea el puerto del repositorio,
  cero HTTP, cero Express.
- **Unitario de controller** (`user.controller.spec.ts`): mockea el use case, prueba solo la
  traducción HTTP.
- **Integración** (`app.spec.ts`): levanta la app real con `supertest` y golpea las rutas.

```bash
pnpm test
```

### lint

ESLint + `typescript-eslint`, flat config (`eslint.config.mjs`).

```bash
pnpm run lint
```

### formato de errores

```json
{
  "status": 401,
  "message": "Error message"
}
```

Lanza `AppError` (`src/shared/errors/AppError.ts`) desde cualquier use case y el
`errorHandler` compartido lo traduce a la respuesta HTTP correcta.

### Nota

Esta aplicación es de uso libre. Borra la carpeta `.git` después de clonar el repositorio para
evitar problemas al subir tu propio backend a GitHub.
