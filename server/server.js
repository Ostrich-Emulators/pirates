var express = require('express');
var app = express();
var port = process.env.PIRATEPORT || 30000;
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/routes');
routes(app); //register the route

app.listen(port);

console.log('pirates are restles on port: ' + port);

