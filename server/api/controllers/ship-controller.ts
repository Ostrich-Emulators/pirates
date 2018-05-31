'use strict';

import { Game } from '../models/game'
import { Ship } from '../../../common/model/ship'
import { Location } from '../../../common/model/location';

export class ShipController {
    private shiplkp: Map<string, Ship> = new Map<string, Ship>();

    constructor(private game: Game) {
    }

    refreshShips() {
        var my: ShipController = this;
        my.shiplkp.clear();
        this.game.getPlayers().forEach(player => {
            my.shiplkp.set(player.ship.id, player.ship);
        });
        this.game.getNonPlayerShips().forEach(ship => {
            my.shiplkp.set(ship.id, ship);
        });
    }
    
    one(shipid: string) :Ship {
        return this.shiplkp.get(shipid);
    }

    all(): Ship[]{
        this.refreshShips();

        var ret: Ship[] = [];
        this.shiplkp.forEach(function(ship){
            ret.push(ship);
        });
        return ret;
    }

    create(ship: Ship): string {
        ship.id = (this.shiplkp.size + 1 ).toString();
        this.shiplkp.set(ship.id, ship);
        return ship.id;
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
}
