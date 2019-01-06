import { Component, OnInit, Input } from '@angular/core';
import { GameService } from '../../services/game.service';
import { City } from '../../../../../common/model/city';
import { Ship } from '../../../../../common/model/ship';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
  @Input() city: City;
  private ship: Ship;
  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    console.log(this.city);
    this.gamesvc.myship().subscribe(data => { 
      this.ship = data;
    });
  }

  undock(e) {
    this.gamesvc.undock();
  }

  train(e) {
    var city: City = {};
    city[e] = 1;
    this.gamesvc.buy(city);
  }


}
