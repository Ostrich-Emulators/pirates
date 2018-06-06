import { Ship } from './ship'
import { ShipPair } from './ship-pair'
import { Location } from './location'
import { CombatResult } from './combat-result';

export interface StatusResponse {
    messages: string[],
    ships: Ship[],
    poolloc?: Location,
    monsterloc?: Location,
    combat?: CombatResult[]
}