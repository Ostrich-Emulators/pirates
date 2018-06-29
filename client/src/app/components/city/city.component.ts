import { Component, OnInit, Input } from '@angular/core';
import { GameService } from '../../services/game.service';
import { City } from '../../../../../common/model/city';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
  @Input() city: City;
  constructor(private gamesvc: GameService) { }

  ngOnInit() {
    console.log(this.city);
  }

  undock(e) {
    this.gamesvc.undock();
  }
}
