import { Ship } from '../../../common/model/ship'
import { ShipPair } from '../../../common/model/ship-pair';
import { CombatResult, HitCode } from '../../../common/model/combat-result';
import { BoardResult, BoardCode } from '../../../common/model/board-result';
import { ShipDefinition } from '../../../common/model/ship-definition';
import { Crew } from '../../../common/model/crew';
import { Calculators } from '../../../common/tools/calculators';

export class CombatEngine {
    resolve(pair: ShipPair): CombatResult {
        console.log('resolving ' + pair.one.id + ' attacking '
            + pair.two.id + ' (hs:' + pair.two.hullStrength + ')');
        var attacker: Ship = pair.one;
        var attackee: Ship = pair.two;

        var result: CombatResult = {
            attacker: pair.one,
            attackee: pair.two,
            hitcodes: [],
            hits: 0,
            misses: 0
        };


        // if the attackee is too far away, don't fire
        var distance = Calculators.distance(attacker.location, attackee.location);
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
        for (var cannon = 0; cannon < cannonsInAttack; cannon++) {
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
        for (var cannon = 0; cannon < cannonsInAttack; cannon++) {
            if (Math.random() < distanceFactor) {
                var msg: string = attacker.id + ' hit ' + attackee.id;
                result.hits += 1;

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
                    msg += ' doing ' + damage + ' damage to the sails';
                }
                else {
                    result.hitcodes.push(HitCode.HIT_HULL);
                    // each ball can do up to 1 damage (rounded to 3 decimal places)
                    var damage = Math.round((Math.random()) * 1000) / 1000;
                    attackee.hullStrength -= damage;
                    msg += ' doing ' + damage + ' damage to the hull';
                }

                console.log(msg);
            }
            else {
                result.misses += 1;
                console.log('missed!');
                result.hitcodes.push(HitCode.MISSED);
            }
        }

        // if the hullstrength is too low, the crew might abandon ship
        if (attackee.hullStrength < 1) {
            if (Math.random() < (1 - attackee.hullStrength)) {
                attackee.crew.count = 0;
                console.log(attackee.id + ' crew abandoned ship!');
            }
        }

        return result;
    }

    resolveBoarding(pair: ShipPair, attackerdef: ShipDefinition): BoardResult {
        // boarding algorithm:
        // figure out the ratio of attacker/defender. Then:
        // if this ratio is under 0.5, the attack is repelled, and nothing else happens
        // if the ratio is over 3, the attackers completely subdue the ship; else:
        // +-25 basis points: attack is a draw
        // else: use a stddev to decide on a range of more interesting results
        var my: CombatEngine = this;

        console.log('resolving ' + pair.one.id + ' boarding '
            + pair.two.id);

        var attacker: Ship = pair.one;
        var attackee: Ship = pair.two;

        var attackval: number = (attacker.crew.count * attacker.crew.meleeSkill);
        var defendval: number = (attackee.crew.count * attackee.crew.meleeSkill);
        var ratio: number = attackval / defendval;
        console.log('aval: ' + attackval + '; dval: ' + defendval + '; raw ratio: ' + ratio);

        if (ratio < 0.5) {
            return {
                attacker: pair.one,
                attackee: pair.two,
                code: BoardCode.REPELLED
            };
        }
        else if (ratio > 3) {
            var crew: Crew = Object.assign({}, attackee.crew);
            if (attackerdef.crewsize < (attacker.crew.count + crew.count)) {
                crew.count = attackerdef.crewsize - attacker.crew.count;
            }

            attacker.gold += attackee.gold;
            attacker.food += attackee.food;
            attacker.ammo += attackee.ammo;
            // FIXME: figure out new crew stats
            attacker.crew.count += crew.count;

            var rslt: BoardResult = {
                attacker: pair.one,
                attackee: pair.two,
                code: BoardCode.OVERRUN,
                gold: attackee.gold,
                ammo: attackee.ammo,
                food: attackee.food,
                crew: crew
            }

            attackee.gold = 0;
            attackee.food = 0;
            attackee.ammo = 0;
            attackee.crew.count = 0;
            return rslt;
        }
        else {
            var choice: number = Math.random();
            // normalize the ratio:
            ratio = attackval / (attackval + defendval);
            console.log('normalized ratio: ' + ratio + '; choice: ' + choice);

            var rslt: BoardResult = {
                attacker: pair.one,
                attackee: pair.two,
                code: BoardCode.DRAW
            }

            // various things happen:
            if (choice > ratio) {
                // attacker advantage
                if (choice - 0.25 < ratio) {
                    return rslt; // DRAW
                }
                console.log('defender success!');
                return my.defenderBoards(ratio, choice, pair.one, pair.two);
            }
            else if (choice < ratio) {
                // defender advantage
                if (choice + 0.25 > ratio) {
                    return rslt; // DRAW
                }

                console.log('attacker success!');
                return my.attackerBoards(ratio, choice, pair.one, pair.two, attackerdef);
            }
        }
    }

    private attackerBoards(ratio: number, choice: number, attacker: Ship,
        attackee: Ship, attackerdef: ShipDefinition): BoardResult {
        // equal chance of getting gold, crew, ammo, or food
        var rslt: BoardResult = {
            attackee: attackee,
            attacker: attacker,
            code: BoardCode.ATTACKER_SUCCESS
        };

        var pct: number = Math.max(Math.random(), 0.25);
        if (choice < 0.25) {
            rslt.gold = Math.floor(attackee.gold * pct);
            attackee.gold -= rslt.gold;
            attacker.gold += rslt.gold;
        }
        else if (choice < 0.5) {
            rslt.ammo = Math.floor(attackee.ammo * pct);
            attackee.ammo -= rslt.ammo;
            attacker.ammo += rslt.ammo;
        }
        else if (choice < 0.75) {
            rslt.food = Math.floor(attackee.food * pct);
            attackee.food -= rslt.food;
            attacker.food += rslt.food;
        }
        else {
            var crew = Object.assign({}, attackee.crew);
            crew.count = 1;
            attackee.crew.count -= crew.count;

            if (attackerdef.crewsize < (attacker.crew.count + crew.count)) {
                crew.count = attackerdef.crewsize - attacker.crew.count;
            }
            rslt.crew = crew;
            attacker.crew.count += crew.count;
        }

        return rslt;

    }

    private defenderBoards(ratio: number, choice: number, attacker: Ship, attackee: Ship): BoardResult {
        return {
            attacker: attacker,
            attackee: attackee,
            code: BoardCode.DEFENDER_SUCCESS
        };
    }

    getDistanceFactor(attacker: Ship, attackee: Ship): number {
        var distance = Calculators.distance(attacker.location, attackee.location);

        var ratio: number = (1 - distance / attacker.cannonrange);
        console.log('distance:' + distance + '; range: ' + attacker.cannonrange + '; ratio: ' + ratio);

        // idea: if we're within 25% of our cannon range, we have
        // 100% hit chance. If we're at 100% of our cannon range,
        // we have 25% hit chance.
        return (ratio > 0.75 ? 1 : ratio + 0.25);
    }
}