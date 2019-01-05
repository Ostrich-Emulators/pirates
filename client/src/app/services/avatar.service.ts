import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AvatarService {
  get avatars(): string[] {
    return [
      "/assets/avatar1.svg",
      "/assets/avatar2.svg",
      "/assets/avatar3.svg",
      "/assets/avatar4.svg",
      "/assets/avatar5.svg",
      "/assets/avatar6.svg",
    ];
  }

  private svgxmls: Map<string, string> = new Map<string, string>();
  private images: Map<string, any> = new Map<string, any>();


  constructor(private http: HttpClient, gamesvc: GameService) { 

    this.avatars.forEach(av => {
      http.get(av, { responseType: 'text' }).subscribe(data => {
        this.svgxmls.set(av, "data:image/svg+xml;charset=utf-8," + data);
        var im = new Image();
        im.src = data;
        this.images.set(av, im);
      });
    });

    var others: string[] = ['/assets/galleon.svg', '/assets/abandoned.svg'];
    others.forEach(av => {
      http.get(av, { responseType: 'text' }).subscribe(data => {
        this.svgxmls.set(av, "data:image/svg+xml;charset=utf-8," + data);
        var im = new Image();
        im.src = data;
        this.images.set(av, im);
      });
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
}
