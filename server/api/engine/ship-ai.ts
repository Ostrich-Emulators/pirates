import { Ship } from '../../../common/model/ship'
import { Collider } from '../../../common/tools/collider'
import { Game } from '../engine/game'
import { Calculators } from '../../../common/tools/calculators'
import { CombatEngine } from './combat-engine';

export class ShipAi {
  constructor(private game: Game, private combateng:CombatEngine) {
  }

  public control(ship: Ship, playerships: Ship[], collider: Collider, game: Game) {
    var fired: boolean = false;
    if (this.combateng.readyToFire(ship)) {
      playerships.forEach(enemy => {
        var dist = Calculators.distance(ship.location, enemy.location);
        if (dist < ship.cannons.range * 3 / 4) {
          // if a pirate is too close, blast 'em!
          game.fire(ship, enemy);
          fired = true;
        }
      });
    }

    if (!fired && (!ship.course || ship.anchored)) {
      // set a course somewhere (random walk for now)
      // just get a number in a range [0,9) clockwise from 1 pointing north
      // a 0 means don't move
      var rand: number = Math.floor(Math.random() * 9);
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

      var dstx: number = ship.location.x + movex;
      var dsty: number = ship.location.y + movey;
      if (this.game.isnavigable(this.game.getPixel(dstx, dsty))){
        ship.course = {
          dstx: ship.location.x + movex,
          dsty: ship.location.y + movey,
          speedx: speedx,
          speedy: speedy
        };
      }
      else {
        movex = 0;
        movey = 0;
      }

      ship.anchored = (0 === (movex + movey));  
    }
  }
}