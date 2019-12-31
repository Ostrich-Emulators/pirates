import { ShipType } from './ship-type.enum'
import { Location } from './location'
import { Course } from './course'
import { Crew } from './crew'
import { City } from './city'
import { ShipCannon } from './ship-cannon'

export interface Ship {
    id: string,
    ownerid: string, // player who controls this ship (or null for NPC ships)
    type: ShipType,
    speed: number,
    manueverability: number,
    hullStrength: number,
    sailQuality: number,
    food: number,
    ammo: number,
    storage: number,
    crew: Crew,
    cannons: ShipCannon,

    name: string, // name of the ship
    captain: string, // name of the ship's captain (mostly for NPC ships)
    avatar: string,
    gold?: number,
    location: Location,
    course?: Course,
    anchored: boolean,
    docked?: City
}
