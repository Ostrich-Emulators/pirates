import { Component, OnInit } from '@angular/core';

import { ShipService } from '../../../services/ship.service';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-supply-display',
  templateUrl: './supply-display.component.html',
  styleUrls: ['./supply-display.component.css']
})
export class SupplyDisplayComponent implements OnInit {

  constructor(private shipsvc: ShipService, private gamesvc: GameService) { }

  ngOnInit() {
    //console.log(this.shipsvc.ship);
  }

}
