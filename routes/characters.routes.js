const express = require('express');
const Character = require('../models/Characters.js');
const createError = require('../utils/errors/create-error.js');
const isAuthJWT = require('../utils/middlewares/auth-jwt.middleware.js');
const isAuthPassport = require('../utils/middlewares/auth-passport.middleware.js');
const upload = require('../utils/middlewares/file.middleware.js');
const imageToUri = require('image-to-uri');
const fs = require('fs');
const uploadToCloudinary = require('../utils/middlewares/cloudinary.middleware.js');

const charactersRouter = express.Router();

charactersRouter.get('/', [isAuthJWT], async (req, res, next) => {
    try {
        const characters = await Character.find();
        // .json(datos) == .send(datos) pero me los transforma directamente al formato correcto para objetos
        return res.status(200).json(characters);
    } catch (err) {
        next(err);
    }
});

charactersRouter.get('/:id', [isAuthPassport], async (req, res, next) => {
    const id = req.params.id;
    try {
        const character = await Character.findById(id);
        if (character) {
            return res.status(200).json(character);
        } else {
            next(createError('No existe un personaje con el id indicado', 404));
        }
    } catch (err) {
        // Next nos permite pasar al siguiente paso dentro del flujo de nuestro servidor
        next(err);
    }
});

charactersRouter.get('/age/:age', async (req, res, next) => {
    const age = req.params.age;
    try {
        const characters = await Character.find({
            age: { $gt: age }
        }, {
            alias: 1,
            _id: 0
        });
        return res.status(200).json(characters);
    } catch (err) {
        next(err);
    }
});

charactersRouter.get('/skill/:skill', async (req, res, next) => {
    const skill = req.params.skill;
    try {
        const characters = await Character.find({
            skills: { $in: [skill] }
        });
        return res.status(200).json(characters);
    } catch (err) {
        next(err);
    }
});

// Upload (multer) tiene dos modos:
// - single --> si solo queremos subir 1 archivo (nombre cambo body donde va el archivo)
// - array --> varios archivos (nombre del campo donde van los archivos, numero archivos)
charactersRouter.post('/', [upload.single('picture')], async (req, res, next) => {
    try {
        const picture = req.file ? req.file.filename : null;
        // New Character nos permite crear un nuevo documento de la colección indicada
        // IMPORTANTE: Solo podemos insertar documentos en nuestra base de datos.
        const newCharacter = new Character({ ...req.body, picture });
        // Save: guarda el documento sobre el que se ejecute en su colección de la base de datos.
        const createdCharacter = await newCharacter.save();
        // Status 201 para simbolizar que el elemento ha sido creado correctamente
        // Devuelvo el elemento creado como respuesta
        return res.status(201).json(createdCharacter);
    } catch (err) {
        next(err);
    }
});

charactersRouter.post('/with-uri', [upload.single('picture')], async (req, res, next) => {
    try {
        // file.path tiene la ruta dentro de nuestro servidor de la imagen subida
        const filePath = req.file ? req.file.path : null;
        // imageToUri convierte a Base64 el archivo con el path que le indiquemos
        const picture = imageToUri(filePath);
        const newCharacter = new Character({ ...req.body, picture });
        const createdCharacter = await newCharacter.save();
        // Eliminar el archivo subido por multer debido a que ya está guardado en a DB como URI.
        await fs.unlinkSync(filePath);
        return res.status(201).json(createdCharacter);
    } catch (err) {
        next(err);
    }
});

charactersRouter.post('/to-cloud', [upload.single('picture'), uploadToCloudinary], async (req, res, next) => {
    try {
        const newCharacter = new Character({ ...req.body, picture: req.file_url });
        const createdCharacter = await newCharacter.save();
        return res.status(201).json(createdCharacter);
    } catch (err) {
        next(err);
    }
});

charactersRouter.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        // findByIdAndDelete permite buscar un elemento por su id y eliminarlo
        // - Id del documento a eliminar
        await Character.findByIdAndDelete(id);
        return res.status(200).json('El personaje ha sido eliminado correctamente');
    } catch (err) {
        next(err);
    }
});

charactersRouter.delete('/alias/:alias', async (req, res, next) => {
    try {
        const alias = req.params.alias;
        // Delete one nos permite eliminar el elemento que siga los filtros establecidos
        // Utilizar propiedad única
        await Character.deleteOne({ alias });
        return res.status(200).json('El personaje ha sido eliminado correctamente');
    } catch (err) {
        next(err);
    }
});

charactersRouter.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        // Creo documento con los datos que deseo actualizar
        const modifiedCharacter = new Character({ ...req.body });
        // Modifico su id para que sea la misma que la que tiene actualmente
        modifiedCharacter._id = id;
        // Guardo el personaje actualizado (si no pongo new a true será antes de actualizar)
        // - Id del elemento a actualizar
        // - Documento con los datos actualizados
        // - Opciones de configuración
        const characterUpdated = await Character.findByIdAndUpdate(
            id,
            { $set: { ...modifiedCharacter }},
            { new: true }
        );
        return res.status(200).json(characterUpdated);
    } catch (err) {
        next(err);
    }
});

module.exports = charactersRouter;