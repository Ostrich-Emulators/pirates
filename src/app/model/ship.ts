import { Crew } from './crew';
import { ShipType } from './ship-type.enum';

export interface Ship {
    type: ShipType,
    crew: Crew,
    cannons: number,
    speed: number,
    manueverability: number,
    hullStrength: number,
    sailQuality: number
}
