import { Game } from '../engine/game'
import { Ship } from '../../../common/generated/model/ship';
import { Location } from '../../../common/generated/model/location';
import { City } from '../../../common/generated/model/city';
import { Purchase } from '../../../common/generated/model/purchase';

export class ShipController {
    private shiplkp: Map<string, Ship> = new Map<string, Ship>();

    constructor(private game: Game) {
    }

    refreshShips() {
        this.shiplkp.clear();
        this.game.ships.forEach(ship => { 
            this.shiplkp.set(ship.id, ship);
        });
    }
    
    one(shipid: string): Ship {
        this.refreshShips();
        return this.shiplkp.get(shipid);
    }

    shipFor(playerid: string): Ship {
        return this.game.ships.filter(s => s.ownerid === playerid).reduce((pv, cv) => cv, undefined);
    }

    all(): Ship[]{
        return this.game.ships;
    }

    sail(shipid: string, dst: Location) {
        var ship: Ship = this.one(shipid);
        var diffx = (dst.x - ship.location.x);
        var diffy = (dst.y - ship.location.y);
        var slope = diffy / diffx;
        var angle = Math.atan(slope);

        var speed = ship.speed;
        var speedx = speed * Math.cos(angle);
        var speedy = speed * Math.sin(angle);

        if (diffx < 0 ){
            speedx = 0 - speedx;
            speedy = 0 - speedy;
        }

        ship.course = {
            dstx: dst.x,
            dsty: dst.y,
            speedx: speedx,
            speedy: speedy
        };
        this.one(shipid).anchored = false;
    }

    fire(from: string, at: string) {
        this.refreshShips();
        if (!this.shiplkp.has(from) ){
            console.error('unknown ship: ' + from);
            return;
        }
        else if (!this.shiplkp.has(at)) {
            console.error('unknown ship: ' + at);
            return;
        }

        this.game.fire(this.shiplkp.get(from), this.shiplkp.get(at));
    }

    board(from: string, at: string) {
        this.shiplkp.forEach((val, key) => {
            //console.debug(key + '==>' + JSON.stringify(val));
        });

        this.refreshShips();
        if (!this.shiplkp.has(from)) {
            console.error('unknown ship: ' + from);
            return;
        }
        else if (!this.shiplkp.has(at)) {
            console.error('unknown ship: ' + at);
            return;
        }
        this.game.board(this.shiplkp.get(from), this.shiplkp.get(at));
    }

    undock(shipid: string) {
        delete this.one(shipid).docked;
    }

    buy(shipid: string, citybuy: Purchase) {
        if (!this.shiplkp.has(shipid)) {
            console.error('unknown ship: ' + shipid);
            return;
        }

        var ship: Ship = this.one(shipid);
        var city: City = (this.game.cities.filter(c => ship.docked.name == c.name) || [])[0];
        if (city) {
            this.game.training.train(ship, city, citybuy );
        }
    }
}
