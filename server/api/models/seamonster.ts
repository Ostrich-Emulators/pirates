import { Ship } from "../../../common/model/ship";

export interface SeaMonster {
  health: number,
  attack: number,
  defense: number,
  power: number,
  attackers: Ship[]
}