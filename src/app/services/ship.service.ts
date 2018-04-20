import { Injectable } from '@angular/core';
import { Ship } from '../model/ship';
import { Crew } from '../model/crew';
import { ShipType } from '../model/ship-type.enum';
import { ShipDefinition } from '../model/ship-definition';

@Injectable()
export class ShipService {
  public captain: string = '';
  public ship: Ship;
  public crew: Crew;
  public avatar: string;
  
  constructor() { }

  build(type: ShipType) {
    var def: ShipDefinition = this.shipdef(type);

    this.crew = {
      count: def.crewsize,
      meleeSkill: 25,
      sailingSkill: 25
    };

    this.ship = {
      type: type,
      cannons: 2,
      speed: def.speed,
      manueverability: def.manueverability,
      hullStrength: def.hull,
      sailQuality: 35,
      food: 50,
      ammo:20
    };
  }

  shipdef(type?: ShipType): ShipDefinition {
    if (!type) {
      type = this.ship.type;
    }

    switch (type) {
      case (ShipType.BIG):
        return {
          cannons: 15,
          crewsize: 50,
          foodstore: 1000,
          ammostore: 100,
          speed: 5,
          manueverability: 5,
          hull: 40
        };
      case (ShipType.MEDIUM):
        return {
          cannons: 10,
          crewsize: 20,
          foodstore: 500,
          ammostore: 100,
          speed: 10,
          manueverability: 15,
          hull: 20
        };
      case (ShipType.SMALL):
        return {
          cannons: 4,
          crewsize: 10,
          foodstore: 250,
          ammostore: 100,
          speed: 20,
          manueverability: 25,
          hull: 10
        };
    }
  }
}
