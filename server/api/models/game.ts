import { Player } from '../../../common/model/player'
import { Location } from '../../../common/model/location'
import { Rectangle } from '../../../common/model/rectangle'
import { Circle } from '../../../common/model/circle'
import { Pirate } from '../../../common/model/pirate'
import { ShipType } from '../../../common/model/ship-type.enum'
import { ShipDefinition } from '../../../common/model/ship-definition'
import { Ship } from '../../../common/model/ship'
import { CollisionBody } from '../../../common/model/body'
import { Collider } from '../../../common/tools/collider'
import { SeaMonster } from './seamonster'
import { ShipPair } from '../../../common/model/ship-pair'
import { CombatEngine } from '../combat/combat-engine'
import { Names } from '../models/names'

var jimp = require('jimp')

export class Game {
    private SHIP_RADIUS: number = 15;
    private POOL_RADIUS: number = 30;
    private MONSTER_RADIUS: number = 25;
    poolloc: Location = null;
    monsterloc: Location = null;
    private monster: SeaMonster;
    private players: Map<string, Player> = new Map<string, Player>();
    private nonplayerships: Ship[] = [];
    private collider: Collider = new Collider();
    private monsterships: Ship[] = [];
    private mapguide: any;
    private messages: Map<string, string[]> = new Map<string, string[]>(); // playerid, messages
    private fireQueue: ShipPair[] = [];
    private boardQueue: ShipPair[] = [];
    private combat: Map<string, ShipPair[]> = new Map<string, ShipPair[]>(); // playerid, firings
    private combatengine: CombatEngine = new CombatEngine();

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

        var playernumber: number = this.players.size + 1;

        var ship = this.createShip(playernumber + '-1', pirate.avatar, type);
        ship.captain = pirate.name;
        ship.name = Names.ship();
        var player: Player = new Player(playernumber.toString(), pirate, ship);
        this.players.set(player.id, player);
        this.messages.set(player.id, []);
        this.addShipToCollisionSystem(ship);
        return player;
    }

    setImage(img) {
        this.mapguide = img;
    }

    addShipToCollisionSystem(ship: Ship) {
        var radius = this.SHIP_RADIUS;
        this.collider.add({
            id: ship.id,
            src: ship,
            getX: function (): number { return ship.location.x },
            getY: function (): number { return ship.location.y },
            getR: function (): number { return radius }
        });
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
            crew: crew,
            name: Names.ship(),
            captain: Names.captain()
        };

        return ship;
    }

    debugImageTo(file: string):any {
        var img;
        var my: Game = this;

        return jimp.read('map.png').then(function (image) {
            img = image;
            //my.shipbodies.forEach(ship => {
            //    console.log('writing ship: ' + ship.src.id + ' at ' + JSON.stringify(rect));
            //    //image.scan(rect.x, rect.y, rect.width, rect.height, function (x, y, idx) {
            //    image.scan(ship.getX(), ship.getY(), 4, 4, function (x, y, idx) {
            //        image.bitmap.data[idx] = 0;
            //        image.bitmap.data[idx + 1] = 0;
            //        image.bitmap.data[idx + 2] = 0;
            //    });
            //});

            if (null != my.poolloc) {
                console.log('pool rect: ' + JSON.stringify(my.poolloc));
                var rect = my.poolloc;
                image.scan(rect.x, rect.y, 20, 20, function (x, y, idx) {
                    image.bitmap.data[idx] = 0x87;
                    image.bitmap.data[idx+1] = 0xAD;
                    image.bitmap.data[idx + 2] = 0x4F;
                });
            }
            if (null != my.monsterloc) {
                console.log('monster rect: ' + JSON.stringify(my.monsterloc));
                var rect = my.monsterloc;
                image.scan(rect.x, rect.y, 20, 20, function (x, y, idx) {
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
        console.log( 'generating '+ships+' new NPC ships')
        for (var i = 0; i < ships; i++) {
            var ship = this.createShip((-i - 1) + '-1', "/assets/galleon.svg", ShipType.SMALL);
            ship.gold = Math.floor(Math.random() * 20);
            ship.location.x = this.MLOCATIONS[Math.floor(Math.random() * this.MLOCATIONS.length)].x;
            ship.location.y = this.WLOCATIONS[Math.floor(Math.random() * this.WLOCATIONS.length)].y;
            this.nonplayerships.push(ship);
            this.addShipToCollisionSystem(ship);
        }
    }

    popMessages(pid: string): string[]{
        var msgs = (this.messages.has(pid) ? this.messages.get(pid) : []);
        this.messages.delete(pid);
        return msgs;
    }

    popCombat(pid: string): ShipPair[] {
        var msgs = (this.combat.has(pid) ? this.combat.get(pid) : []);
        this.combat.delete(pid);
        return msgs;
    }

    getNonPlayerShips(): Ship[] {
        return this.nonplayerships;
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

    pushMessage(player: Player | Ship | string, msg: string) {
        var id: string = '';
        if (typeof player === 'undefined' || null == player ) {
            return; // no message to send
        }
        if (typeof player === 'string') {
            id = player;
        }
        else if (player.hasOwnProperty('pirate')) {
            id = player.id;
        }
        else {
            this.players.forEach(p => {
                if (p.ship.id === player.id) {
                    id = p.id;
                }
            });
            if ('' === id) {
                return; // NPC ship
            }
        }
        
        if (!this.messages.has(id)) {
            this.messages.set(id, []);
        }
        this.messages.get(id).push(msg);
    }

    getPlayerForShip(s: Ship) {
        this.players.forEach(player => { 
            if (player.ship.id === s.id) {
                return player;
            }
        });
        return null;
    }

    fire(from: Ship, to: Ship) {
        this.fireQueue.push({ one: from, two: to });
    }

    board(from: Ship, to: Ship) {
        this.boardQueue.push({ one: from, two: to });
    }

    resolveCombat() {
        var my: Game = this;

        while (my.fireQueue.length > 0) {
            var pair = my.fireQueue.pop();
            my.combatengine.resolve(pair);

            my.players.forEach((p, k) => {
                if (!my.combat.has(k)) {
                    my.combat.set(k, []);
                }
                my.combat.get(k).push(pair);
            });
        }
    }

    start() {
        var my: Game = this;
        console.log('starting game loop');
        var updateShipLocation = function (ship: Ship, player?: Player) {
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
                        if (player) {
                            my.pushMessage(player, "We've run aground!")
                        }
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

        var checkShipCollisions = function () {
            my.collider.getCollisions().forEach(en => {
                if (!('whirlpool' === en.first.id || 'whirlpool' === en.second.id
                    || 'monster' === en.first.id || 'monster' === en.second.id)) {
                    // do anything here?

                    //my.pushMessage(en.first.src, 'encountered ship!');
                    //my.pushMessage(en.second.src, 'encountered ship!');
                }
            });
        }

        var checkMonster = function () {
            if (null != my.monsterloc) {
                var monster: CollisionBody = my.collider.get('monster');
                my.collider.checkCollisions( monster ).forEach(body => { 
                    my.pushMessage(body.src, 'Sea Monster Strike!');
                    my.monsterships.push(body.src);
                    body.src.anchored = true;
                });
            }
        }

        var checkWhirlpool = function (){
            if (null != my.poolloc) {
                var poolcircle: CollisionBody = my.collider.get('whirlpool');
                my.collider.checkCollisions(poolcircle).forEach(body => { 
                    my.pushMessage(body.src, 'Captured by the whirlpool!');
                    var loc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
                    body.src.location.x = loc.x;
                    body.src.location.y = loc.y;
                });
            }
        }

        setInterval(function () {
            my.resolveCombat();

            my.players.forEach(player => {
                var ship = player.ship;
                updateShipLocation(ship, player );
            });
            my.nonplayerships.forEach((ship: Ship) => {
                updateShipLocation(ship);
            });

            checkWhirlpool();
            checkMonster();
            checkShipCollisions();
        }, 100);

        my.poolloc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
        my.collider.add({
            id: 'whirlpool',
            getX: function (): number { return my.poolloc.x; },
            getY: function (): number { return my.poolloc.y; },
            getR: function (): number { return my.POOL_RADIUS; }
        });
        my.monsterloc = my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)];
                my.collider.add({
                    id: 'monster',
                    getX: function (): number { return my.monsterloc.x; },
                    getY: function (): number { return my.monsterloc.y; },
                    getR: function (): number { return my.MONSTER_RADIUS; }
                });

        setInterval(function () {
            my.collider.remove('whirlpool');
            if (Math.random() < my.WPCT) {
                my.poolloc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)]
                my.collider.add({
                    id: 'whirlpool',
                    getX: function (): number { return my.poolloc.x; },
                    getY: function (): number { return my.poolloc.y; },
                    getR: function (): number { return my.POOL_RADIUS; }
                });
            }
            else {
                my.poolloc = null;
            }
            
            my.collider.remove('monster');
            if( Math.random() < my.MPCT ){
                my.monsterloc = my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)];
                my.collider.add({
                    id: 'monster',
                    getX: function (): number { return my.monsterloc.x; },
                    getY: function (): number { return my.monsterloc.y; },
                    getR: function (): number { return my.MONSTER_RADIUS; }
                });
            }
            else {
                my.poolloc = null;
            }
        }, 600000);
    }
}