import { Ship } from './ship'

export enum HitCode {
    CANNON_EXPLODED = 0,
    HIT_HULL = 1,
    HIT_CANNON = 2,
    HIT_SAIL = 3,
    HIT_SAILOR = 4,
    MISSED = 5,
    OUT_OF_RANGE = 6
}

export interface CombatResult {
    attacker: Ship,
    attackee: Ship,
    hitcodes: HitCode[],
    hits: number,
    misses: number
}