import { CollisionBody } from '../model/body'

export class Collider {
    bodies: Map<string, CollisionBody> = new Map<string, CollisionBody>();
    

    clear() {
        this.bodies.clear();
    }

    add(body: CollisionBody) {
        this.bodies.set(body.id, body);
    }

    update(id: string, cb:CollisionBody) {
        this.bodies.set(id, cb);
    }

    get(id: string): CollisionBody {
        return this.bodies.get(id);
    }

    remove(body: CollisionBody | string) {
        if (typeof body === 'string') {
            this.bodies.delete(body);
        }
        else {
            this.bodies.delete(body.id);
        }
    }

    getCollisions(): any[] {
        var collisions: any[] = [];
        var bodies2: CollisionBody[] = [];
        this.bodies.forEach(body => {
            bodies2.push(body);
        });

        for (var i = 0; i < bodies2.length; i++) {
            var src = bodies2[i];
            for (var j = i + 1; j < bodies2.length; j++) {
                var tgt = bodies2[j];

                if ( this.collides(src, tgt)) {
                    collisions.push({ first: src, second: tgt });
                    collisions.push({ first: tgt, second: src });
                }
            }
        }

        return collisions;
    }

    checkCollisions(tgt: CollisionBody): CollisionBody[] {
        var my: Collider = this;
        var collisions: CollisionBody[] = [];
        this.bodies.forEach(body => { 
            if (tgt.id != body.id && my.collides( body, tgt ) ){
                collisions.push(body);
            }
        });
        return collisions;
    }

    collides(src: CollisionBody, tgt: CollisionBody): boolean {
        //console.log('checking collides: ' + JSON.stringify(src) + ' against ' + JSON.stringify(tgt));
        var dx = src.getX() - tgt.getX();
        var dy = src.getY() - tgt.getY();
        var distance = Math.sqrt(dx * dx + dy * dy);
        return (distance < (src.getR() + tgt.getR()));
    }
}
