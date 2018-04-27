
import * as express from "express";
import { ShipController } from './api/controllers/ship-controller';

var port = process.env.PIRATEPORT || 30000;
var bodyParser = require('body-parser');


//var routes = require('./api/routes/routes');
//routes(app); //register the route

var app: express.Application = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var ships: ShipController = new ShipController();

app.route('/ships').get(function (req, res) {
    res.json(ships.all());
}).put(function (req, res) { 
    res.json( ships.create(req.body) );
});
app.route('/ships/:shipId').get(function (req, res) {
    res.json(ships.one(req.params.shipId));
 });

app.listen(port, function () {
    console.log('pirates are restles on port: ' + port);
});


