# Node-TS: Plantilla Backend con Node.js + TypeScript

Este  es un proyecto inicializado de nodejs usando typescript, con el fin de
ya tener la aplicacion inicializado con el motor express junto con sus configuraciones principales

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

```.env  
port=4000  
origin=http://localhost:12312  (aplicacion del front)
```

### multer

en le archivo config.ts ya se encuentra la constante upload donde ya esta configurada multer lista para exportar
y usarlo como quiera por ejemplo:

```post.route.ts
// Ruta POST para subir un solo archivo
router.post('/upload', upload.single('file'), uploadFile);  // 'file' es el nombre del campo en el form-data

// Ruta POST para múltiples archivos (opcional)
router.post('/upload-multiple', upload.array('files', 3), uploadMultipleFiles);
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

### Nota

esta aplicacion es de uso libre, solo recuerda borrar la carpeta .git despues de clonar el ropsitorio para que no tengas problemas a la hora de subir tu backend a github, normalmente la carpeta .git esta oculta
