import { Ship } from "../../../common/model/ship";
import { City } from "../../../common/model/city";
import { Game } from "./game";
import { CityCannon } from "../../../common/model/city-cannon";

export class TrainingEngine {
    constructor(private game: Game) {
        
    }

    train(s: Ship, city: City, purchase: City) {
        var cost: number = -1;
        var area: string = '';

        console.log('city: ', city, purchase);
        Object.getOwnPropertyNames(purchase).forEach(name => {
            area = name;
            cost = ('cannon' === area
                ? city.cannon[<any>purchase.cannon].cost
                : city[name]);
        });

        if (s.gold >= cost) {
            s.gold -= cost;
            console.log(purchase);

            switch (area) {
                case 'melee':
                    s.crew.meleeSkill += 10;
                    break;
                case 'sailing':
                    s.crew.sailingSkill += 10;
                    break;
                case 'hull':
                    s.hullStrength += 1;
                    break;
                case 'sail':
                    s.sailQuality += 10;
                    break;
                case 'ammo':
                    s.ammo += 10;
                    break;
                case 'cannon':
                    var ccan: CityCannon = city.cannon[<any>purchase.cannon];
                    s.cannons = {
                        count: this.game.shipdef(s.type).maxcannons,
                        firepower: ccan.firepower,
                        reloadspeed: ccan.reloadspeed,
                        range: ccan.range
                    };
                    break;
            }
        }
    }
}