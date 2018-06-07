import { Component, OnInit } from '@angular/core';
import { ShipService } from '../../../services/ship.service';
import { GameService } from '../../../services/game.service';
import { Crew } from '../../../../../../common/model/crew';

@Component({
  selector: 'app-crew-display',
  templateUrl: './crew-display.component.html',
  styleUrls: ['./crew-display.component.css']
})
export class CrewDisplayComponent implements OnInit {
  private crew: Crew;

  constructor(private shipsvc: ShipService, private gamesvc: GameService) { }

  ngOnInit() {
    var my: CrewDisplayComponent = this;
    this.gamesvc.myship().subscribe(data => {
      my.crew = data.crew;
    });
  }
}
