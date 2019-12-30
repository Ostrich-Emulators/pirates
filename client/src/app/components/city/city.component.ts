import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GameService } from '../../services/game.service';
import { City } from '../../../../../common/model/city';
import { Ship } from '../../../../../common/model/ship';
import { Purchase } from '../../../../../common/model/purchase';
import { CityCannon } from '../../../../../common/model/city-cannon';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ShipType } from '../../../../../common/model/ship-type.enum';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit, OnDestroy {
  @Input() city: City;
  private ship: Ship;
  private warned: boolean = false;
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

  costforcannon(i: number) : number {
    // if we're just resupplying cannons, figure out how many we need
    // if we're buying a different type of cannon, sell the ones we
    // have and purchase the new ones

    // step 1: figure out which type of cannon we have
    var oldcannons = this.ship.cannons;
    var oldidx: number = -1;
    var costOfOld: number = 0;

    for (var j = 0; j < this.city.cannon.length; j++) {
      var cc: CityCannon = this.city.cannon[j];
      if (cc.firepower == oldcannons.firepower &&
        cc.range == oldcannons.range &&
        cc.reloadspeed == oldcannons.reloadspeed) {
        oldidx = j;
        costOfOld = cc.cost;
      }
    }

    if (!this.warned) {
      console.error('NEED to figure out max cannons from ShipDef');
      this.warned = true;
    }
    var MAXCANNONS = 8;

    return (oldidx === j
      ? costOfOld * (MAXCANNONS - this.ship.cannons.count)
      : (this.city.cannon[i].cost * MAXCANNONS) - (this.city.cannon[oldidx].cost * this.ship.cannons.count)
    );
  }
}
