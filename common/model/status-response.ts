import { Ship } from './ship'
import { ShipPair } from './ship-pair'
import { Location } from './location'

export interface StatusResponse {
    messages: string[],
    ships: Ship[],
    poolloc?: Location,
    monsterloc?: Location,
    combat?:ShipPair[]
}