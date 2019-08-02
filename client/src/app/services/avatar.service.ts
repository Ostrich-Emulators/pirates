import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

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
    console.log('avatar service ctor');
    this.avatars.forEach(av => {
      http.get(av, { responseType: 'text' }).pipe(take(1)).subscribe(
        (data) => {
          this.svgxmls.set(av, "data:image/svg+xml;charset=utf-8," + data);
          var im = new Image();
          im.src = data;
          this.images.set(av, im);
        },
        (err) => {
          console.log('error getting ', av);
        });
    });

    var others: string[] = ['/assets/galleon.svg', '/assets/abandoned.svg'];
    others.forEach(av => {
      http.get(av, { responseType: 'text' }).pipe(take(1)).subscribe(
        (data) => {
          this.svgxmls.set(av, "data:image/svg+xml;charset=utf-8," + data);
          var im = new Image();
          im.src = data;
          this.images.set(av, im);
        },
        (err) => {
          console.log('error getting ', av);
        });
    });
  }

  getImage(avatar: string, fghex?: string, bghex?: string): any {
    console.log('getImage ' + avatar);
    console.log(this.svgxmls);
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
      console.log('getting standard', avatar);
      console.log(this.svgxmls.get(avatar));
      return this.svgxmls.get(avatar).substr("data:image/svg+xml;charset=utf-8,".length);
    }
  }

  getAllImages(): any[] {
    console.log('getall images');
    return Array.from(this.images.values());
  }
}
