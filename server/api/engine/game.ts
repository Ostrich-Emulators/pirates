import { Player } from '../../../common/generated/model/player';
import { Location } from '../../../common/generated/model/location';
import { ShipType } from '../../../common/generated/model/shipType';
import { ShipDefinition } from '../../../common/generated/model/shipDefinition';
import { Ship } from '../../../common/generated/model/ship';
import { CollisionBody } from '../../../common/model/body';
import { Collider } from '../../../common/tools/collider';
import { ActionPair } from '../../../common/generated/model/actionPair';
import { Names } from '../../../common/tools/names';
import { CombatResult } from '../../../common/generated/model/combatResult';
import { BoardResult } from '../../../common/generated/model/boardResult';
import { City } from '../../../common/generated/model/city';
import { Calculators } from '../../../common/tools/calculators';
import { ShipAi } from './ship-ai';
import { CombatEngine } from './combat-engine';
import { PurchaseEngine } from './purchase-engine';
import { ShipCannon } from '../../../common/generated/model/shipCannon';
import { Crew } from '../../../common/generated/model/crew';
import { MapEngine } from './map-engine';
import { ShipUtils } from '../../../common/tools/ship-utils';
import { CityCannon } from '../../../common/generated/model/cityCannon';
import { PlayerAndShip } from '../../../common/generated/model/playerAndShip';

var shuffler = require('shuffle-array');

export class Game {
    private TURN_NUM: number = 0;
    private SHIP_RADIUS: number = 15;
    private POOL_RADIUS: number = 30;
    private MONSTER_RADIUS: number = 25;
    poolloc: Location = { x: -10000, y: -10000 };
    monsterloc: Location = { x: -20000, y: -20000 };
    private monsterbody: CollisionBody;
    private poolbody: CollisionBody;
    private playermap: Map<string, Player> = new Map<string, Player>();
    private players: Player[] = []; // all players (humans and ai)
    ships: Ship[] = []; // all ships (human, ai, and abandoned)
    cities: City[] = [];
    private messages: Map<string, string[]> = new Map<string, string[]>(); // playerid, messages
    private fireQueue: ActionPair[] = [];
    private boardQueue: ActionPair[] = [];
    private combat: Map<string, CombatResult[]> = new Map<string, CombatResult[]>(); // playerid, results
    private boarding: Map<string, BoardResult[]> = new Map<string, BoardResult[]>(); // playerid, results
    private combatengine: CombatEngine = new CombatEngine(this);
    private ai: ShipAi = new ShipAi(this, this.combatengine);
    training: PurchaseEngine = new PurchaseEngine();
    private specialscollider: Collider = new Collider();
    private shipcollider: Collider = new Collider();
    map: MapEngine = new MapEngine();
    private started: boolean = false;

    private TURN_DURATION = 250;
    private SPECIALS_DURATION = 60000;
    private MPCT: number = 1;
    private WPCT: number = 1;

    get TURN(): number {
        return this.TURN_NUM;
    }

    constructor() {
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
    }

    setImage(img) {
        this.map.setImage(img);
    }

    setMonsterGuideImage(img) {
        this.map.setMonsterGuideImage(img);
    }

    setWhirlpoolGuideImage(img) {
        this.map.setWhirlpoolGuideImage(img);
    }

    getPlayers(humansOnly: boolean = false): Player[] {
        return this.players.filter(p => (humansOnly ? !p.ai : true));
    }

    getShips(humansOnly: boolean = false): Ship[]{
        if (humansOnly) {
            const humans: Set<string> = new Set<string>(this.getPlayers(true).map(p => p.id));
            return this.ships.filter(s => humans.has(s.ownerid));
        }
        return this.ships;
    }

    debugImageTo(file: string): Promise<any> {
        return this.map.debugImageTo(file, this, this.specialscollider,
            this.monsterbody, this.poolbody);
    }

    getPlayer(id: string): Player {
        return this.playermap.get(id);
    }

    addHumanPlayer(p: Player, shipname: string): PlayerAndShip {
        p.id = `p${this.players.length + 1}`;
        p.ai = false;
        this.players.push(p);
        this.playermap.set(p.id, p);
        this.messages.set(p.id, []);

        var ship: Ship = this.allocateNewShip(p, ShipType.SMALL, shipname);
        return { player: p, ship: ship };
    }

    /**
     * Generates the given number of AI players
     */
    generateAiPlayers(ships: number) {
        console.log('generating ' + ships + ' new NPCs')
        for (var i = -1; i >= -ships; i--) {
            var female: boolean = Math.random() < 0.5;
            var aiplayer: Player = {
                id: `p${i}`,
                female: female,
                name: Names.captain(female),
                avatar: -1,
                color: 'white',
                ai: true
            };
            console.log(`AI: ${-i}`, aiplayer);

            var ship: Ship = this.allocateNewShip(aiplayer, ShipType.SMALL, Names.ship());
            // scatter the ships around the board, but make sure they're in water
            ship.location = this.map.getRandomWhirpoolLocation();

            this.players.push(aiplayer);
            this.playermap.set(aiplayer.id, aiplayer);
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

    pushMessage(recipient: Player | Ship |string, msg: string) {
        // figure out if our recipient is a player, a ship, or a player id
        // regardless of what it is, we don't push messages to ai players

        var player: Player = undefined;
        if (typeof recipient === 'undefined' || null == recipient) {
            return; // no message to send
        }
        if (typeof recipient === 'string') { // recipient arg is a player's id
            player = this.playermap.get(recipient);
        }
        else if (recipient.hasOwnProperty('female')) { // recipient arg is actually a player
            player = <Player>recipient;
        }
        else if (recipient.hasOwnProperty('ownerid')) { // recipient is a ship, so get the owner
            player = this.playermap.get((recipient as Ship).ownerid);
        }

        if (player && player.ai || !player) {
            return;
        }

        //console.log('message for ' + id);
        if (!this.messages.has(player.id)) {
            this.messages.set(player.id, []);
        }
        this.messages.get(player.id).push(msg);
        //console.log('messages:', this.messages.get(player.id));
    }

    fire(from: Ship, to: Ship) {
        if (this.combatengine.readyToFire(from)) {
            this.fireQueue.push({ one: from, two: to });
        }
        else {
            console.log(JSON.stringify(from) + ' not ready to fire!');
        }
    }

    board(from: Ship, to: Ship) {
        this.boardQueue.push({ one: from, two: to });
    }

    private static debugStringCombatResults(result: CombatResult): CombatResult {
        function stripper(s: Ship): Ship {
            delete s.captain;
            delete s.course;
            delete s.name;
            delete s.manueverability;
            delete s.location;
            delete s.speed;
            delete s.storage;
            delete s.food;
            return s;
        }

        var rsltdispl = JSON.parse(JSON.stringify(result));
        stripper(rsltdispl.attackee);
        stripper(rsltdispl.attacker);
        return rsltdispl;
    }

    resolveCombat() {
        while (this.fireQueue.length > 0) {
            var pair: ActionPair = this.fireQueue.pop();
            var result: CombatResult = this.combatengine.resolve(pair);
            var owner: Player = this.playermap.get(result.attacker.ownerid);
            var ownee: Player = this.playermap.get(result.attackee.ownerid);

            console.log('combat results: ' + JSON.stringify(Game.debugStringCombatResults(result)));

            // update the ships involved in the combat
            var attackersunk: boolean = (result.attacker.hullStrength < 0);
            var attackerabandoned: boolean = (result.attacker.crew.count < 1);
            
            var attackeesunk: boolean = (result.attackee.hullStrength < 0);
            var attackeeabandoned: boolean = (result.attackee.crew.count < 1);

            if ( owner && !owner.ai) {
                // if the attacker sunk himself, let him know that
                if (attackersunk || attackerabandoned) {
                    this.sunkOrAbandoned(result.attacker, attackersunk, owner);
                }
                else { // attacker got some hits maybe, or sunk the attackee?
                    if (result.attackee.hullStrength > 0) {
                        if (result.hits > 0) {
                            this.pushMessage(owner, result.attackee.name + ' has been hit!');
                        }
                        if (result.attackee.crew.count < 1) {
                            this.pushMessage(owner, result.attackee.name + ' has been abandoned!');
                        }
                    }
                    else {
                        this.pushMessage(owner, result.attackee.name + ' has been sunk!');
                    }
                }
            }

            if( ownee && !ownee.ai){
                if (attackeesunk || attackeeabandoned) {
                    this.sunkOrAbandoned(result.attackee, attackeesunk, ownee);
                }
                else {
                    if (result.attacker.hullStrength > 0) {
                        if (result.attacker.crew.count < 1) {
                            this.pushMessage(ownee, result.attacker.name + ' has been abandoned!');
                        }
                    }
                    else {
                        this.pushMessage(ownee, result.attacker.name + ' has been sunk!');
                    }
                }
            }

            // notify users of combat results
            this.getPlayers(true).forEach(p => { 
                if (!this.combat.has(p.id)) {
                    this.combat.set(p.id, []);
                }
                this.combat.get(p.id).push(result);
            });
        }
    }

    resolveBoarding() {
        while (this.boardQueue.length > 0) {
            var pair: ActionPair = this.boardQueue.pop();
            var result: BoardResult = this.combatengine.resolveBoarding(pair, ShipUtils.shipdef(pair.one.type));

            console.log('boarding results: ' + JSON.stringify(result));

            // set the results for the users
            this.getPlayers(true).forEach(p => {
                if (!this.boarding.has(p.id)) {
                    this.boarding.set(p.id, []);
                }
                this.boarding.get(p.id).push(result);
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

    private updateShipLocation(ship: Ship) {
        // console.log('update ship location', { id: ship.id, location: ship.location });
        if (!(ship.anchored || this.isdocked(ship))) {
            var newx = ship.location.x + ship.course.speedx;
            var newy = ship.location.y + ship.course.speedy;
            // console.log('new location:', newx, newy);

            var pixel: number = this.map.getPixel(newx, newy);
            //console.log('pixel at (' + Math.floor(newx) +
            //  ',' + Math.floor(newy) + '): ' + pixel.toString(16)+ '('+pixel+')');
            if (this.map.isnavigable(pixel)) {
                ship.location.x = newx;
                ship.location.y = newy;

                if (this.map.iscity(pixel)) {
                    var city: City;
                    var mindist: number = Number.MAX_SAFE_INTEGER;
                    for (var i = 0; i < this.cities.length; i++) {
                        var dist: number = Calculators.distance(ship.location,
                            this.cities[i].location);
                        if (dist < mindist) {
                            mindist = dist;
                            city = this.cities[i];
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
                console.log('not navigable?');
                ship.anchored = true;

                if (this.map.isinland(pixel)) {
                    var owner: Player = this.playermap.get(ship.ownerid);
                    this.pushMessage(owner, "We've run aground!")
                    var ok = this.damageShip(ship, 1);
                    if (!ok) {
                        this.sunkOrAbandoned(ship, true, owner);
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

    private checkShipCollisions(lastLocationLookup: Map<string, Location>) {
        this.shipcollider.getCollisions().forEach(en => {
            // do anything here?
            // console.log('ship collision:', en);

            var damage: number = 0;//Math.random();
            var firstok = this.damageShip(en.first.src, damage);
            var secondok = this.damageShip(en.second.src, damage);


            this.pushMessage(en.first.src, 'We\'ve collided with ' + en.second.src.name + '!');
            this.pushMessage(en.second.src, 'We\'ve collided with ' + en.first.src.name + '!');

            if (firstok) {
                en.first.src.location.x = lastLocationLookup.get(en.first.src.id).x;
                en.first.src.location.y = lastLocationLookup.get(en.first.src.id).y;
            }
            else {
                var owner: Player = this.playermap.get(en.first.src.ownerid);
                this.sunkOrAbandoned(en.first.src, true, owner);
            }


            if (secondok) {
                en.second.src.location.x = lastLocationLookup.get(en.second.src.id).x;
                en.second.src.location.y = lastLocationLookup.get(en.second.src.id).y;
            }
            else {
                var owner: Player = this.playermap.get(en.second.src.ownerid);
                this.sunkOrAbandoned(en.second.src, true, owner);

            }
        });
    }

    private checkMonster() {
        var fought: boolean = false;
        this.specialscollider.checkCollisions(this.monsterbody).forEach(body => {
            if (this.poolbody !== body) {
                if (body.id.substring(0, 1) !== '-') {
                    this.pushMessage(body.src, 'Sea Monster Strike!');
                }
                body.src.anchored = true;
                this.damageShip(body.src, Math.random());
                fought = true;
            }
        });

        if (fought) {
            this.monsterloc.x = -10000;
            this.monsterloc.y = -10000;
        }
    }

    private checkWhirlpool() {
        this.specialscollider.checkCollisions(this.poolbody).forEach(body => {
            if (this.monsterbody !== body) {
                if (body.id.substring(0, 1) !== '-') {
                    this.pushMessage(body.src, 'Captured by the whirlpool!' + body.id);
                }
                var loc = this.map.getRandomWhirpoolLocation();
                body.src.location.x = loc.x;
                body.src.location.y = loc.y;
            }
        });
    }

    public isStarted(): boolean {
        return this.started;
    }

    start() {
        console.log('starting game loop');
        this.started = true;
        setInterval(() => {
            this.TURN_NUM += 1;
            
            shuffler(this.ships.filter(ship=>(ship.ownerid))).forEach(ship => {
                var player: Player = this.playermap.get(ship.ownerid);
                if (player.ai) {
                    this.ai.control(ship, this.getShips(true), this.specialscollider, this);
                }
                this.reloadCannons(ship);
            });

            this.resolveCombat();
            this.resolveBoarding();

            var lastLocationLookup: Map<string, Location> = new Map();
            //console.log('ships:', this.ships.map(s => ({id:s, location:s.location})));
            this.ships.forEach(ship => {
                lastLocationLookup.set(ship.id, { x: ship.location.x, y: ship.location.y });
                this.updateShipLocation(ship);
            });
            //console.log('last locations:', lastLocationLookup);

            this.checkWhirlpool();
            this.checkMonster();
            this.checkShipCollisions(lastLocationLookup);
        }, this.TURN_DURATION);

        this.poolloc = this.map.getRandomWhirpoolLocation();
        console.log('initial poolloc is: ' + JSON.stringify(this.poolloc));
        this.poolbody = {
            id: 'whirlpool',
            x: this.poolloc.x,
            y: this.poolloc.y,
            r: this.POOL_RADIUS
        };
        
        this.monsterloc = this.map.getRandomMonsterLocation();
        console.log('initial monsterloc is: ' + JSON.stringify(this.monsterloc));
        this.monsterbody = {
            id: 'monster',
            x: this.monsterloc.x,
            y: this.monsterloc.y,
            r: this.MONSTER_RADIUS
        };
        this.specialscollider.add(this.poolbody);
        this.specialscollider.add(this.monsterbody);

        setInterval( ()=> {
            this.poolloc = (Math.random() < this.WPCT
                ? this.map.getRandomWhirpoolLocation()
                : { x: -10000, y: -10000 }
            );
            console.log('poolloc is now: ' + JSON.stringify(this.poolloc));

            this.monsterloc = (Math.random() < this.MPCT
                ? this.map.getRandomMonsterLocation()
                : { x: -20000, y: -20000 }
            );
            console.log('monsterloc is now: ' + JSON.stringify(this.monsterloc));
        }, this.SPECIALS_DURATION);
    }

    /**
     * Registers damage to this ship, and removes it from play if necessary
     * @param ship
     * @param amt 
     * @returns true, if the ship remains afloat
     */
    damageShip(ship: Ship, amt: number): boolean {
        // console.log('damage ship', { id: ship.id, hull: ship.hullStrength });
        var remains = true;
        ship.hullStrength -= amt;
        if (ship.hullStrength <= 0) {
            remains = false;
        }
        return remains;
    }

    private sunkOrAbandoned(ship: Ship, sunk: boolean, owner:Player) {
        var oldname = ship.name;
        if (sunk) {
            this.specialscollider.remove(ship.id);
            this.shipcollider.remove(ship.id);

            this.ships.splice(this.ships.indexOf(ship), 1);
            if (owner) {
                if (owner.ai) {
                    this.players.splice(this.players.indexOf(owner), 1);
                    this.playermap.delete(owner.id);
                }
                else {
                    this.allocateNewShip(owner, ShipType.SMALL);
                }
            }
        }
        else {
            // abandoned ships become ownerless
            delete ship.ownerid;
            ship.anchored = true;
        }
        if (owner && !owner.ai) {
            this.pushMessage(owner, oldname +
                ' has been ' + (sunk ? 'sunk' : 'abandoned') +
                ' but we\'ve comandeered another: ' + ship.name);
        }
    }

    private allocateNewShip(p: Player, type: ShipType, name: string = Names.ship()) : Ship {
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
            id: `${p.id}-ship`,
            type: type,
            cannons: cannons,
            speed: def.speed,
            manueverability: def.manueverability,
            hullStrength: def.hull,
            sailQuality: 35,
            food: 50,
            ammo: 120,
            gold: 0,
            storage: def.storage,
            location: { x: 100, y: 200 },
            anchored: true,
            crew: crew,
            name: name,
            ownerid: p.id,
            captain: p.name
        };

        if (!p.ai) {
            ship.location.x = 245;
            ship.location.y = 225;
            ship.gold = 520;
            //ship.cannons.range = 100;
            //ship.hullStrength = 200;
        }

        console.log(`allocated ${ship.name} led by ${p.name}`, ship);
        this.ships.push(ship);
        this.addShipToCollisionSystem(ship);
        return ship;
    }
   
    private addShipToCollisionSystem(ship: Ship) {
        var radius = this.SHIP_RADIUS;
        this.specialscollider.add({
            id: ship.id,
            src: ship,
            x: () => ship.location.x,
            y: () => ship.location.y,
            r: radius
        });

        this.shipcollider.add({
            id: ship.id,
            src: ship,
            x: () => ship.location.x,
            y: () => ship.location.y,
            r: radius / 2
        });
    }
}