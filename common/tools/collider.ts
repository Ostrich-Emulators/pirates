import { CollisionBody } from '../model/body'

export class Collider {
    bodies: CollisionBody[] = [];

    add(body: CollisionBody) {
        this.bodies.push(body);
    }
    remove(body: CollisionBody) {
        var idx: number = this.bodies.indexOf(body);
        this.bodies.splice(idx, 1);
    }

    getCollisions(): any[] {
        var collisions: any[] = [];
        for (var i = 0; i < this.bodies.length; i++) {
            var src = this.bodies[i];
            for (var j = i + 1; j < this.bodies.length; j++) {
                var tgt = this.bodies[j];

                if (this.collides(src, tgt)) {
                    collisions.push({ first: src, second: tgt });
                    collisions.push({ first: tgt, second: src });
                }
            }
        }

        return collisions;
    }

    checkCollisions(tgt: CollisionBody): CollisionBody[] {
        var collisions: CollisionBody[] = [];
        for (var i = 0; i < this.bodies.length; i++) {
            if (this.collides(this.bodies[i], tgt)) {
               collisions.push(this.bodies[i]);
            }
        }
        return collisions;
    }

    collides(src: CollisionBody, tgt: CollisionBody): boolean {
        var dx = src.getX() - tgt.getX();
        var dy = src.getY() - tgt.getY();
        var distance = Math.sqrt(dx * dx + dy * dy);
        return (distance < (src.getR() + tgt.getR()));
    }
}