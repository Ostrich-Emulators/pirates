import { CannonBase } from "./cannon-base";

export interface ShipCannon extends CannonBase {
    count: number,
    reloading?: number /** count down until cannons are loaded (0==ready to fire) */
}