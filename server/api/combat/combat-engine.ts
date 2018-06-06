import { Ship } from '../../../common/model/ship'
import { ShipPair } from '../../../common/model/ship-pair';
import { CombatResult } from '../../../common/model/combat-result';

export class CombatEngine {
    resolve(pair: ShipPair): CombatResult {
        console.log('resolving ' + pair.one.id + ' attacking '
            + pair.two.id + ' (hs:' + pair.two.hullStrength + ')');
        var attacker: Ship = pair.one;
        var attackee: Ship = pair.two;
        attacker.ammo -= 1;

        var result: CombatResult = {
            attacker: pair.one,
            attackee: pair.two,
        };
        result.hit = true;

        if (result.hit) {
            // damage can be up to 2 hullstrength (round to 3 decimals)
            var damage = Math.round((Math.random() * 2) * 1000) / 1000;
            attackee.hullStrength -= damage;
            console.log(pair.two.id + ' damaged ' + damage
                + ' (' + attackee.hullStrength + ')');
        }
        return result;
    }
}