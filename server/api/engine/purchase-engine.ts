import { Ship } from "../../../common/generated/model/ship";
import { City } from "../../../common/generated/model/city";
import { CityCannon } from "../../../common/generated/model/cityCannon";
import { Purchase } from "../../../common/generated/model/purchase";
import { ShipCannon } from "../../../common/generated/model/shipCannon";
import { ShipUtils } from "../../../common/tools/ship-utils";

export class PurchaseEngine {
    constructor() {
    }

    train(s: Ship, city: City, purchase: Purchase ) {
        console.log('city purchase: ', city, purchase);

        var area: string = purchase.item;
        var cost: number = this.costof( s, city, purchase );

        if (s.gold >= cost) {
            s.gold -= cost;
            console.log(purchase);

            switch (area) {
                case 'MELEE':
                    s.crew.meleeSkill += 10;
                    break;
                case 'SAILING':
                    s.crew.sailingSkill += 10;
                    break;
                case 'HULL':
                    s.hullStrength += 1;
                    break;
                case 'SAIL':
                    s.sailQuality += 10;
                    break;
                case 'AMMO':
                    s.ammo += 10;
                    break;
                case 'CANNON':
                    s.cannons = this.makeCannons(s, city, purchase);
                    break;
            }
        }
    }

    private costof(ship: Ship, city: City, purchase: Purchase ): number {
        switch (purchase.item) {
            case 'MELEE':
                return city.melee;
            case 'SAILING':
                return city.sailing;
            case 'HULL':
                return city.hull;
            case 'SAIL':
                return city.sailing;
            case 'AMMO':
                return city.ammo;
            case 'CANNON':
                return ShipUtils.replacementCannonCost(ship, city.cannon, purchase.extraN);
            default:
                throw 'UNHANDLED training area: '+purchase.item;
        }
    }

    private makeCannons(s: Ship, c: City, p: Purchase): ShipCannon {
        var ccan: CityCannon = c.cannon[p.extraN];
        return {
            count: ShipUtils.shipdef(s.type).maxcannons,
            firepower: ccan.firepower,
            reloadspeed: ccan.reloadspeed,
            range: ccan.range,
        };
    }
}