import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { Ship } from '../../../../common/model/ship'
import { GameService } from './game.service';
import { Collider } from '../../../../common/tools/collider';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TargettingService {

  private targets: Subject<Ship[]> = new Subject<Ship[]>();
  private targetting: Map<Ship, targetting> = new Map<Ship, targetting>();
  longcollider: Collider = new Collider();
  shortcollider: Collider = new Collider();

  private ship: Ship;
  private ships: Ship[] = [];

  constructor(private http: HttpClient, gamesvc: GameService) {
    gamesvc.myship().subscribe(data => {
      this.ship = data;
    });

    gamesvc.ships().subscribe(data => {
      this.ships = data;
    });

    // refresh targetting every second instead of 4x a second
    var my: TargettingService = this;
    setInterval(function () {
      if (my.ships && my.ship) {
        my.refreshTargetting();
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

  canFire(s: Ship): boolean {
    return (this.targetting.has(s) ? this.targetting.get(s).fire : false);
  }

  firingRange(): boolean {
    var ok: boolean = false;
    this.targetting.forEach(t => { 
      if (t.fire) {
        ok = true;
      }
    });
    return ok;
  }

  boardingRange(): boolean {
    var ok: boolean = false;
    this.targetting.forEach(t => {
      if (t.board) {
        ok = true;
      }
    });
    return ok;
  }

}

interface targetting {
  fire?: boolean,
  board?: boolean
}
