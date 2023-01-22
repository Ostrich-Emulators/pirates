import { Location } from '../generated/model/location';

export class Calculators {
    public static distance(loc1: Location, loc2: Location): number {
        var x: number = loc1.x - loc2.x;
        var y: number = loc1.y - loc2.y;
        return Math.sqrt(x * x + y * y);
    }
}