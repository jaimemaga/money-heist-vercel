const jwt = require('jsonwebtoken');
const createError = require('../errors/create-error');

const isAuthJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return next(createError("No estás autorizado", 401));
    }

    const splitAuth = authorization.split(" ");
    if (splitAuth.length !== 2 || splitAuth[0] !== "Bearer") {
        return next(createError("Cabecera authorization incorrecta", 400));
    }

    const token = splitAuth[1];
    let payload;
    try {
        // Verify: verifica que el token es válido y en caso de que lo sea devuelve su payload
        // - Token a verificar
        // - Clave secreta
        payload = jwt.verify(token, req.app.get("secretKey"));
    } catch (err) {
        return next(err);
    }

    req.authority = {
        id: payload.id,
        email: payload.email
    };
    next();
};

module.exports = isAuthJWT;