import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Ship } from '../generated';

import { Collider } from '../../../../common/tools/collider';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class TargettingService {

  private targets: Subject<Ship[]> = new Subject<Ship[]>();
  private targetting: Map<Ship, targetting> = new Map<Ship, targetting>();
  longcollider: Collider = new Collider();
  shortcollider: Collider = new Collider();

  private myship: Ship = GameService.EMPTYSHIP;
  private ships: Ship[] = [];

  constructor(gamesvc: GameService) {
    gamesvc.myship().subscribe(data => {
      this.myship = data;
    });

    gamesvc.ships().subscribe(data => {
      this.ships = data;
    });

    // refresh targetting every second instead of 4x a second
    setInterval(()=> {
      if (this.ships && this.myship) {
        this.refreshTargetting();
      }
    }, 500);
  }

  private refreshTargetting() {
    this.longcollider.clear();
    this.shortcollider.clear();

    //var isdocked: boolean = (null != this.ship.docked);
    const ammo: number = this.myship.ammo || 0;
    const range: number = this.myship.cannons?.range || 0;
    if (!(ammo > 0 && range > 0 )) {
      this.targets.next([]);
      return;
    }

    this.ships.forEach(ship => {
      var ismyship: boolean = (ship.id === this.myship.id);
      //const shiprange: number = this.ship.cannons?.range || 0;

      this.longcollider.add({
        id: ship.id,
        src: ship,
        x: ship.location.x,
        y: ship.location.y,
        r: ismyship ? range : 15
      });
      this.shortcollider.add({
        id: ship.id,
        src: ship,
        x: ship.location.x,
        y: ship.location.y,
        r: 15
      });
    });

    var targs: Map<Ship, targetting> = new Map<Ship, targetting>();
    this.longcollider.checkCollisions(this.myship.id).forEach(body => {
      targs.set(body.src, { fire: true });
    });
    this.shortcollider.checkCollisions(this.myship.id).forEach(body => {
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
    const tship: targetting = this.targetting.get(s) || { fire: false, board: false };
    return tship.board || false;
  }

  private cannonsready(): boolean {
    return ((this.myship?.ammo || 0) > 0 && !(this.myship?.cannons?.reloading || false));
  }

  canFire(s: Ship): boolean {
    const tship: targetting = this.targetting.get(s) || { fire: false, board: false };
    return this.cannonsready() && tship.fire || false;
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
