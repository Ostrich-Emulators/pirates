import { Component, OnInit, OnDestroy } from '@angular/core';

import { GameService } from '../../../services/game.service';
import { Ship } from '../../../../../../common/model/ship';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-ship-display',
  templateUrl: './ship-display.component.html',
  styleUrls: ['../info-display.scss']
})
export class ShipDisplayComponent implements OnInit, OnDestroy {
  private ship: Ship;

  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    this.gamesvc.myship().pipe(takeUntil(componentDestroyed(this))).subscribe(data => {
      this.ship = data;
    });
  }
  ngOnDestroy(): void {
  }
}
