import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ShipService {
  public avatars: string[] = [
    "/assets/avatar1.svg",
    "/assets/avatar2.svg",
    "/assets/avatar3.svg",
    "/assets/avatar4.svg",
    "/assets/avatar5.svg",
    "/assets/avatar6.svg"
  ];

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
  }

  get(avatar: string, fghex?: string, bghex?: string): any {
    console.log('getting ' + avatar);
    if (fghex || bghex) {
      console.log('changing colors');
      var svg = this.svgxmls.get(avatar);
      if (fghex) {
        svg = svg.replace(/fill="#ffffff"/, 'fill="' + fghex + '"');
      }
      if (bghex) {
        svg = svg.replace(/fill="#000000"/, 'fill="' + bghex + '"');
      }

      var im = new Image();
      im.src = svg;
      return im;
    }
    else {
      console.log('getting standard');
      return this.svgxmls.get(avatar).substr("data:image/svg+xml;charset=utf-8,".length);
      //return this.images.get(avatar);
    }
  }

  getAll() {
    var ret: any[] = [];
    this.images.forEach(img => { ret.push(img) });
    return ret;
  }
}
