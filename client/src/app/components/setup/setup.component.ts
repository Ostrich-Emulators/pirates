import { Component, OnInit } from '@angular/core';

import { GameService } from '../../services/game.service';
import { AvatarService } from '../../services/avatar.service';

import { Names } from '../../../../../common/tools/names'
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  captain: string;
  _female: boolean = (Math.random()<0.5);
  shipname: string = Names.ship();
  //color: string = '#5F87FF';
  //color: ThemePalette = 'primary';
  color: ThemePalette;
  avataridx: number = 0;

  constructor(public imgsvc: AvatarService, private gamesvc: GameService,
    private router: Router) {
    this.avataridx = Math.random() * imgsvc.avatars.length;
    this.captain = Names.captain(this.female);
  }

  ngOnInit(): void {
  }

  set female(f:boolean) {
    this._female = f;
    this.newcaptain();
  }

  get female(): boolean {
    return this._female;
  }

  newcaptain() {
    this.captain = Names.captain(this.female);
  }

  newship() {
    this.shipname = Names.ship();
  }

  sail() {
    var anyo: any = this.color;
    var mycolor: string = anyo?.hex || '#5F87FF';
    this.gamesvc.start(this.captain, this.female, this.avataridx,
      this.shipname, mycolor).pipe(take(1)).subscribe(data => {
        this.router.navigate(['/game']);
      });
  }
}
