import { Ship } from './ship'
import { Crew } from './crew'

export enum BoardCode {
    REPELLED = 0,
    PARTIAL_SUCCESS = 1,
    TOTAL_SUCCESS = 2
}

export interface BoardResult {
    attacker: Ship,
    attackee: Ship,
    code: BoardCode,
    gold?: number,
    crew?: Crew,
    ammo?: number,
    food?: number
}