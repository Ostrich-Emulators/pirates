import { Component, OnInit } from '@angular/core';
import { ShipService } from '../../services/ship.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  constructor(private shipsvc: ShipService, private game: GameService) {
   }

  ngOnInit() {
  }

}
