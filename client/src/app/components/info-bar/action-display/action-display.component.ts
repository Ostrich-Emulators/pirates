import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Ship } from 'src/app/generated';
import { GameService } from 'src/app/services/game.service';
import { TargettingService } from 'src/app/services/targetting.service';

@UntilDestroy()
@Component({
  selector: 'app-action-display',
  templateUrl: './action-display.component.html',
  styleUrls: ['./action-display.component.scss']
})
export class ActionDisplayComponent implements OnInit {
  @Input() ship: Ship = GameService.EMPTYSHIP;
  targets: Ship[] = [];

  constructor(private gamesvc: GameService, public tgtsvc: TargettingService) { }

  ngOnInit(): void {
    this.tgtsvc.getTargets().pipe(untilDestroyed(this)).subscribe(ships => this.targets = ships);
  }

  fire(ship: Ship) {
    this.gamesvc.fire(ship);
  }

  board(ship: Ship) {
    this.gamesvc.board(ship);
  }
}
