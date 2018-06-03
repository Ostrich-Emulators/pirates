import { Component, OnInit } from '@angular/core';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-action-display',
  templateUrl: './action-display.component.html',
  styleUrls: ['./action-display.component.css']
})
export class ActionDisplayComponent implements OnInit {

  constructor( private gamesvc:GameService) { }

  ngOnInit() {
  }

  fire() {
    this.gamesvc.fire();
  }

  board() {
    
  }

}
