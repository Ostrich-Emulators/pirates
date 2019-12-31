import { Ship } from '../model/ship';
import { ShipType } from '../model/ship-type.enum';
import { ShipDefinition } from '../model/ship-definition';
import { CityCannon } from '../model/city-cannon';

export class ShipUtils {
    public static shipdef(type: ShipType): ShipDefinition {
        switch (type) {
            case (ShipType.BIG):
                return {
                    maxcannons: 20,
                    crewsize: 50,
                    storage: 1000,
                    speed: 0.2,
                    manueverability: 5,
                    hull: 40
                };
            case (ShipType.MEDIUM):
                return {
                    maxcannons: 12,
                    crewsize: 20,
                    storage: 500,
                    speed: 0.4,
                    manueverability: 15,
                    hull: 20
                };
            case (ShipType.SMALL):
                return {
                    maxcannons: 8,
                    crewsize: 10,
                    storage: 250,
                    speed: 1,
                    manueverability: 25,
                    hull: 10
                };
            default:
                throw 'Unknown ship type: ' + type;
        }
    }


    public static replacementCannonCost(s: Ship, ccs: CityCannon[], cidx: number): number {
        // if we're just resupplying cannons, figure out how many we need
        // if we're buying a different type of cannon, sell the ones we
        // have and purchase the new ones

        // step 1: figure out which type of cannon we have
        var oldcannons = s.cannons;
        var oldidx: number = -1;
        var costOfOld: number = 0;

        for (var j = 0; j < ccs.length; j++) {
            var cc: CityCannon = ccs[j];
            if (cc.firepower == oldcannons.firepower &&
                cc.range == oldcannons.range &&
                cc.reloadspeed == oldcannons.reloadspeed) {
                oldidx = j;
                costOfOld = cc.cost;
            }
        }

        var MAXCANNONS = ShipUtils.shipdef(s.type).maxcannons;

        return (oldidx === j
            ? costOfOld * (MAXCANNONS - s.cannons.count)
            : (ccs[cidx].cost * MAXCANNONS) - (ccs[oldidx].cost * s.cannons.count)
        );

        
    }
}