import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Ship } from '../../../../common/model/ship'
import { Pirate } from '../../../../common/model/pirate'
import { Player } from '../../../../common/model/player'
import { Location } from '../../../../common/model/location'

@Injectable()
export class GameService {
  private me: Player;
  private _player: Subject<Player> = new Subject<Player>();
  private BASEURL: string = 'http://localhost:30000';

  constructor(private http: HttpClient) {
    if (null != localStorage.getItem('pirate')) {
      this.me = JSON.parse(localStorage.getItem('pirate'));
      this._player.next(this.me);
    }
  }

  start(name: string, female: boolean, avatar: string): Observable<Player>{
    var my: GameService = this;
    var pirate: Pirate = { name: name, female: female, avatar: avatar };
    console.log(pirate);
    var url = this.BASEURL + '/players';

    this.http.put(url, pirate).subscribe(
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
  
    return this._player;
  }

  ships(): Observable<{}> {
    return this.http.get(this.BASEURL + '/ships');
  }

  move(x: number, y: number) {
    var loc: Location = { x: x, y: y };
    console.log('here?');
    console.log(loc);
    console.log(this.me.ship);
    this.http.post(this.BASEURL + '/ships/' + this.me.ship.id + '/course', loc);
  }

  myplayer(): Player {
    return this.me;
  }
  
  mypirate(): Pirate {
    var pi = this.me.pirate;
    return pi;
  }

  myship(): Ship {
    return this.me.ship;
  }
}
