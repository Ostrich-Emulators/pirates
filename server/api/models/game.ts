import { Player } from '../../../common/model/player';
import { Location } from '../../../common/model/location';
import { Rectangle } from '../../../common/model/rectangle';
import { Pirate } from '../../../common/model/pirate';
import { ShipType } from '../../../common/model/ship-type.enum';
import { ShipDefinition } from '../../../common/model/ship-definition';
import { Ship } from '../../../common/model/ship';

export class Game {
    private whirlpoolloc: Location = null;
    private seamonsterloc: Location = null;
    private players: Map<string, Player> = new Map<string, Player>();
    private nonplayerships: Ship[] = [];

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

    getPlayers(): Player[]{
        var p: Player[] = [];
        this.players.forEach((player) => { 
            p.push(player);
        });
        return p;
    }

    getPlayer(id: string): Player {
        return this.players.get(id);
    }

    addPlayer(pirate: Pirate) :Player {
        var type = ShipType.SMALL;

        var playerid: number = this.players.size + 1;

        var ship = this.createShip(playerid + '-1', pirate.avatar, type );
        var player: Player = new Player(playerid.toString(), pirate, ship);
        this.players.set(playerid.toString(), player);
        this.addShipToCollisionSystem(ship);
        return player;
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
                    speed: 0.6,
                    manueverability: 25,
                    hull: 10
                };
        }
    }

    createShip(id: string, avatar:string, type: ShipType) :Ship {
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

    /**
     * Generates the given number of Non-Player-Ships
     */
    generateNonPlayerShips( ships:number ) {
        for (var i = 0; i < ships; i++){
            var ship = this.createShip((-i - 1) + '-1', "/assets/galleon.svg", ShipType.SMALL);
            ship.gold = Math.floor(Math.random() * 20);
            ship.location.x = Math.floor(Math.random() * 100 + 50);
            ship.location.y = Math.floor(Math.random() * 200 + 50);
            this.nonplayerships.push(ship);
            this.addShipToCollisionSystem(ship);
        }
    }

    getNonPlayerShips(): Ship[]{
        return this.nonplayerships;
    }

    iscollision(rect: Rectangle, otherrect: Rectangle) {
        return (rect.x < otherrect.x + otherrect.width && rect.x + rect.width > otherrect.x &&
            rect.y < otherrect.y + otherrect.height && rect.y + rect.height > otherrect.y);
    }

    start() {
        var my: Game = this;
        console.log('starting game loop');
        var updateShipLocation = function (ship: Ship) {
            if (!ship.anchored) {
                ship.location.x += ship.course.speedx;
                ship.location.y += ship.course.speedy;

                if (Math.abs(ship.location.x - ship.course.dstx) < 1
                    && Math.abs(ship.location.y - ship.course.dsty) < 1) {
                    ship.anchored = true;
                }
            }

            // see if the ship hit the whirlpool
            if (null != my.whirlpoolloc) {
                var whirlrec: Rectangle = { x: my.whirlpoolloc.x, y: my.whirlpoolloc.y, height: 48, width: 89 };
                if (my.iscollision({ x: ship.location.x, y: ship.location.y, height: 24, width: 24 }, whirlrec)) {
                    var loc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];

                    console.log('captured by the whirlpool!');
                    ship.location.x = loc.x;
                    ship.location.y = loc.y;
                }
            }
        }

        /**
         * Checks for collisions between ships, and also sea monster, whirlpool
         * @param ship
         */
        var checkCollisions = function ( allships:Map<Ship, Rectangle> ) {
            var revshipslkp: Map<Rectangle, Ship> = new Map<Rectangle, Ship>();
            allships.forEach((rect: Rectangle, ship:Ship) => {
                revshipslkp.set(rect, ship);
            });

            allships.forEach((rect: Rectangle, ship: Ship) => {
                // see if the ship hit the seamonster
                if (null != my.seamonsterloc) {
                    var monsterrect: Rectangle = { x: my.seamonsterloc.x, y: my.seamonsterloc.y, height: 55, width: 144 };
                    if (my.iscollision(rect, monsterrect)) {
                        console.log('seamonster strike!');
                        ship.crew.count -= 1;
                    }
                }

                revshipslkp.forEach((other: Ship, otherrect: Rectangle) => { 
                    if (other != ship) { // can't collide with myself
                        if (my.iscollision( rect, otherrect ){
                            // The objects are touching
                            //console.log(ship.id + ' collided with ' + other.id + '!');
                            ship.anchored = true;
                        }
                    }
                });
            });
        }

        setInterval(function () {
            var allships: Map<Ship, Rectangle> = new Map<Ship, Rectangle>();
            my.players.forEach(player => { 
                updateShipLocation(player.ship);
                allships.set(player.ship, {
                    x: player.ship.location.x,
                    y: player.ship.location.y,
                    height: 24,
                    width:24
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

            checkCollisions( allships );

        }, 100);

        my.whirlpoolloc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
        my.seamonsterloc = my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)];

        setInterval(function () {
            if (Math.random() < my.WPCT) {
                my.whirlpoolloc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
            }
            else { 
                my.whirlpoolloc = null;
            }
            if (Math.random() < my.MPCT) {
                my.seamonsterloc = my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)];
            }
            else {
                my.seamonsterloc = null;
            }
         }, 50000 );

    }
}