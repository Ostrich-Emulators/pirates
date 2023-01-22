import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { Ship } from '../../../../common/generated/model/ship';
import { Player } from '../../../../common/generated/model/player';
import { Location } from '../../../../common/generated/model/location'
import { StatusResponse } from '../../../../common/generated/model/statusResponse'
import { CombatResult } from '../../../../common/generated/model/combatResult';
import { BoardResult } from '../../../../common/generated/model/boardResult';
import { Purchase } from '../../../../common/generated/model/purchase';

@Injectable()
export class GameService {
  public REFRESH_RATE: number = 250;
  private _player: BehaviorSubject<Player>;
  private _myship: BehaviorSubject<Ship>;
  private _ships: Subject<Ship[]> = new Subject<Ship[]>();
  private _messages: Subject<string[]> = new Subject<string[]>();
  private _combat: Subject<CombatResult[]> = new Subject<CombatResult[]>();
  private _board: Subject<BoardResult[]> = new Subject<BoardResult[]>();
  private _monster: Subject<Location> = new Subject<Location>();
  private _pool: Subject<Location> = new Subject<Location>();
  private playerid: String;
  private shipid: String;
  private allships: Ship[] = [];

  private BASEURL: string = 'http://localhost:30000';

  constructor(private http: HttpClient) {
    console.log('game service ctor');
    // this stuff is really just for development restarts
    if (null != sessionStorage.getItem('player')) {
      console.log('starting from localStorage data');

      var player: Player = JSON.parse(sessionStorage.getItem('player'));
      var ship: Ship = JSON.parse(sessionStorage.getItem('ship'));
      this.playerid = player.id;

      this._player = new BehaviorSubject<Player>(player);
      this._myship = new BehaviorSubject<Ship>(ship);

      console.log(player);
      console.log(ship);

      this.refreshData();
      setInterval(() => { this.refreshData(); }, this.REFRESH_RATE);
    }
  }

  ngOnDestroy() {
  }

  start(name: string, female: boolean, avatar: string,
    shipname: string, color: string): Observable<boolean> {
    var my: GameService = this;
    var pirate: Pirate = { name: name, female: female, avatar: avatar };
    var url = this.BASEURL + '/players';

    var obs: Subject<boolean> = new Subject<boolean>();
    this.http.put(url, { pirate: pirate, ship: shipname, color: color }).pipe(take(1)).subscribe((data:any) => {
      console.log('started game: ', data);
      var player: Player = data.player;
      this.playerid = player.id;
      var ship: Ship = data.ship[0];
      this.shipid = ship.id;

      sessionStorage.setItem('player', JSON.stringify(player));
      sessionStorage.setItem('ship', JSON.stringify(ship));

      setInterval(() => { my.refreshData(); }, this.REFRESH_RATE);
      this.refreshData();

      this._myship = new BehaviorSubject<Ship>(ship);
      this._player = new BehaviorSubject<Player>(player);
      obs.next(true);
    },
      (err) => {
        console.error('something happened!');
        console.error(err);
      });

    return obs;
  }

  refreshData() {
    //console.log('into refreshdata');
    this.http.get(this.BASEURL + '/game/status/' + this.playerid)
      .pipe(take(1))
      .subscribe((data: StatusResponse) => {
        var mees: Ship[] = data.ships.filter(shp => shp.ownerid === this.playerid);
        if (mees.length > 0) {
          this._myship.next(mees[0]);
          this.shipid = mees[0].id;
        }

        // FIXME: maybe figure out who's sunk since the last update?
        this.allships = data.ships;
        this._ships.next(this.allships);

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

  ships(): Observable<Ship[]> {
    return this._ships;
  }

  messages(): Observable<string[]> {
    return this._messages;
  }

  combat(): Observable<CombatResult[]> {
    return this._combat;
  }

  boarding(): Observable<BoardResult[]> {
    return this._board;
  }

  myship(): Observable<Ship> {
    return this._myship;
  }

  myplayer(): Observable<Player>{
    return this._player;
  }

  monsterloc(): Observable<Location> {
    return this._monster;
  }

  poolloc(): Observable<Location> {
    return this._pool;
  }

  fire(at: Ship) {
    var url: string = this.BASEURL + '/ships/' + this.shipid + '/fire';
    this.http.post(url, { targetid: at.id }).pipe(take(1)).subscribe();
  }

  board(at: Ship) { // try to board anothe rship
    console.log('trying to board: ' + JSON.stringify(at));
    var url: string = this.BASEURL + '/ships/' + this.shipid + '/board';
    this.http.post(url, { targetid: at.id }).pipe(take(1)).subscribe();
  }

  move(x: number, y: number) {
    var loc: Location = { x: x, y: y };
    var url: string = this.BASEURL + '/ships/' + this.shipid + '/course';
    this.http.post(url, loc).pipe(take(1)).subscribe();
  }

  undock() {
    var url: string = this.BASEURL + '/ships/' + this.shipid + '/undock';
    this.http.post(url, null).pipe(take(1)).subscribe();
  }

  buy(city: Purchase) {
    var url: string = this.BASEURL + '/ships/' + this.shipid + '/buy';
    this.http.post(url, city).pipe(take(1)).subscribe();
  }
}
