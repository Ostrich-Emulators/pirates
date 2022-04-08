import { Component, OnInit, OnDestroy } from '@angular/core';

import { GameService } from '../../../services/game.service';
import { Ship } from '../../../../../../common/model/ship';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-supply-display',
  templateUrl: './supply-display.component.html',
  styleUrls: ['../info-display.scss']
})
export class SupplyDisplayComponent implements OnInit, OnDestroy {
  private ship: Ship;
  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    var my: SupplyDisplayComponent = this;
    this.gamesvc.myship().pipe(takeUntil(componentDestroyed(this))).subscribe(data => { 
      my.ship = data;
    });
  }
  ngOnDestroy(): void {
  }
}
