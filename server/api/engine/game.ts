import { Player } from '../../../common/model/player'
import { Location } from '../../../common/model/location'
import { Pirate } from '../../../common/model/pirate'
import { ShipType } from '../../../common/model/ship-type.enum'
import { ShipDefinition } from '../../../common/model/ship-definition'
import { Ship } from '../../../common/model/ship'
import { CollisionBody } from '../../../common/model/body'
import { Collider } from '../../../common/tools/collider'
import { ShipPair } from '../../../common/model/ship-pair'
import { Names } from '../../../common/tools/names'
import { CombatResult } from '../../../common/model/combat-result';
import { BoardResult, BoardCode } from '../../../common/model/board-result';
import { City } from '../../../common/model/city'
import { Calculators } from '../../../common/tools/calculators';
import { ShipAi } from './ship-ai';
import { CombatEngine } from './combat-engine'
import { PurchaseEngine } from './purchase-engine'
import { ShipCannon } from '../../../common/model/ship-cannon';
import { Crew } from '../../../common/model/crew';
import { MapEngine } from './map-engine';
import { ShipUtils } from '../../../common/tools/ship-utils';
import { CityCannon } from '../../../common/model/city-cannon'

export class Game {
    private TURN_NUM: number = 0;
    private SHIP_RADIUS: number = 15;
    private POOL_RADIUS: number = 30;
    private MONSTER_RADIUS: number = 25;
    poolloc: Location = { x: -10000, y: -10000 };
    monsterloc: Location = { x: -20000, y: -20000 };
    private monsterbody: CollisionBody;
    private poolbody: CollisionBody;
    private players: Map<string, Player> = new Map<string, Player>();
    private nonplayerships: Ship[] = [];
    private playerships: Ship[] = [];
    cities: City[] = [];
    private messages: Map<string, string[]> = new Map<string, string[]>(); // playerid, messages
    private fireQueue: ShipPair[] = [];
    private boardQueue: ShipPair[] = [];
    private combat: Map<string, CombatResult[]> = new Map<string, CombatResult[]>(); // playerid, results
    private boarding: Map<string, BoardResult[]> = new Map<string, BoardResult[]>(); // playerid, results
    private combatengine: CombatEngine = new CombatEngine(this);
    private ai: ShipAi = new ShipAi(this, this.combatengine);
    training: PurchaseEngine = new PurchaseEngine();
    private specialscollider: Collider = new Collider();
    private shipcollider: Collider = new Collider();
    map: MapEngine = new MapEngine();

    private WLOCATIONS: Location[] = [
        { x: 313, y: 316 },
        { x: 102, y: 284 },
        { x: 333, y: 581 },
        { x: 464, y: 129 }];

    private MLOCATIONS: Location[] = [
        { x: 385, y: 587 },
        { x: 108, y: 386 },
        { x: 200, y: 183 }];
    private MPCT: number = 1;
    private WPCT: number = 1;

    get TURN(): number {
        return this.TURN_NUM;
    }

    get pships(): Ship[]{
        return this.playerships;
    }

    constructor() {
        console.log( 'into game ctor')
        var CITYLOCATIONS: Location[] = [
            { x: 532, y: 82 },
            { x: 289, y: 202 },
            { x: 307, y: 497 }
        ];
        
        var names: string[] = Names.city(CITYLOCATIONS.length);

        this.cities.push(...CITYLOCATIONS.map((loc, idx) => {
            var cmap: CityCannon[] = [
                { firepower: 1, reloadspeed: 15, range: 60, cost: Math.random() * 5 + 5 },
                { firepower: 2, reloadspeed: 15, range: 45, cost: Math.random() * 15 + 10 },
                { firepower: 1, reloadspeed: 15, range: 75, cost: Math.random() * 15 + 10 },
                { firepower: 3, reloadspeed: 25, range: 50, cost: Math.random() * 15 + 25 }
            ];

            return {
                name: names[idx],
                location: loc,
                melee: Math.random() * 20 + 10,
                hull: Math.random() * 20 + 20,
                sail: Math.random() * 15 + 20,
                sailing: Math.random() * 50 + 50,
                ammo: Math.random() * 1 + 1,
                cannon: cmap
            };
        }));

        console.log(JSON.stringify(this.cities));
    }

    setImage(img) {
        this.map.setImage(img);
    }

    getPlayers(): Player[] {
        var p: Player[] = [];
        this.players.forEach((player) => {
            p.push(player);
        });
        return p;
    }

    debugImageTo(file: string): Promise<any>{
        return this.map.debugImageTo(file, this, this.specialscollider,
            this.monsterbody, this.poolbody);
    }

    getPlayer(id: string): Player {
        return this.players.get(id);
    }

    addPlayer(pirate: Pirate, shipname: string, color: string): Player {
        var playernumber: number = this.players.size + 1;

        var player: Player = new Player(playernumber.toString(), pirate, color);
        this.players.set(player.id, player);
        this.messages.set(player.id, []);

        this.allocateNewShip(player, ShipType.SMALL, 1, shipname);
        return player;
    }

    addShipToCollisionSystem(ship: Ship) {
        var radius = this.SHIP_RADIUS;
        this.specialscollider.add({
            id: ship.id,
            src: ship,
            getX: function (): number { return ship.location.x },
            getY: function (): number { return ship.location.y },
            getR: function (): number { return radius }
        });

        this.shipcollider.add({
            id: ship.id,
            src: ship,
            getX: function (): number { return ship.location.x },
            getY: function (): number { return ship.location.y },
            getR: function (): number { return radius / 2 }
        });


    }

    createShip(id: string, avatar: string, type: ShipType, owner?: string): Ship {
        var def: ShipDefinition = ShipUtils.shipdef(type);

        var crew: Crew = {
            count: def.crewsize,
            meleeSkill: 25,
            sailingSkill: 25
        };

        var cannons: ShipCannon = {
            firepower: 1,
            reloadspeed: 15,
            range: 60,
            count: def.maxcannons
        };

        var ship: Ship = {
            id: id,
            ownerid: (owner ? owner : null ),
            type: type,
            cannons: cannons,
            speed: def.speed,
            manueverability: def.manueverability,
            hullStrength: def.hull,
            sailQuality: 35,
            food: 50,
            ammo: 120,
            gold: 0,
            avatar: avatar,
            storage: def.storage,
            location: { x: 100, y: 200 },
            anchored: true,
            crew: crew,
            name: Names.ship(),
            captain: Names.captain(Math.random() < 0.5)
        };

        return ship;
    }

    /**
     * Generates the given number of Non-Player-Ships
     */
    generateNonPlayerShips(ships: number) {
        console.log('generating ' + ships + ' new NPC ships')
        var ship = this.createShip('-100-1', "/assets/galleon.svg", ShipType.SMALL);
        ship.gold = Math.floor(Math.random() * 20);
        ship.cannons.range = 40;
        ship.ammo = 20;
        ship.cannons.count = 3;
        ship.cannons.reloadspeed = 50;
        ship.location.x = 130;
        ship.location.y = 210;
        this.nonplayerships.push(ship);
        this.addShipToCollisionSystem(ship);

        for (var i = 1; i < ships; i++) {
            var ship = this.createShip((-i - 1) + '-1', "/assets/galleon.svg", ShipType.SMALL);
            ship.gold = Math.floor(Math.random() * 20);
            ship.ammo = 20;
            ship.cannons.count = 3;
            ship.cannons.reloadspeed = 50;
            if (Math.random() < 0.5) {
                ship.location.x = this.MLOCATIONS[Math.floor(Math.random() * this.MLOCATIONS.length)].x;
                ship.location.y = this.MLOCATIONS[Math.floor(Math.random() * this.MLOCATIONS.length)].y;
            }
            else {
                ship.location.x = this.WLOCATIONS[Math.floor(Math.random() * this.WLOCATIONS.length)].x;
                ship.location.y = this.WLOCATIONS[Math.floor(Math.random() * this.WLOCATIONS.length)].y;
            }
            this.nonplayerships.push(ship);
            this.addShipToCollisionSystem(ship);
        }
    }

    popMessages(pid: string): string[] {
        var msgs = (this.messages.has(pid) ? this.messages.get(pid) : []);
        this.messages.delete(pid);
        return msgs;
    }

    popCombat(pid: string): CombatResult[] {
        var msgs = (this.combat.has(pid) ? this.combat.get(pid) : []);
        this.combat.delete(pid);
        return msgs;
    }

    popBoard(pid: string): BoardResult[] {
        var msgs = (this.boarding.has(pid) ? this.boarding.get(pid) : []);
        this.boarding.delete(pid);
        return msgs;
    }

    getNonPlayerShips(): Ship[] {
        return this.nonplayerships;
    }

    pushMessage(player: Player | Ship | string, msg: string) {
        var id: string = '';
        if (typeof player === 'undefined' || null == player) {
            return; // no message to send
        }
        if (typeof player === 'string') {
            id = player;
        }
        else if (player.hasOwnProperty('pirate')) {
            id = player.id;
        }
        else {
            this.playerships.forEach(ship => { 
                if (player.id === ship.id) {
                    id = ship.ownerid;
                }
            });
        }

        if ('' != id) {
            //console.log('message for ' + id);
            if (!this.messages.has(id)) {
                this.messages.set(id, []);
            }
            this.messages.get(id).push(msg);
        }
        // else NPC ship
    }

    getPlayerForShip(s: Ship) {
        this.players.forEach(player => {
            if (player.id === s.ownerid) {
                return player;
            }
        });
        return null;
    }

    getShipsForPlayer(pid: string) :Ship[]{
        return this.playerships.filter(s => s.ownerid === pid);
    }

    fire(from: Ship, to: Ship) {
        if (this.combatengine.readyToFire(from)) {
            this.fireQueue.push(new ShipPair( from, to ));
        }
        else {
            console.log(JSON.stringify(from) + ' not ready to fire!');
        }
    }

    board(from: Ship, to: Ship) {
        this.boardQueue.push(new ShipPair(from, to));
    }

    private static debugStringCombatResults(result: CombatResult): CombatResult {
        function stripper(s: Ship): Ship {
            // delete s.captain;
            // delete s.course;
            // delete s.name;
            // delete s.manueverability;
            // //delete s.location;
            // //delete s.speed;
            // delete s.storage;
            return s;
        }

        var rsltdispl = Object.assign({}, result);
        stripper(rsltdispl.attackee);
        stripper(rsltdispl.attacker);
        return rsltdispl;
    }

    resolveCombat() {
        while (this.fireQueue.length > 0) {
            var pair: ShipPair = this.fireQueue.pop();
            var result: CombatResult = this.combatengine.resolve(pair);

            console.log('combat results: ' + JSON.stringify(Game.debugStringCombatResults(result)));

            // update the ships involved in the combat
            var attackersunk: boolean = (result.attacker.hullStrength < 0);
            var attackerabandoned: boolean = (result.attacker.crew.count < 1);
            
            var attackeesunk: boolean = (result.attackee.hullStrength < 0);
            var attackeeabandoned: boolean = (result.attackee.crew.count < 1);

            if (null !== result.attacker.ownerid) {
                // if the attacker sunk himself, let him know that
                if (attackersunk || attackerabandoned) {
                    var p: Player = this.players.get(result.attacker.ownerid);
                    var oldnum: number = Number.parseInt(result.attacker.id.replace(/.*-/, ''));
                    var s: Ship = this.allocateNewShip(p, ShipType.SMALL, oldnum + 1);

                    this.pushMessage(result.attacker.ownerid, result.attacker.name +
                        ' has been ' + (attackersunk ? 'sunk' : 'abandoned') +
                        ' but we\'ve comandeered another: ' + s.name);
                }
                else { // attacker got some hits maybe, or sunk the attackee?
                    if (result.attackee.hullStrength > 0) {
                        if (result.hits > 0) {
                            this.pushMessage(result.attacker.ownerid,
                                result.attackee.name + ' has been hit!');
                        }
                        if (result.attackee.crew.count < 1) {
                            this.pushMessage(result.attacker.ownerid,
                                result.attackee.name + ' has been abandoned!');
                        }
                    }
                    else {
                        this.pushMessage(result.attacker.ownerid,
                            result.attackee.name + ' has been sunk!');
                    }
                }
            }

            if (null !== result.attackee.ownerid ) {
                if (attackeesunk || attackeeabandoned) {
                    var p: Player = this.players.get(result.attackee.ownerid);
                    var oldnum: number = Number.parseInt(result.attacker.id.replace(/.*-/, ''));
                    var s: Ship = this.allocateNewShip(p, ShipType.SMALL, oldnum + 1);

                    this.pushMessage(result.attackee.ownerid, result.attackee.name +
                        ' has been ' + (attackeesunk ? 'sunk' : 'abandoned') +
                        ' but we\'ve comandeered another: ' + s.name);
                }
                else {
                    if (result.attacker.hullStrength > 0) {
                        if (result.attacker.crew.count < 1) {
                            this.pushMessage(result.attackee.ownerid,
                                result.attacker.name + ' has been abandoned!');
                        }
                    }
                    else {
                        this.pushMessage(result.attackee.ownerid,
                            result.attacker.name + ' has been sunk!');
                    }
                }
            }

            if (attackersunk) {
                this.removeShip(result.attacker);
            }
            if (attackeesunk) {
                this.removeShip(result.attackee);
            }

            // notify users of combat results
            this.players.forEach((p, k) => {
                if (!this.combat.has(k)) {
                    this.combat.set(k, []);
                }
                this.combat.get(k).push(result);
            });
        }
    }

    resolveBoarding() {
        while (this.boardQueue.length > 0) {
            var pair: ShipPair = this.boardQueue.pop();
            var result: BoardResult = this.combatengine.resolveBoarding(pair, ShipUtils.shipdef(pair.one.type));

            console.log('boarding results: ' + JSON.stringify(result));

            // set the results for the users
            this.players.forEach((p, k) => {
                if (!this.boarding.has(k)) {
                    this.boarding.set(k, []);
                }
                this.boarding.get(k).push(result);
            });
        }
    }

    isdocked(s: Ship): boolean {
        return ( s.docked && null != s.docked );
    }

    private reloadCannons(ship: Ship) {
        if (ship.cannons.reloading) {
            ship.cannons.reloading -= 1;
            if (0 === ship.cannons.reloading) {
                delete ship.cannons.reloading;
            }
        }

    }


    start() {
        var my: Game = this;
        console.log('starting game loop');
        var updateShipLocation = function (ship: Ship) {
            if (!(ship.anchored || my.isdocked(ship))) {
                var newx = ship.location.x + ship.course.speedx;
                var newy = ship.location.y + ship.course.speedy;

                var pixel: number = my.map.getPixel(newx, newy);
                //console.log('pixel at (' + Math.floor(newx) +
                  //  ',' + Math.floor(newy) + '): ' + pixel.toString(16)+ '('+pixel+')');
                if (my.map.isnavigable(pixel)) {
                    ship.location.x = newx;
                    ship.location.y = newy;

                    if (my.map.iscity(pixel)) {
                        var city: City;
                        var mindist: number = 1000000000;
                        for (var i = 0; i < my.cities.length; i++){
                            var dist: number = Calculators.distance(ship.location,
                                my.cities[i].location);
                            if (dist < mindist) {
                                mindist = dist;
                                city = my.cities[i];
                            }
                        }

                        console.log('in city! ' + city.name);
                        ship.anchored = true;
                        ship.docked = city;
                    }
                    else {
                        delete ship.docked;
                    }
                }
                else {
                    //console.log('not navigable?');
                    ship.anchored = true;

                    if (my.map.isinland(pixel)) {
                        var ok = my.damageShip(ship, 1);
                        var player: Player;
                        if (null != ship.ownerid) {
                            player = my.getPlayerForShip(ship);
                        }
                        if (player) {
                            my.pushMessage(player, "We've run aground!")
                            if (!ok) {
                                var oldnum: number = Number.parseInt(ship.id.replace(/.*-/, ''));
                                var s: Ship = my.allocateNewShip(player, ShipType.SMALL, oldnum + 1);
                                my.pushMessage(ship.ownerid, ship.name +
                                    ' has been sunk, but we\'ve comandeered another: ' + s.name);
                            }
                        }
                    }
                }

                var nextx = ship.location.x + ship.course.speedx;
                var nexty = ship.location.y + ship.course.speedy;
                // FIXME: this doesn't work
                if ((Math.abs(nextx - ship.course.dstx) < 1) &&
                    ((Math.abs(nexty - ship.course.dsty) < 1))) {
                    ship.anchored = true;
                    ship.location.x = ship.course.dstx;
                    ship.location.y = ship.course.dsty;
                }
            }
        }

        var checkShipCollisions = function (lastLocationLookup: Map<string, Location>) {
            
            my.shipcollider.getCollisions().forEach(en => {
                // do anything here?

                var damage: number = 0;//Math.random();
                var firstok = my.damageShip(en.first.src, damage);
                var secondok = my.damageShip(en.second.src, damage);

                if (firstok) {
                    en.first.src.location.x = lastLocationLookup.get(en.first.src.id).x;
                    en.first.src.location.y = lastLocationLookup.get(en.first.src.id).y;
                }
                if (secondok) {
                    en.second.src.location.x = lastLocationLookup.get(en.second.src.id).x;
                    en.second.src.location.y = lastLocationLookup.get(en.second.src.id).y;
                }

                my.pushMessage(en.first.src, 'We\'ve collided with ' + en.second.src.name + '!');
                my.pushMessage(en.second.src, 'We\'ve collided with ' + en.first.src.name + '!');

                // FIXME: allocate new ships if needed
            });
        }

        var checkMonster = function () {
            var fought: boolean = false;
            my.specialscollider.checkCollisions(my.monsterbody).forEach(body => {
                if (my.poolbody !== body) {
                    if (body.id.substr(0, 1) !== '-') {
                        my.pushMessage(body.src, 'Sea Monster Strike!');
                    }
                    body.src.anchored = true;
                    my.damageShip(body.src, Math.random());
                    fought = true;
                }
            });

            if (fought) {
                my.monsterloc.x = -1000;
                my.monsterloc.y = -1000;
            }
        };

        var checkWhirlpool = function () {
            my.specialscollider.checkCollisions(my.poolbody).forEach(body => {
                if (my.monsterbody !== body) {
                    if (body.id.substr(0, 1) !== '-') {
                        my.pushMessage(body.src, 'Captured by the whirlpool!' + body.id);
                    }
                    var loc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
                    body.src.location.x = loc.x;
                    body.src.location.y = loc.y;
                }
            });
        }

        setInterval(function () {
            my.TURN_NUM += 1;
            
            my.nonplayerships.forEach((ship: Ship) => {
                my.ai.control(ship, my.playerships, my.specialscollider, my);
                my.reloadCannons(ship);
            });
            my.playerships.forEach(ship => my.reloadCannons(ship));

            my.resolveCombat();
            my.resolveBoarding();

            var lastLocationLookup: Map<string,Location> = new Map<string, Location>();
            my.playerships.forEach(ship=>{
                lastLocationLookup.set(ship.id, { x: ship.location.x, y: ship.location.y });
                updateShipLocation(ship);
            });
            my.nonplayerships.forEach((ship: Ship) => {
                lastLocationLookup.set(ship.id, { x: ship.location.x, y: ship.location.y });
                updateShipLocation(ship);
            });

            checkWhirlpool();
            checkMonster();
            checkShipCollisions(lastLocationLookup);
        }, 100);

        my.poolloc = my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)];
        my.poolbody = {
            id: 'whirlpool',
            getX: function (): number { return my.poolloc.x; },
            getY: function (): number { return my.poolloc.y; },
            getR: function (): number { return my.POOL_RADIUS; }
        };
        
        my.monsterloc = my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)];
        my.monsterbody = {
            id: 'monster',
            getX: function (): number { return my.monsterloc.x; },
            getY: function (): number { return my.monsterloc.y; },
            getR: function (): number { return my.MONSTER_RADIUS; }
        
        };
        my.specialscollider.add(my.poolbody);
        my.specialscollider.add(my.monsterbody);

        setInterval(function () {
            my.poolloc = (Math.random() < my.WPCT
                ? my.WLOCATIONS[Math.floor(Math.random() * my.WLOCATIONS.length)]
                : { x: -10000, y: -10000 }
            );
            console.log('poolloc is now: ' + JSON.stringify(my.poolloc));

            my.monsterloc = (Math.random() < my.MPCT
                ? my.MLOCATIONS[Math.floor(Math.random() * my.MLOCATIONS.length)]
                : { x: -20000, y: -20000 }
            );
            console.log('monsterloc is now: ' + JSON.stringify(my.monsterloc));

        }, 60000);
    }

    /**
     * Registers damage to this ship, and removes it from play if necessary
     * @param ship
     * @param amt 
     * @returns true, if the ship remains afloat
     */
    damageShip(ship: Ship, amt: number) {
        var remains = true;
        ship.hullStrength -= amt;
        if (ship.hullStrength <= 0) {
            remains = false;
            this.removeShip(ship);
        }
        return remains;
    }

    removeShip(ship: Ship) {
        this.specialscollider.remove(ship.id);
        this.shipcollider.remove(ship.id);

        if (null === ship.ownerid) {
            this.nonplayerships.forEach((sh, idx) => {
                if (sh.id === ship.id) {
                    this.nonplayerships.splice(idx, 1);
                }
            });
        }
        else { // player ship got sunk
            this.playerships.forEach((sh, idx) => {
                if (sh.id === ship.id) {
                    this.playerships.splice(idx, 1);
                }
            });
        } 
    }

    allocateNewShip(p: Player, type: ShipType, shipnum?: number, name?: string) : Ship{
        var ship = this.createShip(p.id + '-' + (shipnum ? shipnum : 1),
            p.pirate.avatar, type);
        ship.ownerid = p.id;
        ship.location.x = 245;
        ship.location.y = 225;
        ship.captain = p.pirate.name;
        ship.gold = 520;
        ship.name = (name ? name : Names.ship());
        this.playerships.push(ship);
        this.addShipToCollisionSystem(ship);
        return ship;
    }


}