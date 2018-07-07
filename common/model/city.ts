import { Location } from './location'

export interface City {
    name?: string,
    location?: Location,

    melee?: number,
    sailing?: number,
    ammo?: number,
    hull?: number,
    sail?: number
}