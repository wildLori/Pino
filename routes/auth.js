const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const modelManager = require('../helper/modelManager')
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../private/.env')
})
const privateKey = process.env.JWT;

/**
 * 🍎 ROUTING
 */

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
    if (username) {
        if (pin) {
            //TODO: Questa funzione deve ritornare : JSON { username, ruolo }
            await modelManager.apriDB();
            const user = await modelManager.getUserAndRole(username, pin);
            modelManager.chiudiDB();

            if (user) {
                // generate an access token
                const accessToken = jwt.sign({
                    nome: user.nome,
                    admin: user.is_admin
                }, privateKey);


                if (user.is_admin) {
                    res.json({
                        accessToken
                    });
                } else {
                    res.json("Unauthorized");
                }
            }
        } else {
            return res.send("Erorre con il pin");
        }
    } else {
        return res.send("Errore con lo Username")
    }
});


module.exports = router;