import { Ship } from './ship'

export class ShipPair {
    constructor(public one: Ship, public two: Ship) { }

    get ships(): Ship[]{
        return [this.one, this.two];
    }
}