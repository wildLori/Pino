const {
    Router
} = require('express')
const path = require('path');
const router = Router()
require('dotenv').config({
    path: path.resolve(__dirname, '../private/.env')
})
const privateKey = process.env.JWT;

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, privateKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            console.log("Utente " + user + "jwttato");
            req.user = user;
            next();
        });
    } else {
        return res.sendStatus(401);
    }
}

/**
 * 🔨 ROUTING
 */
router.get('/', authenticateJWT, function (req, res) {
    if (req)
        res.render('officina', {
            'title': 'Application Home'
        })

})



router.use(authenticateJWT);


module.exports = router