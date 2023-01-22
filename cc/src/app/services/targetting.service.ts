import { Injectable } from '@angular/core'

import { Ship } from '../../../../common/generated/model/ship'
import { GameService } from './game.service';
import { Collider } from '../../../../common/tools/collider';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class TargettingService {

  private targets: Subject<Ship[]> = new Subject<Ship[]>();
  private targetting: Map<Ship, targetting> = new Map<Ship, targetting>();
  longcollider: Collider = new Collider();
  shortcollider: Collider = new Collider();

  private ship: Ship;
  private ships: Ship[] = [];

  constructor(gamesvc: GameService) {
    gamesvc.myship().subscribe(data => {
      this.ship = data;
    });

    gamesvc.ships().subscribe(data => {
      this.ships = data;
    });

    // refresh targetting every second instead of 4x a second
    setInterval(()=> {
      if (this.ships && this.ship) {
        this.refreshTargetting();
      }
    }, 500);
  }

  private refreshTargetting() {
    this.longcollider.clear();
    this.shortcollider.clear();

    //var isdocked: boolean = (null != this.ship.docked);
    if (!(this.ship.ammo > 0 && this.ship.cannons.range > 0 )) {
      this.targets.next([]);
      return;
    }

    this.ships.forEach(ship => {
      var ismyship: boolean = (ship.id === this.ship.id);
      this.longcollider.add({
        id: ship.id,
        src: ship,
        getX: function (): number { return ship.location.x },
        getY: function (): number { return ship.location.y },
        getR: function (): number { return (ismyship ? ship.cannons.range : 15) }
      });
      this.shortcollider.add({
        id: ship.id,
        src: ship,
        getX: function (): number { return ship.location.x },
        getY: function (): number { return ship.location.y },
        getR: function (): number { return 15 }
      });
    });

    var targs: Map<Ship, targetting> = new Map<Ship, targetting>();
    this.longcollider.checkCollisions(this.ship.id).forEach(body => {
      targs.set(body.src, { fire: true });
    });
    this.shortcollider.checkCollisions(this.ship.id).forEach(body => {
      if (targs.has(body.src)) {
        targs.set(body.src, { fire: true, board: true });
      }
      else {
        targs.set(body.src, { board: true });
      }
    });
    this.targetting = targs;

    var targarr: Ship[] = [];
    targs.forEach((val, ship) => {
      targarr.push(ship);
    });
    this.targets.next(targarr);
  }

  getTargets(): Observable<Ship[]> {
    return this.targets;
  }

  canBoard(s: Ship): boolean {
    return (this.targetting.has(s) ? this.targetting.get(s).board : false);
  }

  private cannonsready(): boolean {
    return (this.ship.ammo > 0 && !this.ship.cannons.reloading);
  }

  canFire(s: Ship): boolean {
    return ( this.targetting.has(s) ? this.targetting.get(s).fire && this.cannonsready(): false);
  }

  firingRange(): boolean {
    return Array.from(this.targetting.values()).filter(tt => tt.fire).length > 0;
  }

  boardingRange(): boolean {
    return Array.from(this.targetting.values()).filter(tt => tt.board).length > 0;
  }
}

interface targetting {
  fire?: boolean,
  board?: boolean
}
