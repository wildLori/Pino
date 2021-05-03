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
var fileUpload = require('express-fileupload')
var favicon = require('serve-favicon');

/**
 * Route
 */
var telegramManager = require('./routes/telegram');
var officina = require('./routes/officina');
var auth = require('./routes/auth');
var cli = require('./routes/cli');

var app = express();

/**
 * Setup EJS 
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * Specifico i Middleware di AppExpress.use()
 */
//app.use(express.json());
// app.use(cookieParser())
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload())
app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.use('/auth', auth)
app.use('/officina', officina)
app.use('/cli', cli)
app.use(telegramManager); //la route corrispondente è gestita nel module.export() in Telegram.js

app.get('/', function (req, res) {
  res.redirect('/auth');
})

/**
 * Gestione e visualizzazione errori
 */
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err) {
    console.log(err);
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;