import { Component, OnInit } from '@angular/core';

import { ShipService } from '../../../services/ship.service';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-ship-display',
  templateUrl: './ship-display.component.html',
  styleUrls: ['./ship-display.component.css']
})
export class ShipDisplayComponent implements OnInit {

  constructor(private shipsvc: ShipService, private gavesvc: GameService) { }

  ngOnInit() {
    //console.log(this.shipsvc.ship);
  }

}
