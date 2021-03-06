import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { TargettingService } from '../../../services/targetting.service';
import { Ship } from '../../../../../../common/model/ship';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-action-display',
  templateUrl: './action-display.component.html',
  styleUrls: ['./action-display.component.scss']
})
export class ActionDisplayComponent implements OnInit, OnDestroy {
  private targets: Ship[];
  ship: Ship;

  constructor(private gamesvc: GameService, private shipsvc: TargettingService) { }

  ngOnDestroy(): void {}
  ngOnInit() {
    this.shipsvc.getTargets().pipe(takeUntil(componentDestroyed(this))).subscribe(data => this.targets = data);
    this.gamesvc.myship().pipe(takeUntil(componentDestroyed(this))).subscribe(s => this.ship = s);
  }

  fire(ship) {
    this.gamesvc.fire(ship);
  }

  board(ship) {
    this.gamesvc.board(ship);
  }

}
