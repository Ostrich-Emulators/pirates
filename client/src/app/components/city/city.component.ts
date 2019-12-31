import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GameService } from '../../services/game.service';
import { City } from '../../../../../common/model/city';
import { Ship } from '../../../../../common/model/ship';
import { Purchase } from '../../../../../common/model/purchase';
import { CityCannon } from '../../../../../common/model/city-cannon';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ShipType } from '../../../../../common/model/ship-type.enum';
import { ShipUtils } from '../../../../../common/tools/ship-utils';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit, OnDestroy {
  @Input() city: City;
  private ship: Ship;
  private replacementCannonCosts: number[] = [];
  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    console.log(this.city);
    this.gamesvc.myship().pipe(takeUntil(componentDestroyed(this))).subscribe(data => { 
      this.ship = data;

      this.calculateReplaceCannonCosts();
    });
  }

  ngOnDestroy(): void {
  }

  private calculateReplaceCannonCosts() {
    this.replacementCannonCosts = this.city.cannon.map((cc, cidx, ccs) => ShipUtils.replacementCannonCost(this.ship, ccs, cidx));
  }

  undock(e) {
    this.gamesvc.undock();
  }

  train(e:string) {
    this.gamesvc.buy({
      cityname: this.city.name,
      item: e
    });
  }

  buyc(e: number) {
    this.gamesvc.buy({
      cityname: this.city.name,
      item: 'CANNON',
      extra_n: e
    });
  }

  costforcannon(i: number): number {
    return this.replacementCannonCosts[i];
  }
}
