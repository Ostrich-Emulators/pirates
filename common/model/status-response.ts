import { Ship } from './ship'
import { Location } from './location'
import { CombatResult } from './combat-result';
import { BoardResult } from './board-result';
import { City } from './city'

export interface StatusResponse {
    messages: string[],
    ships: Ship[],
    playershipid: string,
    poolloc?: Location,
    monsterloc?: Location,
    combat?: CombatResult[],
    board?: BoardResult[],
}