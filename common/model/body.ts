export class CollisionBody {
    src: any;
    getX = function (): number { return this.src.x };
    getY = function (): number { return this.src.y };
    getR = function (): number { return this.src.r };
}