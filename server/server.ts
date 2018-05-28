
import * as express from "express";
var cors = require('cors')

import { Game } from "./api/models/game";
import { GameController } from "./api/controllers/game-controller";
import { ShipController } from './api/controllers/ship-controller';
import { Player } from "../common/model/player";

var port = process.env.PIRATEPORT || 30000;
var bodyParser = require('body-parser');


//var routes = require('./api/routes/routes');
//routes(app); //register the route

var app: express.Application = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var game: Game = new Game();
game.generateNonPlayerShips(3);
var shipcontroller: ShipController = new ShipController(game);
var gamecontroller: GameController = new GameController(game);

app.route('/ships')
    .get(function (req, res) {
        res.json(shipcontroller.all());
    })
app.route('/ships/:shipId')
    .get(function (req, res) {
        res.json(shipcontroller.one(req.params.shipId));
    });
app.route('/ships/:shipId/course')
    .post(function (req, res) {
        console.log(req.params.shipId);
        console.log(req.body);
        res.json(shipcontroller.sail(req.params.shipId, req.body));
    });

app.route('/players')
    .get(function (req, res) {
        res.json(gamecontroller.all());
    })
    .put(function (req, res) {
        console.log('into create player');
        console.log(req.body);
        var player: Player = gamecontroller.create(req.body);
        if (1 === game.getPlayers().length) {
            game.start();
        }
        res.json(player);
    })
    .post(function (req, res) {
        res.json(gamecontroller.create(req.body));
    });

app.route('/players/:playerId')
    .get(function (req, res) {
        res.json(gamecontroller.one(req.params.playerId));
    });
app.route('/game/status')
    .get(function (req, res) {
        res.json(game);
    });

app.listen(port, function () {
    console.log('pirates are restles on port: ' + port);
});


