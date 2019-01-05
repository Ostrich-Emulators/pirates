import { Game } from "./game";
import { Collider } from "../../../common/tools/collider";
import { CollisionBody } from "../../../common/model/body";

var jimp = require('jimp')

export class MapEngine {
    private mapguide: any;

    setImage(img) {
        this.mapguide = img;
    }

    debugImageTo(file: string, my: Game, collider: Collider, monsterbody: CollisionBody,
        poolbody: CollisionBody): Promise<any> {
        
        console.log('into debug img');

        return jimp.read('map.png').then(function (image) {
            collider.bodies.forEach(ship => {
                if (!(ship == monsterbody || ship == poolbody)) {
                    var x = ship.getX();
                    var y = ship.getY();
                    var npc: boolean = (ship.id.startsWith('-'));

                    console.log('writing ship: ' + ship.src.id + ' at ' + '(' + x + ',' + y + ')');
                    image.scan(ship.getX(), ship.getY(), 8, 8, function (x, y, idx) {
                        image.bitmap.data[idx] = (npc ? 0x54 : 0xEF);
                        image.bitmap.data[idx + 1] = (npc ? 0xE1 : 0x0A);
                        image.bitmap.data[idx + 2] = (npc ? 0x49 : 0x5B);
                    });
                }
            });

            console.log('pool rect: ' + JSON.stringify(my.poolloc));
            var rect = my.poolloc;
            image.scan(rect.x, rect.y, 20, 20, function (x, y, idx) {
                image.bitmap.data[idx] = 0x87;
                image.bitmap.data[idx + 1] = 0xAD;
                image.bitmap.data[idx + 2] = 0x4F;
            });
            console.log('monster rect: ' + JSON.stringify(my.monsterloc));
            var rect = my.monsterloc;
            image.scan(rect.x, rect.y, 20, 20, function (x, y, idx) {
                image.bitmap.data[idx] = 0xDC;
                image.bitmap.data[idx + 1] = 0x91;
                image.bitmap.data[idx + 2] = 0x58;
            });

            return new Promise((resolve, reject) => {
                return image.write(file, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }

    isnavigable(pixel): boolean {
        return (this.iswater(pixel) || this.iscity(pixel));
    }

    getPixel(x: number, y: number): any {
        return this.mapguide.getPixelColor(x, y);
    }

    iswater(pixel): boolean {
        return (0xFFFF == pixel || 0xFF0000FF == pixel);
    }

    isinland(pixel): boolean {
        return (0xFF == pixel);
    }

    iscity(pixel): boolean {
        // city color (green) doesn't always work!
        //return (0xFF00FF == pixel);
        return (0xFF00FF == pixel || !(this.isinland(pixel) || this.isoutofbounds(pixel)
            || this.iswater(pixel)));
    }

    isoutofbounds(pixel): boolean {
        return (0xFFFFFFFF == pixel);
    }
}