var express = require('express')
var passport = require('passport')

// init router for auth
const router = express.Router()

router.get('/login', function (req, res) {

    if (req.user) res.redirect('/dashboard') // if auth
    else res.redirect('/auth/login/google') // if not auth

})

/**
 * Se mi arriva /login/google vuol dire che qualcuno vuole autenticarsi con google
 * Io lo re-indirizzo alla solita paginetta bianca
 * di google per loggarsi e autorizzare
 * l'accesso a google drive + info basiche del profilo
 */
router.get('/login/google', passport.authenticate("google", {
    scope: ['profile', "https://www.googleapis.com/auth/drive.file", "email"]
}))

/**
 * Redirect dopo il login Callback che mi arriva da Google con il Token.
 * La roba che mi arriva passa attravero Passport.Google e poi sa lui come
 * entrare. (glielo ho spiegato nella classe passport.js)
 * FINE : Se tutto va bene, l'utente può accedere alla Dashboard
 */
router.get('/google/redirect', passport.authenticate('google'), function (req, res) {
    //TODO: Dovrei mettere un aggiunta al DB del token dell'utente?
    res.redirect('/dashboard')
})

// logout
router.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/')
})

module.exports = router