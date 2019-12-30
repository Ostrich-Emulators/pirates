import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GameService } from '../../services/game.service';
import { City } from '../../../../../common/model/city';
import { Ship } from '../../../../../common/model/ship';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { CityCannon } from '../../../../../common/model/city-cannon';

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
    var city: City = {};
    city.cannon = e;
    console.log(city);
    this.gamesvc.buy(city);
    console.log(this.city.cannon[e]);
  }

  costforcannon(i: number) : number {
    // if we're just resupplying cannons, figure out how many we need
    // if we're buying a different type of cannon, sell the ones we
    // have and purchase the new ones

    // step 1: figure out which type of cannon we have
    var oldcannons = this.ship.cannons;
    var oldcitycannons:CityCannon = this.city.cannon.filter(cc => cc.firepower == oldcannons.firepower &&
      cc.range == oldcannons.range &&
      cc.reloadspeed == oldcannons.reloadspeed)[0];


  }
}
