import { Component, OnInit } from '@angular/core';

import { GameService } from '../../../services/game.service';
import { Ship } from '../../../../../../common/model/ship';

@Component({
  selector: 'app-ship-display',
  templateUrl: './ship-display.component.html',
  styleUrls: ['./ship-display.component.css']
})
export class ShipDisplayComponent implements OnInit {
  private ship: Ship;

  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    var my: ShipDisplayComponent = this;
    this.gamesvc.myship().subscribe(data => {
      // console.log(data);
      my.ship = data;
    });
  }
}
