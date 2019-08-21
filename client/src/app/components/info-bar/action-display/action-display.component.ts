import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { TargettingService } from '../../../services/targetting.service';
import { Ship } from '../../../../../../common/model/ship';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-action-display',
  templateUrl: './action-display.component.html',
  styleUrls: ['./action-display.component.css']
})
export class ActionDisplayComponent implements OnInit, OnDestroy {
  private targets: Ship[];

  constructor(private gamesvc: GameService, private shipsvc: TargettingService) { }

  ngOnDestroy(): void {}
  ngOnInit() {
    var my: ActionDisplayComponent = this;
    this.shipsvc.getTargets().pipe(takeUntil(componentDestroyed(this))).subscribe(data => {
      my.targets = data;
    });
  }

  fire(ship) {
    this.gamesvc.fire(ship);
  }

  board(ship) {
    this.gamesvc.board(ship);
  }

}
