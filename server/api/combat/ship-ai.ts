import { Ship } from '../../../common/model/ship'
import { Collider } from '../../../common/tools/collider'
import { Game } from '../models/game'
import { Calculators } from '../../../common/tools/calculators'

export class ShipAi {
  private lastAction: Map<string, Date> = new Map<string, Date>();

  public control(ship: Ship, playerships: Ship[], collider: Collider, game: Game) {
    var my: ShipAi = this;
    if (my.canAct(ship)) {

      playerships.forEach(enemy => {
        var dist = Calculators.distance(ship.location, enemy.location);

        if (dist < ship.cannonrange * 3 / 4 && ship.ammo > 0 && ship.cannons > 0) {
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
      // we can do something once every 2 seconds
      var d: Date = new Date();
      return d.getTime() >= this.lastAction.get(s.id).getTime() + 2000;
    }
    return true;
  }
}