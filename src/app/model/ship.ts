import { ShipType } from './ship-type.enum';

export interface Ship {
    type: ShipType,
    cannons: number,
    speed: number,
    manueverability: number,
    hullStrength: number,
    sailQuality: number,
    food: number,
    ammo: number
}
