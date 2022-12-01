const createError = require("../errors/create-error");

const isAuthPassport = (req, res, next) => {
    // req.isAuthenticated --> boolean true si está autenticado o false si no lo está
    if (req.isAuthenticated()) {
        return next();
    } else {
        return next(createError('No tienes permisos', 401));
    }
};
module.exports = isAuthPassport;
