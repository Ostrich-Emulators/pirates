'use strict';

import { Ship } from '../models/ship';

export class ShipController {
    private shiplkp: Map<string, Ship> = new Map<string, Ship>();

    one(shipid: string) :Ship{
        return this.shiplkp.get(shipid);
    }

    all(): Ship[]{
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
}
