import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GameService } from '../../services/game.service';
import { City } from '../../../../../common/model/city';
import { Ship } from '../../../../../common/model/ship';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit, OnDestroy {
  @Input() city: City;
  private ship: Ship;
  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    console.log(this.city);
    this.gamesvc.myship().pipe(takeUntil(componentDestroyed(this))).subscribe(data => { 
      this.ship = data;
    });
  }

  ngOnDestroy(): void {
  }

  undock(e) {
    this.gamesvc.undock();
  }

  train(e) {
    var city: City = {};
    city[e] = 1;
    this.gamesvc.buy(city);
  }

  buyc(e) {
    console.log(this.city.cannon[e]);
  }
}
