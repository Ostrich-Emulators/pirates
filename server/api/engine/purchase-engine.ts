import { Ship } from "../../../common/model/ship";
import { City } from "../../../common/model/city";
import { CityCannon } from "../../../common/model/city-cannon";
import { Purchase } from "../../../common/model/purchase";
import { Game } from "./game";
import { Cannon } from "../../../common/model/cannon";

export class PurchaseEngine {
    constructor(private game: Game) {
    }

    train(s: Ship, city: City, purchase: Purchase ) {
        console.log('city purchase: ', city, purchase);

        var area: string = purchase.item;
        var cost: number = this.costof( purchase, city );

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

    private costof(purchase: Purchase, city: City ): number {
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
                return city.cannon[purchase.extra_n].cost;
            default:
                throw 'UNHANDLED training area: '+purchase.item;
        }
    }

    private makeCannons(s: Ship, c: City, p: Purchase): Cannon {
        var ccan: CityCannon = c.cannon[p.extra_n];
        return {
            count: this.game.shipdef(s.type).maxcannons,
            firepower: ccan.firepower,
            reloadspeed: ccan.reloadspeed,
            range: ccan.range
        };
    }
}