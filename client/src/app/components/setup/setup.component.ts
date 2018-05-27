import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ShipService } from '../../services/ship.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {
  avatar: string;
  captain: string = '';
  female: boolean = false;

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

  sail() {
    this.gamesvc.start(this.captain, this.female, this.avatar).subscribe(data => {
      this.router.navigate(['/game']);
    });
  }
}
