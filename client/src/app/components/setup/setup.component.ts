import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { AvatarService } from '../../services/avatar.service'
import { GameService } from '../../services/game.service'

import { Names } from '../../../../../common/tools/names'
import { take } from 'rxjs';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  avataridx: number = 0;
  captain: string = Names.captain();
  female: boolean = false;
  shipname: string = Names.ship();
  public color: any;

  constructor(public imgsvc: AvatarService,
    private gamesvc: GameService,
    private router: Router) {
    this.avataridx = Math.floor(Math.random() * imgsvc.avatars.length);
  }

  ngOnInit() {
  }

  setAppelation(f: boolean) {
    this.female = f;
    this.newcaptain();
  }

  newcaptain() {
    this.captain = Names.captain(this.female);
  }

  newship() {
    this.shipname = Names.ship();
  }

  sail() {
    console.log('sailing!');


    var mycolor: string = this.color?.hex || '#5F87FF';
    this.gamesvc.start(this.captain, this.female, this.avataridx,
      this.shipname, mycolor).pipe(take(1)).subscribe(data => {
        this.router.navigate(['/game']);
      });
  }
}