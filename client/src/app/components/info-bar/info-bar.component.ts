import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Pirate } from '../../../../../common/model/pirate';

@Component({
  selector: 'app-info-bar',
  templateUrl: './info-bar.component.html',
  styleUrls: ['./info-bar.component.css']
})
export class InfoBarComponent implements OnInit {
  private pirate: Pirate;

  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    this.gamesvc.myplayer().subscribe(p => {
      this.pirate = p.pirate;
    });
  }
}
