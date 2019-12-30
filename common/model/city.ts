import { Location } from './location';
import { CityCannon } from './city-cannon';

export interface City {
    name?: string,
    location?: Location,

    melee?: number,
    sailing?: number,
    ammo?: number,
    hull?: number,
    sail?: number,
    cannon?: CityCannon[]
}