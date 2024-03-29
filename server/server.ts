
import * as express from "express"
var cors = require('cors')
var jimp = require('jimp')
var bodyParser = require('body-parser')

import { Game } from "./api/engine/game"
import { GameController } from "./api/controllers/game-controller";
import { ShipController } from './api/controllers/ship-controller';

var port = process.env.PIRATEPORT || 30000;


//var routes = require('./api/routes/routes');
//routes(app); //register the route

var app: express.Application = express();
app.use(cors());
app.options('*', cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var game: Game = new Game();
var shipcontroller: ShipController = new ShipController(game);
var gamecontroller: GameController = new GameController(game);

app.route('/mapimg')
    .get(function (req, res) {
        var file = '/tmp/img.png';
        game.debugImageTo(file).then(function () { 
            res.sendFile('/tmp/img.png');
        });
    })
app.route('/ships')
    .get(function (req, res) {
        res.json(shipcontroller.all());
    });
app.route('/ships/:shipId')
    .get(function (req, res) {
        res.json(shipcontroller.one(req.params.shipId));
    });
app.route('/ships/:shipId/course')
    .post(function (req, res) {
        console.log(req.params.shipId + ' course to ' + JSON.stringify(req.body));
        res.json(shipcontroller.sail(req.params.shipId, req.body));
    });
app.route('/ships/:shipId/fire')
    .post(function (req, res) {
        res.json(shipcontroller.fire(req.params.shipId, req.body.targetid));
    });
app.route('/ships/:shipId/undock')
    .post(function (req, res) {
        res.json(shipcontroller.undock(req.params.shipId));
    });
app.route('/ships/:shipId/board')
    .post(function (req, res) {
        res.json(shipcontroller.board(req.params.shipId, req.body.targetid));
    });
app.route('/ships/:shipId/buy')
    .post(function (req, res) {
        res.json(shipcontroller.buy(req.params.shipId, req.body));
    });

app.route('/players')
    .get(function (req, res) {
        res.json(gamecontroller.all());
    })
    .put(function (req, res) {
        console.log('into create player');
        console.log(req.body);
        var playerAndShip = gamecontroller.create(req.body);
        if (!game.isStarted()) {
            game.start();
        }

        shipcontroller.refreshShips();
        res.json(playerAndShip);
    })
    .post(function (req, res) {
        res.json(gamecontroller.create(req.body));
    });

app.route('/players/:playerId')
    .get(function (req, res) {
        res.json(gamecontroller.one(req.params.playerId));
    });

app.route('/players/:playerId/ships')
    .get(function (req, res) {
        res.json(shipcontroller.shipFor(req.params.playerId));
    });

app.route('/game/status/:playerId')
    .get(function (req, res) {
        res.json(gamecontroller.status(req.params.playerId));
    });

Promise.all([
    jimp.read('whirlpool-guide.png'),
    jimp.read('monster-guide.png'),
    jimp.read('map-guide.png')
]).then(images => { 
    game.setWhirlpoolGuideImage(images[0]);
    game.setMonsterGuideImage(images[1]);
    game.setImage(images[2]);
    game.generateAiPlayers(2);
    app.listen(port, function () {
        console.log('pirates are restless on port: ' + port);
    });
});
