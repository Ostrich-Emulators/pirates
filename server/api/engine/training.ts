import { Ship } from "../../../common/model/ship";
import { City } from "../../../common/model/city";

export class TrainingEngine {
    train(s: Ship, city: City, purchase: City) {
        var cost: number = -1;
        var area: string = '';
        Object.getOwnPropertyNames(purchase).forEach(name => { 
            area = name;
            cost = city[name];
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
            }


        }
    }
}