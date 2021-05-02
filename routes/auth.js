const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const modelManager = require('../helper/modelManager')
const path = require('path');
const cookieParser = require('cookie-parser')

require('dotenv').config({
    path: path.resolve(__dirname, '../private/.env')
})
const privateKey = process.env.JWT;

/**
 * 🍎 ROUTING
 */
router.use(cookieParser());

// router.use(function (req, res, next) {
//     console.log("Guardo i jwt");
//     var login_cookie = req.cookies.jwt;
//     if (login_cookie === undefined) {

//     }
//     console.log("Vabbe vado avanti")
//     next();
// })
router.get('/', (req, res) => {
    if (req)
        res.render('login', {
            title: "Login!"
        })
})

router.post('/login', async (req, res) => {
    // read username and password from request body
    console.log("Si ok fra mi è arrivato: " + req.body.username, req.body.pin)
    const username = req.body.username;
    const pin = req.body.pin;
    if (username != "" && pin != "") {
        //TODO: Questa funzione deve ritornare : JSON { username, ruolo }
        // await modelManager.apriDB();
        const user = await modelManager.getUserAndRole(username, pin);
        // await modelManager.chiudiDB();

        if (user) {
            console.log("Si fra c'è lo user");
            // generate an access token
            const accessToken = jwt.sign({
                nome: user.nome,
                admin: user.is_admin
            }, privateKey);

            // res.cookie("jwt", accessToken, {
            //     maxAge: 90000, // Lifetime
            // })

            res.cookie('jwt', accessToken, {
                httpOnly: true
            });
            res.redirect(302, 'https://belfanti.ddns.net:8443/officina') // Front-End App
            // res.json({
            //     accessToken
            // });
        } else {
            res.json({
                error: "Error"
            });
        }
    } else(res.json({
        error: "Error"
    }))
});


module.exports = router;