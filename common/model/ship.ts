import { ShipType } from './ship-type.enum'
import { Location } from './location'
import { Course } from './course'
import { Crew } from './crew'

export interface Ship {
    id:string,
    type: ShipType,
    cannons: number,
    speed: number,
    manueverability: number,
    hullStrength: number,
    sailQuality: number,
    food: number,
    ammo: number,
    storage: number,
    crew: Crew,
    
    avatar:string,
    gold?: number,
    location: Location,
    course?: Course,
    anchored: boolean
}
