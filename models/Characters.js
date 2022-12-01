const mongoose = require('mongoose');

// new mongoose.Schema nos permite crear un nuevo esquema que va a seguir una colección
// 1. Propiedades que vana a tener los documentos de la colección
// 2. Opciones configuración para aplicar al schema.
const characterSchema = new mongoose.Schema(
    {
        // : Tipo o : { type: Tipo, ... }
        // Required: Indicar que el campo es obligatorio (no se pueden crear elementos sin esa propiedad)
        // Min: Indica el valor mínimo que puede tomar cierta propiedad
        // Max: === con valor máximo
        // Unique: EL valor debe ser único en ese documento dentro de la colección
        // Enum: El valor de la propiedad tendrá que estar entre los indicados en el array
        name: { type: String, required: true },
        alias: { type: String, unique: true, required: true },
        age: { type: Number, min: [10, "Eres muy pequeño para ser atracador!"], max: 100 },
        skills: {
            type: [String],
            enum: {
                values: ["Hacker", "Militar", "Conductor", "Lider", "Peleador", "Acróbata"],
                message: "Esta no es una habilidad valiosa para un atracador. "
            }
        },
        picture: String
    },
    {
        // Timestamps: Nos añade la fecha de creación y de edición de cada elemento al documento guardado en la BD.
        timestamps: true
    }
);

// Crear la colección que se va a exportar y que sigue el esquema más arriba --> mongoose.model
// 1. Nombre colección
// 2. Esquema que debe seguir
const Character = mongoose.model('Character', characterSchema);

// Creando un documento para la colección Character
// const juan = new Character({ name: 'Juan', alias: 'Pamplona', age: 8, skills: ['Peleador', 'Loder']});

// Validamos errores en un documento creado
// const error = juan.validateSync();
// console.log(error);

module.exports = Character;