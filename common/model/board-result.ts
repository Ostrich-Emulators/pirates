import { Ship } from './ship'
import { Crew } from './crew'

export enum BoardCode {
    REPELLED = 0,
    OVERRUN = 1,
    DRAW = 2,
    ATTACKER_SUCCESS = 3,
    DEFENDER_SUCCESS = 4
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