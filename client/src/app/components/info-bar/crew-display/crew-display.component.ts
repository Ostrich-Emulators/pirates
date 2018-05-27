import { Component, OnInit } from '@angular/core';
import { ShipService } from '../../../services/ship.service';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-crew-display',
  templateUrl: './crew-display.component.html',
  styleUrls: ['./crew-display.component.css']
})
export class CrewDisplayComponent implements OnInit {

  constructor(private shipsvc: ShipService, private gamesvc: GameService) { }

  ngOnInit() {
//    console.log(this.shipsvc.crew);
  }

}
