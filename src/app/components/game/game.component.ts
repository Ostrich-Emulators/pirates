import { Component, OnInit } from '@angular/core';
import { ShipService } from '../../services/ship.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor( private shipsvc:ShipService) { }

  ngOnInit() {
  }

}
