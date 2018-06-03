import { Ship } from './ship'
import { Location } from './location'

export interface StatusResponse {
    messages: string[],
    ships: Ship[],
    poolloc?: Location,
    monsterloc?: Location
}