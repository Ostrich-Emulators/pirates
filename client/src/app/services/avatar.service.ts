import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { BehaviorSubject, forkJoin } from 'rxjs';

@Injectable()
export class AvatarService {
  public avatars: string[] = [
    "/assets/avatar1.svg",
    "/assets/avatar2.svg",
    "/assets/avatar3.svg",
    "/assets/avatar4.svg",
    "/assets/avatar5.svg",
    "/assets/avatar6.svg",
  ];

  private svgxmls: Map<string, string> = new Map<string, string>();
  loaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, gamesvc: GameService) {
    var links: string[] = [...this.avatars, '/assets/galleon.svg', '/assets/abandoned.svg'];
    forkJoin(links.map(av => http.get(av, { responseType: 'text' }).pipe(take(1))))
      .pipe(take(1)).subscribe(dataarr => {
        links.forEach((av, idx) => this.svgxmls.set(av, dataarr[idx]));
        this.loaded.next(true);
      });
  }

  svg(avatar: string, fghex: string = '#ffffff', bghex: string = '#000000'): string {
    return this.svgxmls.get(avatar).replace(/fill="#ffffff"/, `fill="${fghex}"`)
      .replace(/fill="#000000"/, `fill="${bghex}"`);
  }
}
