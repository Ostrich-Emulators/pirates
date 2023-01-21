import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { City, PurchaseCode, Ship } from 'src/app/generated';
import { GameService } from 'src/app/services/game.service';
import { ShipUtils } from '../../../../../common/tools/ship-utils';

@UntilDestroy()
@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {
  @Input() city: City = {};
  ship: Ship = GameService.EMPTYSHIP;
  private replacementCannonCosts: number[] = [];

  constructor(public gamesvc: GameService) { }

  ngOnInit(): void {
    this.gamesvc.myship().pipe(untilDestroyed(this)).subscribe(data => {
      this.ship = data;

      this.calculateReplaceCannonCosts();
    });
  }

  private calculateReplaceCannonCosts() {
    this.replacementCannonCosts
      = this.city?.cannon?.map((cc, cidx, ccs) => ShipUtils.replacementCannonCost(this.ship, ccs, cidx)) || [];
  }

  undock() {
    this.gamesvc.undock();
  }

  train(e: PurchaseCode) {
    this.gamesvc.buy({
      cityname: this.city?.name || '',
      item: e
    });
  }

  buyc(e: number) {
    this.gamesvc.buy({
      cityname: this.city?.name || '',
      item: 'CANNON',
      extraN: e
    });
  }

  costforcannon(i: number): number {
    return this.replacementCannonCosts[i];
  }

  disabled(pc: PurchaseCode) {
    var cost: number = 0;
    switch (pc) {
      case PurchaseCode.AMMO:
        cost = this.city?.ammo || 0;
        break;
      case PurchaseCode.HULL:
        cost = this.city?.hull || 0;
        break;
      case PurchaseCode.MELEE:
        cost = this.city?.melee || 0;
        break;
      case PurchaseCode.SAIL:
        cost = this.city?.sail || 0;
        break;
      case PurchaseCode.SAILING:
        cost = this.city?.sailing || 0;
        break;
    }

    return this.ship.gold || 0 > cost;
  }
}
