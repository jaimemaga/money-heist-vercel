require('dotenv').config();

const express = require('express');
const charactersRouter = require('./routes/characters.routes.js');
const connect = require('./utils/db/connect.js');
const cors = require('cors');
const createError = require('./utils/errors/create-error.js');
const locationsRouter = require('./routes/locations.routes.js');
const passport = require('passport');
const userRouter = require('./routes/user.routes.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require("path");
const cloudinary = require("cloudinary");


const DB_URL = process.env.DB_URL;

// Me conecta a la base de datos.
connect();

const PORT = process.env.PORT || 3000;
const server = express();

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_SECRET 
});

// Setea la variable a nivel de nuestra aplicación, haciéndola recuperable desde la request
// - Clave
// - Valor
// server.set("secretKey", process.env.JWT_SECRET_KEY)

const whitelist = ['http://localhost:3000', 'http://localhost:4200', 'https://winter-meteor-969038.postman.co' /** other domains if any */ ]
const corsOptions = {
  credentials: true,
  origin: function(origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};
server.use(cors(corsOptions));

// Nos permite parsear los body de las peticiones POST y PUT que vienen como JSON
server.use(express.json());
// Nos permite parsear los body de las peticiones POST y PUT que vienen como string o array
server.use(express.urlencoded({ extended: false }));

// Express.static nos crea la ruta en la que se servirán archivos estáticos
server.use(express.static(path.join(__dirname, 'public')));

// Inicializar y configurar passport
// Ejecuta el archivo de passport
require('./utils/authentication/passport.js');

// Creamos gestión de sesiones
// Recibe config de la sesión
server.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 120000 // Milisegundos hasta que la cookie caduca
    },
    // Store: Almacen donde se guardan las sesiones activas de los usuarios
    store: MongoStore.create({
        mongoUrl: DB_URL
    })
}));

// Inicializa passport
server.use(passport.initialize());
// Utilizamos la sesión con passport
server.use(passport.session());

server.get('/', (req, res) => {
    res.json("Bienvenido a mi API de la Casa de Papel!");
});

// Rutas
server.use('/user', userRouter);
server.use('/characters', charactersRouter);
server.use('/locations', locationsRouter);

// * --> Cualquier ruta que no haya sido identificada en los anteriores server use entrará por aquí
server.use('*', (req, res, next) => {
    next(createError('Esta ruta no existe', 404));
});

// Manejo de errores
// Además de los típicos req, res y next se añade un parámetro error
// - Error: error emitido desde el paso previo del servidor
server.use((err, req, res, next) => {
    return res.status(err.status || 500).json(err.message || 'Unexpected error');
});

server.listen(PORT, () => {
    console.log(`El servidor está escuchando en http://localhost:${PORT}`);
});

module.exports = server;