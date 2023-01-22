import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, ReplaySubject, take } from 'rxjs';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  public static readonly GALLEON = -1;
  public static readonly ABANDONED = -2;

  public readonly avatars: string[] = [
    "/assets/avatar1.svg",
    "/assets/avatar2.svg",
    "/assets/avatar3.svg",
    "/assets/avatar4.svg",
    "/assets/avatar5.svg",
    "/assets/avatar6.svg",
  ];

  private _loaded: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  private svgxmls: Map<number, string> = new Map<number, string>();
  private images: Map<number, any> = new Map<number, any>();

  constructor(http: HttpClient, gamesvc: GameService) {
    console.log('avatar service ctor');

    var counter: number = 0;
    forkJoin(this.avatars.map(url => http.get(url, { responseType: 'text' })))
      .pipe(take(1)).subscribe({
        next: (data) => data.forEach((svgtxt: string, idx: number) => {
          this.svgxmls.set(idx, svgtxt);
          var im = new Image();
          im.src = this.avatars[idx];
          this.images.set(idx, im);
          counter += 1;
        }),
        error: (err) => {
          console.log('error getting images (1)', err);
        },
        complete: () => {
          console.log('(1)', this.images);
          if (counter === this.avatars.length + others.length) {
            console.log('all avatars are loaded');
            this._loaded.next(true);
          }
        }
      });

    var others: string[] = ['/assets/galleon.svg', '/assets/abandoned.svg'];
    forkJoin(others.map(url => http.get(url, { responseType: 'text' })))
      .pipe(take(1)).subscribe({
        next: (data) => data.forEach((svgtxt: string, idx: number) => {
          this.svgxmls.set(-1 - idx, svgtxt);
          var im = new Image();
          im.src = others[idx];
          this.images.set(-1 - idx, im);
          counter += 1;
        }),
        error: (err) => {
          console.log('error getting images (2)', err);
        },
        complete: () => {
          console.log('(2)', this.images);
          if (counter === this.avatars.length + others.length) {
            console.log('all avatars are loaded');
            this._loaded.next(true);
          }
        }
      });
  }

  public isLoaded(): Observable<boolean> {
    return this._loaded.asObservable();
  }

  getPath(avatar: number): string {
    return this.svgxmls.get(avatar) || '';
  }

  getImage(avatar: number, fghex?: string, bghex?: string): any {
    //console.log('getImage ', avatar, this.images);
    //console.log(this.svgxmls);
    if (fghex || bghex) {
      var svg = this.svgxmls.get(avatar) || '';
      console.log('changing colors', svg);
      if (fghex) {
        svg = svg.replace(/fill="#ffffff"/, `fill="#${fghex}"`);
      }
      if (bghex) {
        svg = svg.replace(/fill="#000000"/, `fill="#${bghex}"`);
      }
      //console.log(svg);
      var im = new Image();
      im.src = `data:image/svg+xml;charset=utf-8,${svg}`;
      //console.log('returing image: ', im);
      //return im;

      // the above code doesn't seem to work
      return this.images.get(avatar);

    }
    else {
      //console.log('getting standard', avatar);
      //console.log(this.svgxmls.get(avatar));
      return this.images.get(avatar);
      //return this.svgxmls.get(avatar);//.substr("data:image/svg+xml;charset=utf-8,".length);
    }
  }
}
