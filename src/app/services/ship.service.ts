import { Injectable } from '@angular/core';
import { Ship } from '../model/ship';
import { Crew } from '../model/crew';
import { ShipType } from '../model/ship-type.enum';
import { ShipDefinition } from '../model/ship-definition';

@Injectable()
export class ShipService {
  public captain: string = '';
  public ship: Ship;
  public avatar: string;
  
  constructor() { }

  build(type: ShipType) {
    var def: ShipDefinition = this.shipdef(type);

    var crew: Crew = {
      count: def.crewsize,
      meleeSkill: 25,
      sailingSkill: 25
    };

    this.ship = {
      type: type,
      crew: crew,
      cannons: 4,
      speed: def.speed,
      manueverability: def.manueverability,
      hullStrength: def.hull,
      sailQuality: 50
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
          speed: 5,
          manueverability: 5,
          hull:40
        };
      case (ShipType.MEDIUM):
        return {
          cannons: 10,
          crewsize: 20,
          foodstore: 500,
          speed: 10,
          manueverability: 15,
          hull: 20
        };
      case (ShipType.SMALL):
        return {
          cannons: 4,
          crewsize: 10,
          foodstore: 250,
          speed: 20,
          manueverability: 25,
          hull: 10

        };
    }
  }
}
