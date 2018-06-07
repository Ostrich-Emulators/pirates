import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { Ship } from '../../../../common/model/ship'

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

  private targets: Map<Ship, targetting> = new Map<Ship, targetting>();
  private svgxmls: Map<string, string> = new Map<string, string>();
  private images: Map<string, any> = new Map<string, any>();

  constructor(private http: HttpClient) {
    var my: ShipService = this;
    this.avatars.forEach(av => { 
      http.get(av, { responseType: 'text' }).subscribe(data => {
        my.svgxmls.set(av, "data:image/svg+xml;charset=utf-8," + data);
        var im = new Image();
        im.src = data;
        my.images.set(av, im);
      });
    });

    var av = '/assets/galleon.svg';
    http.get(av, { responseType: 'text' }).subscribe(data => {
      my.svgxmls.set(av, "data:image/svg+xml;charset=utf-8," + data);
      var im = new Image();
      im.src = data;
      my.images.set(av, im);
    });
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

  getTargets(): Map<Ship,targetting>{
    return this.targets;
  }

  getTargetShips(): Ship[] {
    var ret: Ship[] = [];
    this.targets.forEach((v, ship) => {
      ret.push(ship);
    } );
    return ret;
  }

  setTarget(s: Ship, f: boolean, b: boolean) {
    this.targets.set(s, { fire: f, board: b });
  }

  setTargets(map: Map<Ship, targetting>) {
    this.targets = map;
  }

  canBoard(s: Ship) :boolean {
    return (this.targets.has(s) ? this.targets.get(s).board : false);
  }

  canFire(s: Ship): boolean {
    return (this.targets.has(s) ? this.targets.get(s).fire : false);
  }
}

interface targetting {
  fire: boolean,
  board: boolean
}