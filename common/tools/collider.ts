import { CollisionBody } from '../model/body'

export class Collider {
    public static readonly EMPTYBODY: CollisionBody = { id: '', x: 0, y: 0, r: 0 };
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
        return this.bodies.get(id) || Collider.EMPTYBODY;
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
        var bodies2: CollisionBody[] = Array.from(this.bodies.values());

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

    checkCollisions(tgt: CollisionBody|string): CollisionBody[] {
        var collisions: CollisionBody[] = [];

        var me: CollisionBody = (typeof tgt === 'string' ? this.bodies.get(tgt) || Collider.EMPTYBODY : tgt);
        if (null == me) {
            console.error('why do I have a null me here? tgt:' + JSON.stringify(tgt));
            return collisions;
        }

        this.bodies.forEach(body => {
            if (me.id != body.id && this.collides(body, me)) {
                collisions.push(body);
            }
        });

        return collisions;
    }

    private xof(o: CollisionBody): number {
        return ('function' === typeof o.x ? o.x() : o.x);
    }

    private yof(o: CollisionBody): number {
        return ('function' === typeof o.y ? o.y() : o.y);
    }
    private rof(o: CollisionBody): number {
        return ('function' === typeof o.r ? o.r() : o.r);
    }

    collides(src: CollisionBody, tgt: CollisionBody): boolean {
        //console.log('checking collides: ' + JSON.stringify(src) + ' against ' + JSON.stringify(tgt));
        var dx = this.xof(src) - this.xof(tgt);
        var dy = this.yof(src) - this.yof(tgt);
        var distance = Math.sqrt(dx * dx + dy * dy);
        //console.log('distance is:', distance)
        return distance < (this.rof(src) + this.rof(tgt));
    }
}
