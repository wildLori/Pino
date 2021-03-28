var express = require('express');
var router_login = express.Router();

/* GET home page. */
router_login.get('/', function(req, res, next) {
  res.render('login', { title : "sku"});
});

module.exports = router_login;