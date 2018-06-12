import { Ship } from '../../../common/model/ship'
import { ShipPair } from '../../../common/model/ship-pair';
import { ShipDefinition } from '../../../common/model/ship-definition';
import { Crew } from '../../../common/model/crew';
import { Collider } from '../../../common/tools/collider';
import { Game } from '../models/game';
import { Location } from '../../../common/model/location';

export class ShipAi {
  private lastAction: Map<string, Date> = new Map<string, Date>();

  private distance(loc1: Location, loc2: Location): number {
    var x: number = loc1.x - loc2.x;
    var y: number = loc1.y - loc2.y;
    return Math.sqrt(x * x + y * y);
  }

  public control(ship: Ship, playerships: Ship[], collider: Collider, game: Game) {
    var my: ShipAi = this;
    if (my.canAct(ship)) {

      playerships.forEach(enemy => {
        var dist = my.distance(ship.location, enemy.location);

        if (dist < ship.cannonrange / 2 && ship.ammo > 0 && ship.cannons > 0) {
          // if a pirate is too close, blast 'em!
          game.fire(ship, enemy);
          my.act(ship);
        }
      });
    }
  }

  private act(s: Ship) {
    this.lastAction.set(s.id, new Date());
  }

  private canAct(s: Ship): boolean {
    if (this.lastAction.has(s.id)) {
      // we can do something once a second
      var d: Date = new Date();
      return d.getTime() >= this.lastAction.get(s.id).getTime() + 1000;
    }
    return true;
  }
}