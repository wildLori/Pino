const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
require('dotenv').config({ path: path.resolve(__dirname, '../private/.env') })

/**
 * Dati dell'account di Google Drive
 */

const OAuthClient
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; //Callback
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2( //Il mio Oggetto che espone i dati del client
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI //Callback, Redirect
);

/**
 * Come uso passport?
 * 1. Indico la mia strategy : Google Strategy
 * 2. Gli do tutti i parametri : Client ID, ClientSecret,Callback, ecc.
 */
passport.use(
    // google login
    new GoogleStrategy(
        // google keys
        {
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: REDIRECT_URI,
            passReqToCallback: true

        }, (request, accessToken, refreshToken, profile, done) => {

            /**
             * TODO: Qua, quando effetto l'Auth con Passport, devo registrare lo user e i suoi dati nel DB
             */
            //save data in session
            user = {
                "accesstoken": accessToken,
                'googleID': profile.id,
                'name': profile.displayName,
                'pic_url': profile._json.picture,
                'email': profile._json.email
            }

            done(null, user)
        }
    )
)

passport.serializeUser((user, done) => {

    let sessionUser = {
        _id: user.googleID,
        accessToken: user.accesstoken,
        name: user.name,
        pic_url: user.pic_url,
        email: user.email
    }

    done(null, sessionUser)
})

// get cookie & get relevent session data
passport.deserializeUser((sessionUser, done) => {

    done(null, sessionUser) // now can access request.user
})