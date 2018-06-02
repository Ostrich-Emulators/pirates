import { Player } from '../../../common/model/player';
import { Location } from '../../../common/model/location';
import { Rectangle } from '../../../common/model/rectangle';
import { Pirate } from '../../../common/model/pirate';
import { ShipType } from '../../../common/model/ship-type.enum';
import { ShipDefinition } from '../../../common/model/ship-definition';
import { Ship } from '../../../common/model/ship';
import { SeaMonster } from './seamonster';

var jimp = require('jimp')

export class Game {
    private poolrect: Rectangle = null;
    private monsterrect: Rectangle = null;
    private monster: SeaMonster;
    private players: Map<string, Player> = new Map<string, Player>();
    private nonplayerships: Ship[] = [];
    private monsterships: Ship[] = [];
    private mapguide: any;

    private WLOCATIONS: Location[] = [
        { x: 313, y: 316 },
        { x: 102, y: 284 },
        { x: 333, y: 581 },
        { x: 464, y: 129 }];

    private MLOCATIONS: Location[] = [
        { x: 385, y: 587 },
        { x: 108, y: 386 },
        { x: 200, y: 183 }];
    private MPCT: number = 0.9;
    private WPCT: number = 0.9;

    getPlayers(): Player[] {
        var p: Player[] = [];
        this.players.forEach((player) => {
            p.push(player);
        });
        return p;
    }

    getPlayer(id: string): Player {
        return this.players.get(id);
    }

    addPlayer(pirate: Pirate): Player {
        var type = ShipType.SMALL;

        var playerid: number = this.players.size + 1;

        var ship = this.createShip(playerid + '-1', pirate.avatar, type);
        var player: Player = new Player(playerid.toString(), pirate, ship);
        this.players.set(playerid.toString(), player);
        this.addShipToCollisionSystem(ship);
        return player;
    }

    setImage(img) {
        this.mapguide = img;
    }

    addShipToCollisionSystem(ship: Ship) {

    }

    shipdef(type: ShipType): ShipDefinition {
        switch (type) {
            case (ShipType.BIG):
                return {
                    cannons: 15,
                    crewsize: 50,
                    storage: 1000,
                    speed: 0.2,
                    manueverability: 5,
                    hull: 40
                };
            case (ShipType.MEDIUM):
                return {
                    cannons: 10,
                    crewsize: 20,
                    storage: 500,
                    speed: 0.4,
                    manueverability: 15,
                    hull: 20
                };
            case (ShipType.SMALL):
                return {
                    cannons: 4,
                    crewsize: 10,
                    storage: 250,
                    speed: 1,
                    manueverability: 25,
                    hull: 10
                };
        }
    }

    createShip(id: string, avatar: string, type: ShipType): Ship {
        var def: ShipDefinition = this.shipdef(type);

        var crew = {
            count: def.crewsize,
            meleeSkill: 25,
            sailingSkill: 25
        };

        var ship: Ship = {
            id: id,
            type: type,
            cannons: 2,
            speed: def.speed,
            manueverability: def.manueverability,
            hullStrength: def.hull,
            sailQuality: 35,
            food: 50,
            ammo: 20,
            avatar: avatar,
            storage: def.storage,
            location: { x: 100, y: 200 },
            anchored: true,
            crew: crew
        };

        return ship;
    }

    debugImageTo(file: string):any {
        var img;
        var my: Game = this;
        var allships: Map<Ship, Rectangle> = new Map<Ship, Rectangle>();
        this.players.forEach(player => {
            allships.set(player.ship, {
                x: player.ship.location.x,
                y: player.ship.location.y,
                height: 24,
                width: 24
            });
        });
        this.nonplayerships.forEach((ship: Ship) => {
            allships.set(ship, {
                x: ship.location.x,
                y: ship.location.y,
                height: 24,
                width: 24
            });
        });

        return jimp.read('map.png').then(function (image) {
            img = image;
            allships.forEach((rect, ship) => {
                console.log('writing ship: ' + ship.id + ' at ' + JSON.stringify(rect));
                //image.scan(rect.x, rect.y, rect.width, rect.height, function (x, y, idx) {
                image.scan(rect.x, rect.y, 3, 3, function (x, y, idx) {
                    image.bitmap.data[idx] = 0;
                    image.bitmap.data[idx + 1] = 0;
                    image.bitmap.data[idx + 2] = 0;
                });
            });

            if (null != my.poolrect) {
                console.log('pool rect: ' + JSON.stringify(my.poolrect));
                var rect = my.poolrect;
                image.scan(rect.x, rect.y, rect.width, rect.height, function (x, y, idx) {
                    image.bitmap.data[idx] = 0x87;
                    image.bitmap.data[idx+1] = 0xAD;
                    image.bitmap.data[idx + 2] = 0x4F;
                });
            }
            if (null != my.monsterrect) {
                console.log('monster rect: ' + JSON.stringify(my.monsterrect));
                var rect = my.monsterrect;
                image.scan(rect.x, rect.y, rect.width, rect.height, function (x, y, idx) {
                    image.bitmap.data[idx] = 0xDC;
                    image.bitmap.data[idx + 1] = 0x91;
                    image.bitmap.data[idx + 2] = 0x58;
                });
            }

            return image.write(file);
        });
    }

    /**
     * Generates the given number of Non-Player-Ships
     */
    generateNonPlayerShips(ships: number) {
        console.log('not generating NPC ships (refusing!)');

        for (var i = 0; i < ships; i++) {
            var ship = this.createShip((-i - 1) + '-1', "/assets/galleon.svg", ShipType.SMALL);
            ship.gold = Math.floor(Math.random() * 20);
            ship.location.x = Math.floor(Math.random() * 100 + 50);
            ship.location.y = Math.floor(Math.random() * 200 + 50);
            //this.nonplayerships.push(ship);
            //this.addShipToCollisionSystem(ship);
        }
    }

    getNonPlayerShips(): Ship[] {
        return this.nonplayerships;
    }

    iscollision(rect: Rectangle, otherrect: Rectangle) {
        return (rect.x < otherrect.x + otherrect.width && rect.x + rect.width > otherrect.x &&
            rect.y < otherrect.y + otherrect.height && rect.y + rect.height > otherrect.y);
    }

    isnavigable(pixel): boolean {
        return (this.iswater(pixel) || this.iscity(pixel));
    }
    iswater(pixel): boolean {
        return (0xFFFF == pixel || 0xFF0000FF == pixel);
    }

    isinland(pixel): boolean {
        return (0xFF == pixel );
    }
    iscity(pixel) :boolean {
        return (0xFF00FF == pixel);
    }
    isoutofbounds(pixel): boolean {
        return (0xFFFFFFFF == pixel);
    }

    start() {
        var my: Game = this;
        console.log('starting game loop');
        var updateShipLocation = function (ship: Ship) {
            if (!ship.anchored) {
                var newx = ship.location.x + ship.course.speedx;
                var newy = ship.location.y + ship.course.speedy;

                var pixel = my.mapguide.getPixelColor(newx, newy);
                if (my.isnavigable(pixel)) {
                    ship.location.x = newx;
                    ship.location.y = newy;
                }
                else {
                    ship.anchored = true;
                    if (my.isinland(pixel)) {
                        ship.hullStrength -= 1;
                    }
                }

                // if we overshoot our dst, stop
                if (((ship.course.speedx < 0 && ship.location.x < ship.course.dstx) ||
                    (ship.course.speedy > 0 && ship.location.x > ship.course.dstx)) &&
                    ((ship.course.speedy < 0 && ship.location.y < ship.course.dsty) ||
                    (ship.course.speedy > 0 && ship.location.y > ship.course.dsty ) ) ){
                    ship.anchored = true;
                    // move ship exactly to our dst (just tidying up a bit)
                    //ship.location.x = ship.course.dstx;
                    //ship.location.y = ship.course.dsty;
                }
            }
        }

        var checkShipCollisions = function (allships: Map<Ship, Rectangle>) {
            var revshipslkp: Map<Rectangle, Ship> = new Map<Rectangle, Ship>();
            allships.forEach((rect: Rectangle, ship: Ship) => {
                revshipslkp.set(rect, ship);
            });

            allships.forEach((rect: Rectangle, ship: Ship) => {
                revshipslkp.forEach((other: Ship, otherrect: Rectangle) => {
                    if (other != ship) { // can't collide with myself
                        if (my.iscollision(rect, otherrect) ){
                            // The objects are touching
                            //console.log(ship.id + ' collided with ' + other.id + '!');
                            ship.anchored = true;
                        }
                    }
                });
            });
        }

        var checkMonster = function (allships: Map<Ship, Rectangle>) {
            if (null != my.monsterrect) {
                my.monsterships = [];
                allships.forEach((rect: Rectangle, ship: Ship) => {
                    var shiprect: Rectangle = { x: rect.x - 1, y: rect.y - 1, height: 2, width: 2 };
                    if (my.iscollision(shiprect, my.monsterrect)) {
                        my.monsterships.push(ship);
                        ship.anchored = true;
                    }
                });
            }
        }

        var checkWhirlpool = function (allships: Map<Ship, Rectangle>) {
            if (null != my.poolrect) {
                allships.forEach((rect: Rectangle, ship: Ship) => {
                    var shiprect: Rectangle = { x: rect.x - 1, y: rect.y - 1, height: 2, width: 2 };

                    if (my.iscollision(shiprect, my.poolrect)) {
                        console.log('captured by the whirlpool!');
                        console.log('poolrect: ' + JSON.stringify(my.poolrect));
                        console.log('shiprect: ' + JSON.stringify(shiprect));

                        var loc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
                        ship.location.x = loc.x;
                        ship.location.y = loc.y;
                    }
                });
            }
        }

        setInterval(function () {
            var allships: Map<Ship, Rectangle> = new Map<Ship, Rectangle>();
            my.players.forEach(player => {
                updateShipLocation(player.ship);
                allships.set(player.ship, {
                    x: player.ship.location.x,
                    y: player.ship.location.y,
                    height: 24,
                    width: 24
                });
            });
            my.nonplayerships.forEach((ship: Ship) => {
                updateShipLocation(ship);
                allships.set(ship, {
                    x: ship.location.x,
                    y: ship.location.y,
                    height: 24,
                    width: 24
                });
            });

            checkWhirlpool(allships);
            checkMonster(allships);
            checkShipCollisions(allships);
        }, 100);

        var poolloc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
        var monsterloc = my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)];
        my.poolrect = { x: poolloc.x - 20, y: poolloc.y - 15, width: 40, height: 30 };
        my.monsterrect = { x: monsterloc.x - 15, y: monsterloc.y - 15, width: 30, height: 30 };

        setInterval(function () {
            if (Math.random() < my.WPCT) {
                var poolloc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
                my.poolrect = { x: poolloc.x - 20, y: poolloc.y - 15, width: 40, height: 30 };
            }
            else {
                my.poolrect = null;
            }
            if (Math.random() < my.MPCT) {
                var monsterloc = my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)];
                my.monsterrect = { x: monsterloc.x - 15, y: monsterloc.y - 15, width: 30, height: 30 };
                my.monster = { attack: 1, defense: 1, health: 1, power: 0.5, attackers: [] };
            }
            else {
                my.monsterrect = null;
                my.monster = null;
            }
        }, 600000);

    }
}