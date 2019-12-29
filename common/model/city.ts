import { Location } from './location';
import { Cannon } from './cannon';

export interface City {
    name?: string,
    location?: Location,

    melee?: number,
    sailing?: number,
    ammo?: number,
    hull?: number,
    sail?: number,
    cannon?: {}
}