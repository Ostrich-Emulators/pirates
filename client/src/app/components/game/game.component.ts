import { Component, OnInit } from '@angular/core';
import { ShipService } from '../../services/ship.service';
import { GameService } from '../../services/game.service';

import { forkJoin } from 'rxjs/observable/forkJoin'
import { CombatResult, HitCode } from '../../../../../common/model/combat-result';
import { Ship } from '../../../../../common/model/ship';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  private messages: string[];
  private ship: Ship;
  constructor(private shipsvc: ShipService, private game: GameService) {
  }

  ngOnInit() {
    var my: GameComponent = this;

    this.game.myship().subscribe(data => {
      my.ship = data;
    });

    this.game.messages().subscribe(data => {
      my.messages = data;
    });
    this.game.combat().subscribe((data: CombatResult[]) => {
      if (!my.ship) {
        return;
      }

      data.forEach(rslt => {
        var iamattacker: boolean = (rslt.attacker.id === my.ship.id);

        var msg: string = '';
        var exploded: number = 0;
        var hits: number = 0;

        rslt.hitcodes.forEach(val => {
          switch (val) {
            case HitCode.CANNON_EXPLODED:
              exploded += 1;
              break;
            case HitCode.OUT_OF_RANGE:
              if (iamattacker) {
                msg += 'The dogs scurried out of range before we could ready the cannons!\n';
              }
              else {
                msg += 'Looks like we got out of range of their cannons!\n';
              }
              break;
            case HitCode.MISSED:
              if (!iamattacker) {
                msg += 'That was close, but we sustained no damage in the attack\n';
              }
              break;
            default:
              hits += 1;
          }
        });

        if (exploded > 0) {
          if (iamattacker) {
            if (exploded > 1) {
              msg += 'Several cannons exploded! We need more training\n';
            }
            else {
              msg += 'A cannon exploded!\n'
            }
          }
        }

        if (hits > 0) {
          if (iamattacker) {
            if (hits > 1) {
              msg += 'Several cannons hit!\n';
            }
          }
          else {
            msg += 'We\'ve been hit!';
          }
        }

        my.messages.push(msg);
      });
    });
  }
}
