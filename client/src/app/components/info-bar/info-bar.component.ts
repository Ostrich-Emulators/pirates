import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Pirate } from '../../../../../common/model/pirate';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-info-bar',
  templateUrl: './info-bar.component.html',
  styleUrls: ['./info-bar.component.scss']
})
export class InfoBarComponent implements OnInit, OnDestroy {
  private pirate: Pirate;

  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    this.gamesvc.myplayer().pipe(takeUntil(componentDestroyed(this))).subscribe(p => {
      this.pirate = p.pirate;
    });
  }

  ngOnDestroy(): void {}
}
