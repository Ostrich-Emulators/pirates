import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Ship } from '../../generated/model/ship';
import { GameService } from '../../services/game.service';

@UntilDestroy()
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  ship: Ship = {id: 'none', name: 'unnamed'};
  
  constructor( private game: GameService) { }

  ngOnInit(): void {
    this.game.myship().pipe(untilDestroyed(this)).subscribe(s => this.ship = s);
  }
}
