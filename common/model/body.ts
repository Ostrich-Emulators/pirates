export interface CollisionBody {
    id: string;
    src?: any;
    x: number | (() => number);
    y: number | (() => number);
    r: number | (() => number);
}