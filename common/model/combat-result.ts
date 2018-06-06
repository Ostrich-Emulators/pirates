import { Ship } from './ship'

export interface CombatResult {
    attacker: Ship,
    attackee: Ship,
    hit?: boolean
}