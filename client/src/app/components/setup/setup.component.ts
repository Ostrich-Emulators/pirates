import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { ShipService } from '../../services/ship.service'
import { GameService } from '../../services/game.service'

import { Names } from '../../../../../common/tools/names'

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {
  avatar: string;
  captain: string = Names.captain();
  female: boolean = false;
  shipname: string = Names.ship();
  color: string = '#5F87FF';

  constructor(private shipsvc: ShipService, private gamesvc:GameService, private router: Router) {
    var avidx = Math.random() * shipsvc.avatars.length;
    this.avatar = shipsvc.avatars[Math.floor(avidx)];
  }

  ngOnInit() {
  }

  setAvatar(a) {
    this.avatar = a;
  }

  setAppelation(f){
    this.female = f;
  }

  newcaptain() {
    this.captain = Names.captain( this.female);
  }

  newname() {
    this.shipname = Names.ship();
  }

  sail() {
    this.gamesvc.start(this.captain, this.female, this.avatar,
      this.shipname, this.color ).subscribe(data => {
        this.router.navigate(['/game']);
    });
  }
}
