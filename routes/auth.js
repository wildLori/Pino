var express = require('express')
var passport = require('passport')

// init router for auth
const router = express.Router()

router.get('/login', function (req, res) {

    if (req.user) res.redirect('/dashboard') // if auth
    else res.redirect('/auth/login/google') // if not auth

})

/**
 * Redirect dopo il Login
 */
router.get('/login/google', passport.authenticate("google", {
    scope: ['profile', "https://www.googleapis.com/auth/drive.file", "email"]
}))

/**
 * Callback che mi arriva da Google con il Token.
 * Gestisco la autenticazione con Passport
 */
router.get('/google/redirect', passport.authenticate('google'), function (req, res) {
    res.redirect('/dashboard')
})

// logout
router.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/')
})

module.exports = router