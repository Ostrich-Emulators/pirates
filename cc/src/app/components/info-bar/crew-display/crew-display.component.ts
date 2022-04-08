import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { Crew } from '../../../../../../common/model/crew';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-crew-display',
  templateUrl: './crew-display.component.html',
  styleUrls: ['../info-display.scss']
})
export class CrewDisplayComponent implements OnInit, OnDestroy {
  private crew: Crew;

  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    var my: CrewDisplayComponent = this;
    this.gamesvc.myship().pipe(takeUntil(componentDestroyed(this))).subscribe(data => {
      my.crew = data.crew;
    });
  }

  ngOnDestroy(): void {}
}
