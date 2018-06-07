import { Component, OnInit } from '@angular/core';

import { ShipService } from '../../../services/ship.service';
import { GameService } from '../../../services/game.service';
import { Ship } from '../../../../../../common/model/ship';

@Component({
  selector: 'app-supply-display',
  templateUrl: './supply-display.component.html',
  styleUrls: ['./supply-display.component.css']
})
export class SupplyDisplayComponent implements OnInit {
  private ship: Ship;
  constructor(private shipsvc: ShipService, private gamesvc: GameService) { }

  ngOnInit() {
    var my: SupplyDisplayComponent = this;
    this.gamesvc.myship().subscribe(data => { 
      my.ship = data;
    });
  }
}
