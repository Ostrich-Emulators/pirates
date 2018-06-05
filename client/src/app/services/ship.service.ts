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

  private ctargets: Ship[] = [];
  private btargets: Ship[] = [];
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

  get(avatar: string, fghex?: string, bghex?: string): any {
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

  getAll() {
    var ret: any[] = [];
    this.images.forEach(img => { ret.push(img) });
    return ret;
  }

  getTargets(): Ship[]{
    var set: Set<Ship> = new Set<Ship>();
    this.ctargets.forEach(s => { 
      set.add(s);
    });
    this.btargets.forEach(s => {
      set.add(s);
    });
    var ret: Ship[] = [];
    set.forEach(s => {
      ret.push(s);
    });

    return ret;
  }

  setCannonTargets(ships: Ship[]) {
    this.ctargets = ships;
  }

  setBoardingTargets(ships: Ship[]) {
    this.btargets = ships;
  }

  canBoard(s: Ship) :boolean {
    return this.btargets.includes(s);
  }

  canFire(s: Ship): boolean {
    return this.ctargets.includes(s);
  }
}
