import { Component, OnInit } from '@angular/core';

import { ShipService } from '../../../services/ship.service';
import { GameService } from '../../../services/game.service';
import { Ship } from '../../../../../../common/model/ship';

@Component({
  selector: 'app-ship-display',
  templateUrl: './ship-display.component.html',
  styleUrls: ['./ship-display.component.css']
})
export class ShipDisplayComponent implements OnInit {
  private ship: Ship;

  constructor(private shipsvc: ShipService, private gamesvc: GameService) { }

  ngOnInit() {
    var my: ShipDisplayComponent = this;
    this.gamesvc.myship().subscribe(data => { 
      my.ship = data;
    });
  }
}
