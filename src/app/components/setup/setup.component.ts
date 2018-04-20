import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ShipService } from '../../services/ship.service';
import { ShipType } from '../../model/ship-type.enum';
import { ShipDefinition } from '../../model/ship-definition';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {
  definition: ShipDefinition;
  type: ShipType = ShipType.MEDIUM;
  avatars: string[] = [
    "/assets/avatar1.svg",
    "/assets/avatar2.svg",
    "/assets/avatar3.svg",
    "/assets/avatar4.svg"
  ];

  constructor(private shipsvc: ShipService, private router: Router) { 
    this.shipsvc.avatar = this.avatars[0];
  }

  ngOnInit() {
  }

  setAvatar(a) {
    this.shipsvc.avatar = a;
  }

  sail() {
    if (typeof this.type == 'string') {
      switch (this.type) {
        case '0':
          this.type = ShipType.SMALL;
          break;
        case '1':
          this.type = ShipType.MEDIUM;
          break;
        case '2':
          this.type = ShipType.BIG;
          break;
      }
    }
    this.shipsvc.build(this.type);
    this.router.navigate(['/game']);
  }
}
