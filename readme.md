# Node-TS: Plantilla Backend con Node.js + TypeScript

Este  es un proyecto inicializado de nodejs usando typescript, con el fin de
ya tener la aplicacion inicializado con el motor express junto con sus configuraciones principales

## Comandos

- **pnpm run dev** : ejecucion de la aplicacion en modo de desarrollo
- **pnpm run build** : preparar el proyecto para produccion
- **pnpm start** : ejecucion de la aplicacion en produccion
- **pnpm test** : correr los tests con Jest
- **pnpm run test:watch** : correr los tests en modo watch
- **pnpm run lint** : correr ESLint sobre `src/`

## librerias instaladas

- **express** : Framework web para Node.js que simplifica la creación de APIs REST y servidores HTTP.
- **multer** : Middleware para manejar multipart/form-data (subida de archivos).
- **cors**: Permite peticiones cruzadas entre dominios (evita errores CORS).
- **dotenv**: Carga variables de entorno desde un archivo .env.
- **helmet**: Protege la app configurando headers HTTP seguros (XSS, CSP, etc.).
- **debug**:  Librería de logging modular (alternativa a console.log).
- **morgan**: Middleware de logging de solicitudes HTTP.
- **cross-env**: Establece variables de entorno compatibles en cualquier OS.
- **ts-node-dev**: Ejecuta TypeScript en desarrollo con recarga automática.
- **typescript**: Añade tipado estático a JavaScript. Configuracion -> tsconfig.json
- **jest**: Framework de pruebas unitarias e integración.
- **class-validator**: Validar objetos (como los datos de entrada en una API) usando decoradores en clases TypeScript.
- **class-transformer**: Transformar objetos planos (como JSON) en instancias de clases TypeScript (y viceversa).

### crear un archivo .env

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

```repositorio
node-ts/
├── node_modules/       
├── src/ 
├── .env                     
├── .env.example
├── .gitignore   
├── README.md                 
├── package.json  
├── pnpm-lock.yaml
├── tsconfig.json
├── eslint.config.mjs
└── jest.config.js
```

```.env
PORT=4000
ORIGIN=http://localhost:12312
NODE_ENV=development
```

### multer

en le archivo config.ts ya se encuentra la constante upload donde ya esta configurada multer lista para exportar
y usarlo como quiera por ejemplo:

```post.route.ts
// Ruta POST para subir un solo archivo
router.post('/upload/files', uploadFile, uploadFilesCloud);
```

### middleware

en la carpeta middleware cree un archivo validator.dto.ts la cual se encarga de validar los datos de las clases dto
solamente hay que importarlo usarlo asi:

```post.route.ts
router.post('/users', validateDto(CreateUserDto), (req, res) => {
  res.json({ message: '¡Usuario validado con éxito!', data: req.body });
});
```

### configuracion

En el archivo config.ts se encuentra la configuración principal de la aplicación. Desde allí, podrás importar las variables de entorno, como el port (puerto) y el origin (origen), así como los ajustes de debug. Ten en cuenta que el modo debug solo estará activo cuando la aplicación se ejecute en modo de desarrollo (es decir, al compilarla como dev), un ejemplo esta en index.ts.

### api

en tu navegador coloca la siguiente ruta: "<http://localhost:3000/api/get/hello>" lo cual es donde esta el hola mundo del backend, en la carpeta, se encuentran todos los metodos: post, get, put, etc, la ruta general del proyecto es: "<http://localhost:3000/api/>" cuando agreges algo al post, segun lo que pongas en tu ruta siempre comenzara a apartir de "request/ por ejemplo:

```http
GET    http://localhost:3000/api/get/users
POST   http://localhost:3000/api/post/login
PUT    http://localhost:3000/api/put/user/123
DELETE http://localhost:3000/api/delete/user/123
```

Eres libre de modificarla a tu antojo, si quieres hacer la ruta mas corta ve a app.ts y ahi encontraras la ruta general la cual es: /api/.

```app.ts
app.use(express.urlencoded(urlencodeconfig));
app.use(morgan("dev"))
app.use('/api', router)
```

### Mensajes en terminal en modo desarrollo

Puedes importar estas constantes que se encuentran en config.ts para agregar mensajes en la consola y puedes crear mas a tu gusto por ejemplo: const ejemplo = debug("nodets:[ejemplo]");

```config.ts
export const server = debug("nodets:[server]");
export const error = debug("nodets:[error]");
export const database = debug("nodets:[database]");
export const input = debug("nodets:[input]");
```

se utiliza de esta forma:

```index.ts
server("running in port", 3000)
```

lo cual en la terminal te saldra:

```terminal
nodets:[server] running in port 3000 +0ms
```

esto solo funciona cuando el proyecto esta en modo desarrollo.

si quieres cambiar el nodets: por algo mas tienes que modificar el package.json

```package.json
"dev": "cross-env DEBUG=nodets:* ts-node-dev src/index.ts",
```

remplaza nodets por la palabra que tu quieras pero asegurate que las demas constantes tenga eso mismo de lo contrario
no te aparecera el mensaje, ejemplo

```package.json
"dev": "cross-env DEBUG=app:* ts-node-dev src/index.ts",
```

```config.ts
export const server = debug("app:[server]");
export const error = debug("app:[error]");
export const database = debug("app:[database]");
export const input = debug("app:[input]");
```

para las excepciones el response sera:
```
{
  "status": 401,
  "message": "Error message"
}
```

### tests

El proyecto usa Jest + ts-jest. Los archivos `*.spec.ts` viven junto al archivo que prueban
(por ejemplo `src/app/controller/rest.controller.spec.ts`). Hay dos ejemplos ya incluidos:

- Un test unitario de controller, mockeando `req`/`res` directamente.
- Un test de integración con `supertest` que levanta la app de Express y golpea las rutas reales.

```bash
pnpm test
```

### lint

Se reemplazó `tslint` (deprecado) por ESLint con `typescript-eslint`, usando flat config
(`eslint.config.mjs`). Corre:

```bash
pnpm run lint
```

### Nota

esta aplicacion es de uso libre, solo recuerda borrar la carpeta .git despues de clonar el repositorio para que no tengas problemas a la hora de subir tu backend a github, normalmente la carpeta .git esta oculta
