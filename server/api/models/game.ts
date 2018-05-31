import { Player } from '../../../common/model/player';
import { Location } from '../../../common/model/location';
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
        { x: 404, y: 587 },
        { x: 108, y: 386 },
        { x: 211, y: 183 }];
    private MPCT: number = 0.5;
    private WPCT: number = 0.5;

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

        return player;
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
            ship.location.x = Math.floor(Math.random() * 100);
            ship.location.y = Math.floor(Math.random() * 200);
            this.nonplayerships.push( ship );
        }
    }

    getNonPlayerShips(): Ship[]{
        return this.nonplayerships;
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
        }

        setInterval(function () {
            my.players.forEach(player => { 
                updateShipLocation(player.ship);
            });
            my.nonplayerships.forEach((ship: Ship) => { 
                updateShipLocation(ship);
            });
        }, 100);
        
        setInterval(function () {
            if (Math.random() < my.WPCT) {
                my.whirlpoolloc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
                console.log('whirlpool opened at ' + JSON.stringify(my.whirlpoolloc));
            }
            else { 
                my.whirlpoolloc = null;
            }
            if (Math.random() < my.MPCT) {
                my.seamonsterloc = my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)];
                console.log('sea monster spotted at ' + JSON.stringify(my.seamonsterloc));
            }
            else {
                my.seamonsterloc = null;
            }
         }, 5000 );

    }
}