import { Component, OnInit } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { ShipService } from '../../../services/ship.service';
import { Ship } from '../../../../../../common/model/ship';

@Component({
  selector: 'app-action-display',
  templateUrl: './action-display.component.html',
  styleUrls: ['./action-display.component.css']
})
export class ActionDisplayComponent implements OnInit {

  constructor( private gamesvc:GameService, private shipsvc:ShipService) { }

  ngOnInit() {
  }

  fire(ship) {
    this.gamesvc.fire(ship);
  }

  board(ship) {
    this.gamesvc.fight(JSON.parse(ship));
  }

}
