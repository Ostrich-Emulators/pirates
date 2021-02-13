import { Game } from "./game";
import { Collider } from "../../../common/tools/collider";
import { CollisionBody } from "../../../common/model/body";
import { Location } from "../../../common/generated/model/location";

var jimp = require('jimp')

export class MapEngine {
    private mapguide: any;
    private whirlpoolguide: any;
    private monsterguide: any;

    setImage(img) {
        this.mapguide = img;
    }

    setWhirlpoolGuideImage(img) {
        this.whirlpoolguide = img;
    }

    setMonsterGuideImage(img) {
        this.monsterguide = img;
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

            return new Promise<boolean>((resolve, reject) => {
                return image.write(file, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(true);
                    }
                });
            });
        });
    }

    isnavigable(pixel): boolean {
        return (this.iswater(pixel) || this.iscity(pixel));
    }

    getPixel(x: number, y: number, img: any = this.mapguide): any {
        return img.getPixelColor(x, y);
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

    private randomGuideLocation(img: any): Location {
        // Just pick any random spot; if it's not a valid location,
        // move left (or right) until we hit a yellow pixed
        // if we don't get a yellow pixel before the image boundary, 
        // try the other direction. If we still are lost, pick a new spot and try again

        var x: number = Math.floor(Math.random() * img.bitmap.width);
        var y: number = Math.floor(Math.random() * img.bitmap.height);

        if ((this.getPixel(x, y, img))) {
            return { x: x, y: y };
        }
        else {
            var leftfirst = (Math.random() < 0.5);
            if (leftfirst) {
                for (var i = x; i > 0; i--){
                    if (this.getPixel(i, y, img)) {
                        return { x: i, y: y };
                    }
                }
                for (var i = x; i < img.bitmap.width; i++) {
                    if ( this.getPixel(i, y, img)) {
                        return { x: i, y: y };
                    }
                }
            }
            else {
                for (var i = x; i < img.bitmap.width; i++) {
                    if (this.getPixel(i, y, img)) {
                        return { x: i, y: y };
                    }
                }
                for (var i = x; i > 0; i--) {
                    if (this.getPixel(i, y, img)) {
                        return { x: i, y: y };
                    }
                }
            }
        }

        return this.randomGuideLocation(img);
    }

    getRandomWhirpoolLocation(): Location {
        return this.randomGuideLocation(this.whirlpoolguide);
    }

    getRandomMonsterLocation(): Location {
        return this.randomGuideLocation(this.monsterguide);
    }
}