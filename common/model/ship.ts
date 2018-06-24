import { ShipType } from './ship-type.enum'
import { Location } from './location'
import { Course } from './course'
import { Crew } from './crew'

export interface Ship {
    id:string,
    type: ShipType,
    cannons: number,
    cannonrange: number,
    speed: number,
    manueverability: number,
    hullStrength: number,
    sailQuality: number,
    food: number,
    ammo: number,
    storage: number,
    crew: Crew,
    
    name: string, // name of the ship
    captain: string, // name of the ship's captain (mostly for NPC ships)
    avatar: string,
    gold?: number,
    location: Location,
    course?: Course,
    anchored: boolean,
    docked: boolean
}
