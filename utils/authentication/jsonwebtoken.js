const jwt = require('jsonwebtoken');

const getJWT = (userInfo) => {
    // Sign --> crea y firma un token nuevo
    // - Payload: Información que queramos pasar en nuestro token
    // - Clave secreta
    // - Configuración: objeto con configuracion a la hora de crear el token
    return jwt.sign(
        {
            id: userInfo._id,
            email: userInfo._email
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: 120
        }
    );
};

module.exports = getJWT;