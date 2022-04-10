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
import { PlayerService, ShipService } from '../generated';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public REFRESH_INTERVAL_MS: number = 500;

  public static readonly EMPTYLOC = {
    x: 0,
    y: 0
  };

  public static readonly EMPTYPLAYER: Player = {
    id: 'none yet',
    name: 'none yet',
    ai: false,
    female: (Math.random() < 0.5),
    avatar: 0,
    color: 'black'
  };

  public static readonly EMPTYSHIP: Ship = {
    id: 'none yet',
    name: Names.ship(),
    crew: { count: 0, meleeSkill: 0, sailingSkill: 0 },
    location: GameService.EMPTYLOC,
    course: { dstx: 0, dsty: 0, speedx: 0, speedy: 0 }
  };

  private _player: BehaviorSubject<Player> = new BehaviorSubject<Player>(GameService.EMPTYPLAYER);
  private _myship: BehaviorSubject<Ship> = new BehaviorSubject<Ship>(GameService.EMPTYSHIP);

  private _ships: BehaviorSubject<Ship[]> = new BehaviorSubject<Ship[]>([]);
  private _players: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  private _messages: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private _combat: BehaviorSubject<CombatResult[]> = new BehaviorSubject<CombatResult[]>([]);
  private _board: BehaviorSubject<BoardResult[]> = new BehaviorSubject<BoardResult[]>([]);
  private _monster: BehaviorSubject<Location> = new BehaviorSubject<Location>(GameService.EMPTYLOC);
  private _pool: BehaviorSubject<Location> = new BehaviorSubject<Location>(GameService.EMPTYLOC);
  private playerRefreshInterval: number = 0;
  private shipRefreshInterval: number = 0;

  constructor(private http: HttpClient, private igame: InternalGameService,
    private psvc: PlayerService, private ssvc: ShipService) {

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

      this.startPolling();
    }
  }

  private startPolling() {
    if (this.playerRefreshInterval > 0) {
      window.clearInterval(this.playerRefreshInterval);
    }
    if (this.shipRefreshInterval > 0) {
      window.clearInterval(this.shipRefreshInterval);
    }

    this.refreshPlayers();
    this.playerRefreshInterval = window
      .setInterval(() => this.refreshPlayers(), this.REFRESH_INTERVAL_MS * 4);

      
    this.refreshData();
    this.shipRefreshInterval = window
      .setInterval(() => this.refreshData(), this.REFRESH_INTERVAL_MS);
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

          this._players.next(this._players.value.concat(player));
          this._ships.next(this._ships.value.concat(ship));

          this._player.next(player);
          this._myship.next(ship);

          this.startPolling();
          subscriber.next(true);
          subscriber.complete();
        },
        error: (err: any) => {
          console.error('something happened!');
          console.error(err);
          subscriber.error(false);
          subscriber.complete();
        }
      });
    });
  }

  refreshPlayers() {
    this.psvc.getAll().pipe(take(1)).subscribe((data: Player[]) => {
      //console.log('player refresh');
      const oldplayers: Player[] = this._players.value;
      const newplayers: Player[] = data.filter(player => !oldplayers.map(p => p.id).includes(player.id));

      if (newplayers.length > 0) {
        this._players.next(data);
      }
    });
  }

  refreshData() {
    this.igame.getStatus(this._player.value.id).pipe(take(1)).subscribe((data: StatusResponse) => {
      //console.log('ship refresh');
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

  playerForShip(ship: Ship | string): Player {
    const id: string = 'string' === typeof (ship)
      ? this._ships.value.filter(s => s.id === ship)[0].ownerid||'-1'
      : ship.ownerid || '-1';
    return this._players.value.filter(p => p.id === id)[0];
  }

  myship(): Observable<Ship> {
    return this._myship.asObservable();
  }

  myplayer(): Observable<Player> {
    return this._player.asObservable();
  }

  monsterloc(): Observable<Location> {
    return this._monster.asObservable();
  }

  poolloc(): Observable<Location> {
    return this._pool.asObservable();
  }

  combat(): Observable<CombatResult[]> {
    return this._combat.asObservable();
  }

  ships(): Observable<Ship[]> {
    return this._ships.asObservable();
  }

  move(x: number, y: number) {
    this.ssvc.sailTo({ x: x, y: y }, this._myship.value.id).pipe(take(1)).subscribe();
  }

  fire(s: Ship) {
    this.ssvc.fire({ targetid: s.id }, this._myship.value.id).pipe(take(1)).subscribe();
  }

  board(s: Ship) {
    this.ssvc.board({ targetid: s.id }, this._myship.value.id).pipe(take(1)).subscribe();
  }
}
