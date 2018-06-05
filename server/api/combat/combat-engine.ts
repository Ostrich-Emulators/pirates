import { Ship } from '../../../common/model/ship'
import { ShipPair } from '../../../common/model/ship-pair';

export class CombatEngine {
    resolve(pair: ShipPair) {
        var attacker: Ship = pair.one;
        var attackee: Ship = pair.two;
        console.log(pair);
        attacker.ammo -= 1;
        attackee.hullStrength -= 1;
    }
}