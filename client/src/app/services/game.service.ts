import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';


import { Ship } from '../generated/model/ship';
import { Player } from '../generated/model/player';
import { Location } from '../generated/model/location';
import { CombatResult } from '../generated/model/combatResult';
import { BoardResult } from '../generated/model/boardResult';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { InternalGameService } from '../generated/api/internalGame.service';
import { PlayerAndShip } from '../generated/model/playerAndShip';
import { JoinData } from '../generated/model/joinData';
import { StatusResponse } from '../generated/model/statusResponse';
import { Names } from '../../../../common/tools/names';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public REFRESH_RATE: number = 5000;
  private _player: BehaviorSubject<Player> = new BehaviorSubject<Player>({
    id: 'none yet',
    name: 'none yet',
    ai: false,
    female: (Math.random() < 0.5),
    avatar: 0,
    color: 'black'
  });
  private _myship: BehaviorSubject<Ship> = new BehaviorSubject<Ship>({
    id: 'none yet',
    name: Names.ship()
  });

  private _ships: Subject<Ship[]> = new Subject<Ship[]>();
  private _messages: Subject<string[]> = new Subject<string[]>();
  private _combat: Subject<CombatResult[]> = new Subject<CombatResult[]>();
  private _board: Subject<BoardResult[]> = new Subject<BoardResult[]>();
  private _monster: Subject<Location> = new Subject<Location>();
  private _pool: Subject<Location> = new Subject<Location>();

  constructor(private http: HttpClient, private igame:InternalGameService ) {
    console.log('game service ctor');
    // this stuff is really just for development restarts
    if (null != sessionStorage.getItem('player')) {
      console.log('starting from localStorage data');

      var player: Player = JSON.parse(sessionStorage.getItem('player') || '');
      var ship: Ship = JSON.parse(sessionStorage.getItem('ship') || '');

      this._player.next(player);
      this._myship.next(ship);

      console.log(player);
      console.log(ship);

      this.refreshData();
      setInterval(() => this.refreshData(), this.REFRESH_RATE);
    }
  }

  start(name: string, female: boolean, avatar: number,
    shipname: string, color: string): Observable<boolean> {
    
    var joindata: JoinData = {
      female: female,
      captain: name,
      avatar: avatar,
      color: color,
      shipname: shipname
    };

    return new Observable<boolean>(subscriber => {
      this.igame.join(joindata).pipe(take(1)).subscribe({
        next: (pas: PlayerAndShip) => {
          console.log('joined game: ', pas);
          var player: Player = pas.player;
          var ship: Ship = pas.ship;

          sessionStorage.setItem('player', JSON.stringify(player));
          sessionStorage.setItem('ship', JSON.stringify(ship));

          this.refreshData();
          setInterval(() => this.refreshData(), this.REFRESH_RATE);

          this._player.next(player);
          this._myship.next(ship);
          subscriber.next(true);
          subscriber.complete();
        },
        error: (err: any) => {
          console.error('something happened!');
          console.error(err);
          subscriber.next(false);
          subscriber.complete();
        }
      });
    });
  }

  refreshData() {
    this.igame.getStatus(this._player.value.id).pipe(take(1)).subscribe((data:StatusResponse) => {
      var myship: Ship = data.ships.filter(shp => shp.ownerid === this._player.value.id)
        .reduce((pv, cv) => cv, this._myship.value);
      this._myship.next(myship);

      // FIXME: maybe figure out who's sunk since the last update?
      this._ships.next(data.ships);

      if (data.messages.length > 0) {
        this._messages.next(data.messages);
      }

      if (data.combat && data.combat.length > 0) {
        this._combat.next(data.combat);
      }

      if (data.board && data.board.length > 0) {
        this._board.next(data.board);
      }

      if (data.monsterloc) {
        this._monster.next(data.monsterloc);
      }

      if (data.poolloc) {
        this._pool.next(data.poolloc);
      }
    });
  }
}
