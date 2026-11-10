# Estructura del proyecto

## Clasificación

Backend HTTP en Node.js y TypeScript. Es una sola aplicación empaquetada como servicio; `pnpm-workspace.yaml` no corresponde a varios paquetes de aplicación. No hay frontend ni una base de datos configurada en el código inspeccionado.

## Organización general

```text
src/
├── app.ts                    # Configuración de Express y middleware
├── index.ts                  # Arranque HTTP y Socket.IO
├── composition-root.ts       # Registros Awilix y construcción del contenedor
├── interfaces/http/          # Router raíz de la API
├── modules/                  # Funcionalidad organizada por dominio
├── shared/                   # Servicios transversales y adaptadores
└── @types/                   # Extensiones de tipos de Express
```

El código fuente contiene 58 archivos TypeScript: `shared/` 30, `modules/` 20, raíz de `src/` 6, `interfaces/` 1 y `@types/` 1.

## Dominios y capas

| Dominio/carpeta | Archivos | Organización |
|---|---:|---|
| `user` | 9 | `domain/` (2), `application/` (3), `infrastructure/` (4) |
| `file-upload` | 4 | `application/` (2), `infrastructure/http/` (2) |
| `health` | 1 | `infrastructure/http/` (1) |
| `notification` | 3 | `application/` (1), `infrastructure/http/` (2) |
| `product` | 3 | `application/` (1), `infrastructure/http/` (2) |
| `shared` | 30 | Configuración, middleware, Cloudinary, tiempo real, resiliencia, scheduler y utilidades |

En `modules/` hay 7 archivos de aplicación, 2 de dominio y 11 de infraestructura. `user` es el módulo con la separación más completa: entidad y puerto de repositorio en dominio, caso de uso en aplicación y controladores/rutas/adaptador de persistencia en infraestructura. Los demás módulos tienen una estructura más ligera y no todos declaran una capa de dominio.

Las áreas funcionales principales son usuarios, subida de archivos, salud, notificaciones y productos. `shared/` agrupa capacidades reutilizables: configuración de Express y variables de entorno, validación, errores, paginación, logging, Cloudinary, WebSockets, circuit breakers, tareas programadas y utilidades.

## Entrada y flujo de ejecución

1. [`src/index.ts`](src/index.ts) crea el servidor HTTP a partir de la aplicación, inicializa Socket.IO y escucha en el puerto configurado.
2. [`src/app.ts`](src/app.ts) configura Helmet, CORS, parseo JSON y URL-encoded, Morgan, las rutas `/api` y la documentación `/api-docs`; al final monta el middleware de errores.
3. [`src/interfaces/http/routes.ts`](src/interfaces/http/routes.ts) agrega los routers de los módulos bajo `/api`.
4. [`src/composition-root.ts`](src/composition-root.ts) registra dependencias con Awilix. El contenedor tipado resuelve los controladores y casos de uso como singletons, y comparte el publicador Socket.IO entre notificaciones y productos.

La API declara seis rutas HTTP:

| Ruta | Método | Función |
|---|---|---|
| `/api/health/hello` | GET | Comprobación básica del servidor |
| `/api/health/circuit-breakers` | GET | Consulta el estado de los circuit breakers registrados |
| `/api/users` | POST | Crea un usuario |
| `/api/files/upload` | POST | Recibe archivos y devuelve sus metadatos |
| `/api/notifications/notify` | GET | Dispara el caso de uso de notificación |
| `/api/products/:id` | PATCH | Dispara la actualización/notificación del producto |

También se publica Swagger UI en `/api-docs`. [`src/swagger.ts`](src/swagger.ts) genera el documento a partir de comentarios de rutas y definiciones de esquemas.

## Configuración y herramientas

| Archivo | Función |
|---|---|
| [`package.json`](package.json) | Dependencias y comandos `dev`, `build`, `start`, `test`, `lint` y `swagger` |
| [`pnpm-lock.yaml`](pnpm-lock.yaml) / [`pnpm-workspace.yaml`](pnpm-workspace.yaml) | Lockfile y configuración del gestor pnpm |
| [`tsconfig.json`](tsconfig.json) | Compilación TypeScript a `build/`, decoradores y alias `src/*` |
| [`eslint.config.mjs`](eslint.config.mjs) | Reglas ESLint para TypeScript |
| [`jest.config.js`](jest.config.js) | Configuración Jest/ts-jest y cobertura |
| [`Dockerfile`](Dockerfile) | Build multi-stage y ejecución con Node 22 Alpine |
| [`docker-compose.yaml`](docker-compose.yaml) | Servicio API y exposición del puerto desde `.env` |

Hay 8 archivos de prueba `*.spec.ts`, distribuidos entre la aplicación, composition root, módulos y componentes compartidos.

## Observaciones de arquitectura

- La separación de responsabilidades es más explícita en `user`; los otros módulos son ejemplos más pequeños centrados en rutas, controladores y casos de uso.
- No se encontró una base de datos ni un ORM. El repositorio de usuarios es `InMemoryUserRepository`, por lo que su estado no es persistente.
- La subida inyecta `CloudinaryFileStorage`; sus operaciones pasan por circuit breakers independientes y el estado se consulta en `/api/health/circuit-breakers`. Para que la subida funcione se requieren credenciales Cloudinary en `.env`.
- Existe una implementación `NodeCronScheduler`, pero no se registra ni inicia desde el composition root o el arranque.
- La ruta de `product` está montada, pero el código presente representa notificación/actualización vía Socket.IO; no aparece un repositorio ni una capa de persistencia de productos.
