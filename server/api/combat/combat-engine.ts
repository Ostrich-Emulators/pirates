import { Ship } from '../../../common/model/ship'
import { ShipPair } from '../../../common/model/ship-pair';
import { CombatResult, HitCode } from '../../../common/model/combat-result';

export class CombatEngine {
    resolve(pair: ShipPair): CombatResult {
        console.log('resolving ' + pair.one.id + ' attacking '
            + pair.two.id + ' (hs:' + pair.two.hullStrength + ')');
        var attacker: Ship = pair.one;
        var attackee: Ship = pair.two;

        var result: CombatResult = {
            attacker: pair.one,
            attackee: pair.two,
            hitcodes: []
        };


        // if the attackee is too far away, don't fire
        var distance = this.getDistance(attacker, attackee);
        if (distance > attacker.cannonrange) {
            result.hitcodes.push(HitCode.OUT_OF_RANGE);
            return result;
        }

        
        var cannonsInAttack = Math.min(attacker.cannons, attacker.ammo);
        attacker.ammo -= cannonsInAttack;

        // each cannon has a small chance of exploding during firing, depending on
        // the fighting skill of the crew. The baseline fighting skill is 50 (1% chance)
        var explosionpct: number = 0.5 / attacker.crew.meleeSkill;
        console.log('explosionpct is ' + explosionpct);
        for (var cannon = 0; cannon < cannonsInAttack; cannon++){
            if (Math.random() < explosionpct) {
                result.hitcodes.push(HitCode.CANNON_EXPLODED);
                attacker.cannons -= 1;
                console.log('cannon exploded!');
            }
        }

        // some cannons might have exploded, so we can only
        // calculate attack results for the ones left
        cannonsInAttack -= result.hitcodes.length;

        var distanceFactor = this.getDistanceFactor(attacker, attackee);
        console.log('hitpct: ' + distanceFactor);
        for (var cannon = 0; cannon < cannonsInAttack; cannon++){
            if (Math.random() < distanceFactor) {
                var msg: string = attacker.id + ' hit ' + attackee.id;

                // if you hit, you have a 10% chance of damaging sails,
                // 2% chance of killing some crew,
                // 1% chance of disabling a cannon
                // and 87% chance of doing hull damage
                var targetpct = Math.random();
                if (targetpct < 0.01) {
                    result.hitcodes.push(HitCode.HIT_CANNON);
                    attackee.cannons -= Math.min(1, attackee.cannons);
                    msg += ' disabling a cannon';
                }
                else if (targetpct < 0.03) {
                    result.hitcodes.push(HitCode.HIT_SAILOR);
                    attackee.crew.count -= Math.min(1, attackee.crew.count);
                    msg += ' killing a crewman';
                }
                else if (targetpct < 0.13) {
                    // each ball can do up to 0.5 damage (rounded to 3 decimal places)
                    result.hitcodes.push(HitCode.HIT_SAIL);
                    var damage = Math.round((Math.random() / 2) * 1000) / 1000;
                    attackee.sailQuality -= damage;
                    if (attackee.sailQuality < 0) {
                        attackee.sailQuality = 0;
                    }
                    msg += ' doing '+damage+' damage to the sails';
                }
                else {
                    result.hitcodes.push(HitCode.HIT_HULL);
                    // each ball can do up to 1 damage (rounded to 3 decimal places)
                    var damage = Math.round((Math.random() ) * 1000) / 1000;
                    attackee.hullStrength -= damage;
                    msg += ' doing ' + damage + ' damage to the hull';
                }

                console.log(msg);
            }
            else {
                console.log('missed!');
                result.hitcodes.push(HitCode.MISSED);
            }
        }

        return result;
    }

    getDistance(attacker: Ship, attackee: Ship): number {
        var x: number = attacker.location.x - attackee.location.x;
        var y: number = attacker.location.y - attackee.location.y;
        return Math.sqrt(x * x + y * y);
    }
    
    getDistanceFactor(attacker: Ship, attackee: Ship) :number {
        var distance = this.getDistance(attacker, attackee);
        
        var ratio: number = (1 - distance / attacker.cannonrange);
        console.log('distance:' + distance + '; range: ' + attacker.cannonrange + '; ratio: ' + ratio);

        // idea: if we're within 25% of our cannon range, we have
        // 100% hit chance. If we're at 100% of our cannon range,
        // we have 25% hit chance.
        return (ratio > 0.75 ? 1 : ratio + 0.25);
    }
}