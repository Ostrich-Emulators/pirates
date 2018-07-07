import { Ship } from '../../../common/model/ship'
import { Collider } from '../../../common/tools/collider'
import { Game } from '../engine/game'
import { Calculators } from '../../../common/tools/calculators'

export class ShipAi {
  private lastFire: Map<string, Date> = new Map<string, Date>();

  public control(ship: Ship, playerships: Ship[], collider: Collider, game: Game) {
    var my: ShipAi = this;
    var fired: boolean = false;
    if (my.canFire(ship)) {
      playerships.forEach(enemy => {
        var dist = Calculators.distance(ship.location, enemy.location);

        if (dist < ship.cannonrange * 3 / 4 && ship.ammo > 0 && ship.cannons > 0) {
          // if a pirate is too close, blast 'em!
          game.fire(ship, enemy);
          my.fire(ship);
          fired = true;
        }
      });
    }

    if (!fired && (!ship.course || ship.anchored)) {
      // set a course somewhere (random walk for now)
      // just get a number in a range [0,9) clockwise from 1 pointing north
      // a 0 means don't move
      var rand: number = Math.floor(Math.random() * 9);
      console.log('rand is ' + rand);
      var dist: number = 5;
      var movex: number = 0;
      var movey: number = 0;
      switch (rand) {
        case 1:
          movey -= dist;
          break;
        case 2:
          movex += dist;
          movey -= dist;
          break;
        case 3:
          movex += dist;
          break;
        case 4:
          movex += dist;
          movey += dist;
          break;
        case 5:
          movey += dist;
          break;
        case 6:
          movex -= dist;
          movey += dist;
          break;
        case 7:
          movex -= dist;
          break;
        case 8:
          movex -= dist;
          movey -= dist;
          break;
        default:
          // don't move
      }
      console.log('movex, movey=' + movex + ',' + movey);
      var diffx = movex;
      var diffy = movey;
      var slope = diffy / diffx;
      var angle = Math.atan(slope);

      var speed = ship.speed;
      var speedx = speed * Math.cos(angle);
      var speedy = speed * Math.sin(angle);

      if (diffx < 0) {
        speedx = 0 - speedx;
        speedy = 0 - speedy;
      }

      ship.course = {
        dstx: ship.location.x + movex,
        dsty: ship.location.y + movey,
        speedx: speedx,
        speedy: speedy
      };

      ship.anchored = (0 != movex + movey);
    }
  }

  private fire(s: Ship) {
    this.lastFire.set(s.id, new Date());
  }

  private canFire(s: Ship): boolean {
    if (s.crew.count < 1) {
      return false;
    }

    if (this.lastFire.has(s.id)) {
      // we can do something once every 2 seconds
      var d: Date = new Date();
      return d.getTime() >= this.lastFire.get(s.id).getTime() + 2000;
    }
    return true;
  }
}