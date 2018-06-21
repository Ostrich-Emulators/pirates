import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { Ship } from '../../../../common/model/ship'
import { GameService } from './game.service';
import { Collider } from '../../../../common/tools/collider';
import { Subject } from 'rxjs/Subject';
import { CollisionBody } from '../../../../common/model/body';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ShipService {
  public avatars: string[] = [
    "/assets/avatar1.svg",
    "/assets/avatar2.svg",
    "/assets/avatar3.svg",
    "/assets/avatar4.svg",
    "/assets/avatar5.svg",
    "/assets/avatar6.svg",
  ];

  private targets: Subject<Ship[]> = new Subject<Ship[]>();
  private targetting: Map<Ship, targetting> = new Map<Ship, targetting>();
  longcollider: Collider = new Collider();
  shortcollider: Collider = new Collider();

  private svgxmls: Map<string, string> = new Map<string, string>();
  private images: Map<string, any> = new Map<string, any>();
  private ship: Ship;
  private ships: Ship[] = [];

  constructor(private http: HttpClient, gamesvc: GameService) {
    var my: ShipService = this;
    this.avatars.forEach(av => {
      http.get(av, { responseType: 'text' }).subscribe(data => {
        my.svgxmls.set(av, "data:image/svg+xml;charset=utf-8," + data);
        var im = new Image();
        im.src = data;
        my.images.set(av, im);
      });
    });

    var others: string[] = ['/assets/galleon.svg', '/assets/abandoned.svg'];
    others.forEach(av => {
      http.get(av, { responseType: 'text' }).subscribe(data => {
        my.svgxmls.set(av, "data:image/svg+xml;charset=utf-8," + data);
        var im = new Image();
        im.src = data;
        my.images.set(av, im);
      });
    });

    gamesvc.ships().subscribe(data => {
      my.ships = data;
    });

    gamesvc.myship().subscribe(data => {
      my.ship = data;
    });

    // refresh targetting every second instead of 4x a second
    setInterval(function () {
      if (my.ships && my.ship) {
        my.refreshTargetting();
      }
    }, 1000);

  }

  private refreshTargetting() {
    var my: ShipService = this;
    my.longcollider.clear();
    my.shortcollider.clear();


    if (!(my.ship.ammo > 0 && my.ship.cannons > 0)) {
      my.targets.next([]);
      return;
    }

    my.ships.forEach(ship => {
      var ismyship: boolean = (ship.id === my.ship.id);
      my.longcollider.add({
        id: ship.id,
        src: ship,
        getX: function (): number { return ship.location.x },
        getY: function (): number { return ship.location.y },
        getR: function (): number { return (ismyship ? ship.cannonrange : 15) }
      });
      my.shortcollider.add({
        id: ship.id,
        src: ship,
        getX: function (): number { return ship.location.x },
        getY: function (): number { return ship.location.y },
        getR: function (): number { return 15 }
      });
    });

    var targs: Map<Ship, targetting> = new Map<Ship, targetting>();
    my.longcollider.checkCollisions(my.ship.id).forEach(body => {
      targs.set(body.src, { fire: true });
    });
    my.shortcollider.checkCollisions(my.ship.id).forEach(body => {
      if (targs.has(body.src)) {
        targs.set(body.src, { fire: true, board: true });
      }
      else {
        targs.set(body.src, { board: true });
      }
    });
    my.targetting = targs;

    var targarr: Ship[] = [];
    targs.forEach((val, ship) => {
      targarr.push(ship);
    });
    my.targets.next(targarr);
  }

  getImage(avatar: string, fghex?: string, bghex?: string): any {
    console.log('getting ' + avatar);
    if (fghex || bghex) {
      console.log('changing colors');
      var svg = this.svgxmls.get(avatar);
      if (fghex) {
        svg = svg.replace(/fill="#ffffff"/, 'fill="#' + fghex + '"');
      }
      if (bghex) {
        svg = svg.replace(/fill="#000000"/, 'fill="#' + bghex + '"');
      }
      console.log(svg);
      var im = new Image();
      im.src = svg;
      return im;
    }
    else {
      console.log('getting standard');
      return this.svgxmls.get(avatar).substr("data:image/svg+xml;charset=utf-8,".length);
    }
  }

  getAllImages() {
    var ret: any[] = [];
    this.images.forEach(img => { ret.push(img) });
    return ret;
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
}

interface targetting {
  fire?: boolean,
  board?: boolean
}