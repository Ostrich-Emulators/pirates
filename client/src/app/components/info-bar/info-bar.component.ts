import { Component, Input, OnInit } from '@angular/core';
import { Ship } from 'src/app/generated';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-info-bar',
  templateUrl: './info-bar.component.html',
  styleUrls: ['./info-bar.component.scss']
})
export class InfoBarComponent implements OnInit {
  @Input() ship: Ship = GameService.EMPTYSHIP;

  constructor() { }

  ngOnInit(): void {
  }

}
