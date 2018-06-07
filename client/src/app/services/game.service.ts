import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Ship } from '../../../../common/model/ship'
import { Pirate } from '../../../../common/model/pirate'
import { Player } from '../../../../common/model/player'
import { Location } from '../../../../common/model/location'
import { StatusResponse } from '../../../../common/model/status-response'
import { CombatResult } from '../../../../common/model/combat-result';
import { Collider } from '../../../../common/tools/collider';

@Injectable()
export class GameService {
  public REFRESH_RATE: number = 250;
  private me: Player;
  private _player: Subject<Player> = new Subject<Player>();
  private _ships: Subject<Ship[]> = new Subject<Ship[]>();
  private _myship: Subject<Ship> = new Subject<Ship>();
  private _messages: Subject<string[]> = new Subject<string[]>();
  private _combat: Subject<CombatResult[]> = new Subject<CombatResult[]>();
  private _monster: Subject<Location> = new Subject<Location>();
  private _pool: Subject<Location> = new Subject<Location>();

  private BASEURL: string = 'http://localhost:30000';

  constructor(private http: HttpClient) {
    if (null != localStorage.getItem('pirate')) {
      this.me = JSON.parse(localStorage.getItem('pirate'));
      this._player.next(this.me);
    }
  }

  start(name: string, female: boolean, avatar: string,
    shipname: string, color: string): Observable<Player>{
    var my: GameService = this;
    var pirate: Pirate = { name: name, female: female, avatar: avatar };
    var url = this.BASEURL + '/players';

    this.http.put(url, { pirate: pirate, ship: shipname, color:color }).subscribe(
      (data: Player) => {
        console.log(data);
        my.me = data;
        localStorage.setItem('pirate', JSON.stringify(data));
        my._player.next(my.me);
      },
      (err) => {
        console.error('something happened!');
        console.error(err);
      });
    
    my.refreshData();
    setInterval(function () { my.refreshData(); }, this.REFRESH_RATE);
  
    return this._player;
  }

  refreshData() {
    //console.log('into refreshdata');
    var my: GameService = this;
    this.http.get(this.BASEURL + '/game/status/' + this.me.id).subscribe((data: StatusResponse) => {
      data.ships.forEach(shp => {
        if (shp.id === this.me.ship.id) {
          my.me.ship = shp;
          my._myship.next(shp);
        }
      });
      my._ships.next(data.ships);

      if (data.messages.length > 0) {
        my._messages.next(data.messages);
      }

      if (data.combat && data.combat.length>0) {
        my._combat.next(data.combat);
      }

      if (data.monsterloc) {
        my._monster.next(data.monsterloc);
      }

      if (data.poolloc) {
        my._pool.next(data.poolloc);
      }
    });
  }

  ships(): Observable<Ship[]> {
    return this._ships;
  }

  messages(): Observable<string[]>{
    return this._messages;
  }

  combat(): Observable<CombatResult[]>{
    return this._combat;
  }

  myplayer(): Player {
    return this.me;
  }
  
  mypirate(): Pirate {
    var pi = this.me.pirate;
    return pi;
  }

  myship(): Observable<Ship> {
    return this._myship;
  }

  monsterloc(): Observable<Location>{
    return this._monster;
  }

  poolloc(): Observable<Location>{
    return this._pool;
  }

  fire(at: Ship) {
    var url: string = this.BASEURL + '/ships/' + this.me.ship.id + '/fire';
    this.http.post(url, { targetid: at.id }).subscribe();
  }

  board(at: Ship) { // try to board anothe rship
    var url: string = this.BASEURL + '/ships/' + this.me.ship.id + '/board';
    this.http.post(url, at.id).subscribe();
  }

  move(x: number, y: number) {
    var loc: Location = { x: x, y: y };
    var url: string = this.BASEURL + '/ships/' + this.me.ship.id + '/course';
    this.http.post(url, loc).subscribe();
  }
}
