/**
 * Questa app.js è la App Express principale. 
 * Gestisce EJS 
 * Gestisce tutte le mini-app collegate (telegram,dashboard)
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var fileUpload = require('express-fileupload')

/**
 * Route
 */
var authRouter = require('./routes/auth');
var telegramManager = require('./routes/telegram');


var app = express();

/**
 * Setup EJS 
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * Specifico i Middleware di AppExpress.use()
 */
app.use(logger('dev'));
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())
app.use(passport.session())
app.use(fileUpload())

app.use('/auth', authRouter) // auth
app.use(telegramManager); //la route corrispondente è gestita nel module.export() in Telegram.js


/**
 * Gestione e visualizzazione errori
 */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
