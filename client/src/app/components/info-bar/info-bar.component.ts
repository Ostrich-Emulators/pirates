import { Component, Input, OnInit } from '@angular/core';
import { Ship } from '../../generated/model/ship';

@Component({
  selector: 'app-info-bar',
  templateUrl: './info-bar.component.html',
  styleUrls: ['./info-bar.component.scss']
})
export class InfoBarComponent implements OnInit {
  @Input() ship: Ship = {
    id: '',
    name: '',
    crew: {
      count: 0,
      meleeSkill: 0,
      sailingSkill: 0
    }
  };
  constructor() { }

  ngOnInit(): void {
  }

}
