import { Component, OnInit } from '@angular/core';
import { ShipService } from '../../services/ship.service';
import { GameService } from '../../services/game.service';

import { forkJoin } from 'rxjs/observable/forkJoin'
import { CombatResult, HitCode } from '../../../../../common/model/combat-result';
import { Ship } from '../../../../../common/model/ship';
import { BoardResult, BoardCode } from '../../../../../common/model/board-result';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  private messages: string[] = [];
  private ship: Ship;
  constructor(private shipsvc: ShipService, private game: GameService) {
  }

  ngOnInit() {
    var my: GameComponent = this;

    this.game.myship().subscribe(data => {
      my.ship = data;
    });

    this.game.messages().subscribe(data => {
      data.forEach(msg => { 
        my.messages.push(msg);
      });
    });
    this.game.combat().subscribe((data: CombatResult[]) => {
      if (!my.ship) {
        return;
      }

      data.forEach(rslt => {
        var iamattacker: boolean = (rslt.attacker.id === my.ship.id);

        var msg: string = '';
        var exploded: number = 0;
        var hits: number = rslt.hits;

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
    this.game.boarding().subscribe((data: BoardResult[]) => {
      if (!my.ship) {
        return;
      }

      data.forEach((rslt: BoardResult) => {
        var iamattacker: boolean = (rslt.attacker.id === my.ship.id);

        console.log(rslt);

        if (rslt.code === BoardCode.REPELLED) {
          my.messages.push((iamattacker
            ? 'Our boarders were repelled!'
            : 'We repelled the attackers!'));
        }

        if (rslt.code === BoardCode.PARTIAL_SUCCESS) {
          console.log('partial success');
          if (rslt.ammo) {
            console.log('ammo');
            if (iamattacker) {
              my.messages.push('We stole ' + rslt.ammo + ' cannonballs');
            }
            else {
              my.messages.push('Those rascals stole ' + rslt.ammo + ' cannonballs!');
            }
          }
          if (rslt.gold) {
            console.log('gold');
            if (iamattacker) {
              my.messages.push('We stole ' + rslt.gold + ' gold');
            }
            else {
              my.messages.push('Those rascals stole ' + rslt.gold + ' gold!');
            }
          }
          if (rslt.food) {
            console.log('food');

            if (iamattacker) {
              my.messages.push('We stole ' + rslt.food + ' food rations');
            }
            else {
              my.messages.push('Those rascals stole ' + rslt.food + ' food rations!');
            }
          }
          if (rslt.crew) {
            console.log('crew');

            if (iamattacker) {
              my.messages.push('We recruited ' + rslt.crew.count + ' new pirates!');
            }
            else {
              my.messages.push('Those rascals imprisoned ' + rslt.crew.count + ' of our men!');
            }
          }
        }
        else if (rslt.code === BoardCode.TOTAL_SUCCESS) {
          console.log('total success');
          if (iamattacker) {
            my.messages.push('We totally overpowered their crew. We got everything!');
          }
          else {
            my.messages.push('We are ruined! They took everything!');
          }
        }
        console.log('here I am');
      });
    });
  }


  getMessages(): string[]{
    return this.messages;
  }
}
