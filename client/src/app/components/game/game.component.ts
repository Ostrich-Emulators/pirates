import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';

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
  constructor(private game: GameService) {
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

        var exploded: number = 0;
        var hits: number = rslt.hits;

        rslt.hitcodes.forEach(val => {
          switch (val) {
            case HitCode.CANNON_EXPLODED:
              exploded += 1;
              break;
            case HitCode.OUT_OF_RANGE:
              if (iamattacker) {
                my.messages.push( 'The dogs scurried out of range before we could ready the cannons!' );
              }
              else {
                my.messages.push( 'Looks like we got out of range of their cannons!' );
              }
              break;
            default:
          }
        });

        if (exploded > 0) {
          if (iamattacker) {
            if (exploded > 1) {
              my.messages.push( 'Several cannons exploded! We need more training' );
            }
            else {
              my.messages.push('A cannon exploded!');
            }
          }
        }

        if (hits > 0) {
          if (iamattacker) {
            if (hits > 1) {
              my.messages.push( 'Several cannons hit!' );
            }
          }
          else {
            my.messages.push( 'We\'ve been hit!' );
          }
        }
        else if (rslt.misses > 0) {
          if (!iamattacker) {
            my.messages.push('That was close, but all their shots missed');
          }
        }
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
            ? 'Our boarders were repelled. They are too strong for us to board!'
            : 'We repelled the snivelling attackers. We are too strong for them!'));
        }
        else if (rslt.code === BoardCode.OVERRUN) {
          console.log('total success');
          if (iamattacker) {
            my.messages.push('We overpowered their crew. We got everything!');
          }
          else {
            my.messages.push('We are ruined! They took everything!');
          }
        }
        else if (rslt.code === BoardCode.DRAW) {
          my.messages.push('Our boarders fought to a draw');
        }
        else{
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
      });
    });
  }

  getLatestNews(): string {
    var msgs: string = '';
    for (var i = 0; i < Math.min(this.messages.length, 10); i++) {
      msgs += this.messages[this.messages.length - 1 - i] + '\n';
    }

    return msgs;
  }
}
