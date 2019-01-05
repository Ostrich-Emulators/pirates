
import { Ship } from './ship';
import { Pirate } from './pirate';

export class Player {
    constructor(public id: string, public pirate: Pirate, public color: string) {
    }
}
