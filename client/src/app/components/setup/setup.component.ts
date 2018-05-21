import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ShipService } from '../../services/ship.service';
import { PlayerService } from '../../services/player.service';
import { ShipType } from '../../model/ship-type.enum';
import { ShipDefinition } from '../../model/ship-definition';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {
  definition: ShipDefinition;
  avatars: string[] = [
    "/assets/avatar1.svg",
    "/assets/avatar2.svg",
    "/assets/avatar3.svg",
    "/assets/avatar4.svg"
  ];
  avatar:string;
  captain:string='';
  female:boolean=false;

  constructor(private shipsvc: ShipService, private playersvc:PlayerService, private router: Router) {
    var avidx = Math.random() * this.avatars.length;
    this.avatar = this.avatars[Math.floor(avidx)];
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
    this.playersvc.create( this.captain, this.female, this.avatar );
    this.shipsvc.build(ShipType.SMALL);
    this.router.navigate(['/game']);
  }
}
