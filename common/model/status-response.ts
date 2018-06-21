import { Ship } from './ship'
import { ShipPair } from './ship-pair'
import { Location } from './location'
import { CombatResult } from './combat-result';
import { BoardResult } from './board-result';

export interface StatusResponse {
    messages: string[],
    ships: Ship[],
    playershipid: string,
    poolloc?: Location,
    monsterloc?: Location,
    combat?: CombatResult[],
    board?: BoardResult[]
}