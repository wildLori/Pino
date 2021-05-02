const express = require('express')
const path = require('path');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const {
    decode
} = require('punycode');
require('dotenv').config({
    path: path.resolve(__dirname, '../private/.env')
})
const modelManager = require('../helper/modelManager');
const privateKey = process.env.JWT;

router.use(cookieParser());
const authenticateJWT = (req, res, next) => {
    console.log("Entro in officina");

    var login_cookie = req.cookies.jwt;
    if (login_cookie === undefined) {
        res.redirect("/auth");
        //res.send("No fra, no non hai il cookie");
    } else {
        console.log(login_cookie);
        jwt.verify(login_cookie, privateKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            console.log("Utente " + user + "jwttato");
            req.user = user;
            next();
        })

    }
}

/**
 * 🔨 ROUTING
 */
router.get('/', authenticateJWT, async function (req, res) {
    if (req) {
        console.log("SKU, ora ti renderizzo la officina");
        //Apro il DB
        //Query per ottenere tutti gli utenti
        //Chiudo il DB
        await modelManager.apriDB();
        const users = await modelManager.getAllUsers();
        await modelManager.chiudiDB();
        console.log(users);
        res.render('officina', {
            info: users
        })
    }

})



router.use(authenticateJWT);


module.exports = router