import { Ship } from '../../../common/generated/model/ship'
import { Collider } from '../../../common/tools/collider'
import { Game } from '../engine/game'
import { Calculators } from '../../../common/tools/calculators'
import { CombatEngine } from './combat-engine';
import { Player } from '../../../common/generated/model/player';

export class ShipAi {
  constructor(private game: Game, private combateng: CombatEngine) {
  }

  public control(ship: Ship, humans: Ship[], collider: Collider, game: Game) {
    if (this.combateng.readyToFire(ship)) {
      var fired: boolean = false;

      humans.filter(human => !this.game.isdocked(human)).forEach(enemy => {
        var factor: number = this.combateng.getDistanceFactor({ one: ship, two: enemy });
        if (factor > 0.6 && !fired ) {
          // if we have a good chance to hit a human, blast 'em!
          game.fire(ship, enemy);
          fired = true;
        }
      });
    }

    if (ship.crew.count > 0) {
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
        if (this.game.map.isnavigable(this.game.map.getPixel(dstx, dsty))) {
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
    else {
      ship.anchored = true;
    }
  }
}