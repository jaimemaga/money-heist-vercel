const express = require('express');
const passport = require('passport');
const User = require('../models/Users');
const createError = require('../utils/errors/create-error');
const bcrypt = require('bcrypt');
const getJWT = require('../utils/authentication/jsonwebtoken');
const isAuthPassport = require('../utils/middlewares/auth-passport.middleware');

const userRouter = express.Router();

userRouter.post('/register', (req, res, next) => {
    // Función done que le llega a la estrategia en passport.js
    const done = (err, user) => {
        if (err) {
            return next(err);
        }
        // Nos permite iniciar sesión con el usuario creado
        // 1. Usuario
        // 2. Callback --> se ejecuta cuando el usuario se loguea correctamente o si hay un error durante el login
        // 2.1 Error: Si se ha producido alguno
        req.logIn(
            user,
            (err) => {
                if (err) {
                    return next(err);
                }
                return res.status(201).json(user);
            }
        );
    };

    // Creamos el autenticador de usuarios y lo ejecutamos con la request actual.
    // 1. Nombre de la estrategia a utilizar
    // 2. Callback done
    passport.authenticate('register', done)(req);
});

userRouter.post('/login', (req, res, next) => {
    // Función done que le llega a la estrategia en passport.js
    const done = (err, user) => {
        if (err) {
            return next(err);
        }
        // Nos permite iniciar sesión con el usuario creado
        // 1. Usuario
        // 2. Callback --> se ejecuta cuando el usuario se loguea correctamente o si hay un error durante el login
        // 2.1 Error: Si se ha producido alguno
        req.logIn(
            user,
            (err) => {
                if (err) {
                    return next(err);
                }
                return res.status(200).json(user);
            }
        );
    };

    // Creamos el autenticador de usuarios y lo ejecutamos con la request actual.
    // 1. Nombre de la estrategia a utilizar
    // 2. Callback done
    passport.authenticate('login', done)(req);
});

userRouter.get('/me', [isAuthPassport], (req, res, next) => {
    return res.status(200).json(req.user);
});

userRouter.post('/logout', (req, res, next) => {
    if (req.user) {
        // Desloguea al usuario y destruye el objeto req.user
        // - Callback una vez se haya hecho logout
        req.logOut(() => {
            // Nos permite destruir la sesión
            // - Callback que se ejecuta una vez haya sido destruida la sesión
            req.session.destroy(() => {
                // Limpia la cookie con el id indicado al llegar a cliente
                res.clearCookie('connect.sid');
                return res.status(200).json("Hasta luego!");
            });
        });
    } else {
        return res.status(304).json('No hay un usuario logueado en este momento');
    }
});

userRouter.post('/login-jwt', async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(createError('El usuario no existe'), 404);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return next(createError('La contraseña no es válida', 403));
    }

    user.password = null;
    const token = getJWT(user);
    return res.status(200).json({
        user,
        token
    });
});

module.exports = userRouter;