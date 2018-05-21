import { Component, OnInit } from '@angular/core';
import { ShipService } from '../../services/ship.service';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-info-bar',
  templateUrl: './info-bar.component.html',
  styleUrls: ['./info-bar.component.css']
})
export class InfoBarComponent implements OnInit {

  constructor(private shipsvc: ShipService, private playersvc: PlayerService,
    private gavesvc: GameService) { }

  ngOnInit() {
  }

}
