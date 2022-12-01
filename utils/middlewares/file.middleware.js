const multer = require("multer");
const path = require("path");
const createError = require("../errors/create-error");

// Array con los tipos de archivo válidos que quiero permitir guardar
const VALID_FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

// Filtro de archivos
// - Request
// - File
// - Callback mandando si queremos que el archivo se acepte o no --> (error, true si lo acepta)
const fileFilter = (req, file, cb) => {
    // file.mimetype incluye la extensión del archivo
    if (!VALID_FILE_TYPES.includes(file.mimetype)) {
        cb(createError("El tipo de archivo no es aceptado"));
    } else {
        cb(null, true);
    }
};

// ALmacen archivos
// Objeto configuración
// - filename: callback que devuelve el nombre que queremos darle a nuestro archivo
// - destination: callback que nos devuelve la carpeta destino en la que se guarda el archivo
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    },
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    }
});

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;