import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core'
import { ShipService } from '../../services/ship.service'
import { GameService } from '../../services/game.service'
import { forkJoin } from 'rxjs/observable/forkJoin'
import { Observable } from 'rxjs/Observable'
import { Player } from '../../../../../common/model/player'
import { Ship } from '../../../../../common/model/ship'
import { Location } from '../../../../../common/model/location'
import { Rectangle } from '../../../../../common/model/rectangle'
import { HttpClient } from '@angular/common/http'
import { Collider } from '../../../../../common/tools/collider'
import { CollisionBody } from '../../../../../common/model/body';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('map', { read: ElementRef }) map: ElementRef;
  @ViewChild('mapguide', { read: ElementRef }) mapguide: ElementRef;
  private offscreenctx: CanvasRenderingContext2D;
  private canvasctx: CanvasRenderingContext2D;
  private whirlpoolimg;
  private poolloc: Location = null;
  private monsterloc: Location = null;
  private seamonsterimg;
  private mapimg;
  private images: Map<string, any> = new Map<string, any>();
  private player: Player;
  private messages: string[] = [];
  private ships: Ship[] = [];
  private lastlocs: Map<string, Location> = new Map<string, Location>();
  private myshipimg; // image of my ship
  private lastperf = 0;
  private shortcollider: Collider = new Collider();
  private longcollider: Collider = new Collider();
  private ballpaths: CannonBallPath[] = [];
  private ship: Ship;

  constructor(private shipsvc: ShipService, private gamesvc: GameService, private http:HttpClient) { }

  ngOnInit() {
    var my: MapComponent = this;
    this.offscreenctx = this.mapguide.nativeElement.getContext('2d');
    this.canvasctx = this.map.nativeElement.getContext('2d');
    this.player = this.gamesvc.myplayer();
    this.ship = this.player.ship;

    this.gamesvc.poolloc().subscribe(data => { 
      my.poolloc = data;
    });

    this.gamesvc.monsterloc().subscribe(data => { 
      my.monsterloc = data;
    });

    this.gamesvc.ships().subscribe(data => { 
      console.log('refreshing ships in map');
      my.ships = data;

      my.ships.forEach(ship => {
        var ismyship: boolean = (ship.id === my.player.ship.id);
        my.longcollider.add({
          id: ship.id,
          src: ship,
          getX: function (): number { return ship.location.x },
          getY: function (): number { return ship.location.y },
          getR: function (): number { return (ismyship ? ship.cannonrange : 15) }
        });
        my.shortcollider.add({
          id: ship.id,
          src: ship,
          getX: function (): number { return ship.location.x },
          getY: function (): number { return ship.location.y },
          getR: function (): number { return 15 }
        });
      });
    });
    
    this.gamesvc.myship().subscribe(data => { 
      my.ship = data;
    });
  }

  ngAfterViewInit() {
    var my: MapComponent = this;

    my.seamonsterimg = new Image();
    my.seamonsterimg.src = '/assets/seamonster.png';
    my.whirlpoolimg = new Image();
    my.whirlpoolimg.src = '/assets/whirlpool.png';

    my.mapimg = new Image(740, 710);
    my.map.nativeElement.height = 710;
    my.map.nativeElement.width= 740;

    my.shipsvc.avatars.forEach(av => { 
      my.images[av] = new Image();
      my.images[av].src = av;

      if (av === my.player.ship.avatar) {
        my.http.get(av, { responseType: 'text' }).subscribe(data => { 
          my.myshipimg = new Image();
          my.myshipimg.src = "data:image/svg+xml;charset=utf-8,"
            + data.replace(/fill="#ffffff"/, 'fill="' + my.player.color + '"');
        });
      }
    });
    my.images['/assets/galleon.svg'] = new Image();
    my.images['/assets/galleon.svg'].src = '/assets/galleon.svg';

    var img = new Image(740, 710);
    img.src = '/assets/map-guide.png';
    img.onload = function () { 
      my.mapguide.nativeElement.height = img.naturalHeight;
      my.mapguide.nativeElement.width = img.naturalWidth;
      my.offscreenctx.drawImage(img, 0, 0);
      img.style.display = 'none';
    };
    
    // start the animation frame
    var looper = function () {
      // first, erase everything no matter what
      var now = performance.now();
      my.canvasctx.clearRect(0, 0, 740, 710);
      my.drawSpecials();
      my.moveShips((now - my.lastperf)/my.gamesvc.REFRESH_RATE);
      my.lastperf = performance.now();
      window.requestAnimationFrame(looper);
    }
    looper();
  }

  drawSpecials() {
    var my: MapComponent = this;

    if (null != my.monsterloc) {
      var imgh = my.seamonsterimg.naturalHeight;
      var imgw = my.seamonsterimg.naturalWidth;

      my.canvasctx.drawImage(my.seamonsterimg, my.monsterloc.x - imgw/2, my.monsterloc.y - imgh/2, imgw, imgh);
      my.canvasctx.beginPath();
      my.canvasctx.arc(my.monsterloc.x, my.monsterloc.y, 25, 0, 2 * Math.PI);
      my.canvasctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      my.canvasctx.stroke();
    }

    if (null != my.poolloc) {
      var imgh = my.whirlpoolimg.naturalHeight;
      var imgw = my.whirlpoolimg.naturalWidth;

      my.canvasctx.drawImage(my.whirlpoolimg, my.poolloc.x - imgw / 2, my.poolloc.y - imgh / 2, imgw, imgh);
      my.canvasctx.beginPath();
      my.canvasctx.arc(my.poolloc.x, my.poolloc.y, 30, 0, 2 * Math.PI);
      my.canvasctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      my.canvasctx.stroke();
    }
  }

  moveShips(speedratio: number) {
    var my: MapComponent = this;

    // two loops: update ship locations, then draw ships
    my.ships.forEach((ship: Ship) => {
      var shipimg = my.images[ship.avatar];
      if (!ship.anchored) {
        var speedx = ship.course.speedx * speedratio;
        var speedy = ship.course.speedy * speedratio;
        ship.location.x += speedx;
        ship.location.y += speedy;
        my.lastlocs.set(ship.id, { x: ship.location.x, y: ship.location.y });
      }
    });

    var showCannonTargetting: boolean = false;
    var targetting: Map<Ship, any> = new Map<Ship, any>();
    if (my.ship.ammo > 0 && my.ship.cannons > 0) {
      my.longcollider.checkCollisions(my.ship.id).forEach(en => {
        targetting.set(en.src, { fire: true, board: false });
        showCannonTargetting = true;
      });
    }

    my.shortcollider.checkCollisions(my.ship.id).forEach(en => {
      if (targetting.has(en.src)) {
        var t = targetting.get(en.src);
        t.board = true;
        targetting.set(en.src, t);
      }
      else {
        targetting.set(en.src, { fire: false, board: true });
      }
    });

    my.ships.forEach((ship: Ship) => {
      var shipimg = my.images[ship.avatar];
      var ismyship: boolean = (ship.id === my.ship.id);
      if( ismyship ){
        shipimg = my.myshipimg;
      }

      if (shipimg) {
        //console.log('drawing ship image ' + ship.location.x + ' ' + ship.location.y);
        //my.canvasctx.beginPath();
        //my.canvasctx.arc(ship.location.x, ship.location.y, 3, 0, 2 * Math.PI);
        //my.canvasctx.fillStyle = "yellow";
        //my.canvasctx.fill();
        //my.canvasctx.beginPath();
        //my.canvasctx.arc(ship.location.x, ship.location.y, 0.5, 0, 2 * Math.PI);
        //my.canvasctx.fillStyle = "black";
        //my.canvasctx.fill();

        if (ismyship) {
          if (showCannonTargetting) {
            my.canvasctx.beginPath();

            var rad = my.canvasctx.createRadialGradient(
              ship.location.x, ship.location.y, 1,
              ship.location.x, ship.location.y, ship.cannonrange);
            
            rad.addColorStop(0, my.hexToRGBA(my.gamesvc.myplayer().color, 0.6));
            rad.addColorStop(1, my.hexToRGBA(my.gamesvc.myplayer().color, 0));
            my.canvasctx.fillStyle = rad;
            my.canvasctx.arc(ship.location.x, ship.location.y, ship.cannonrange, 0, 2 * Math.PI);
            my.canvasctx.fill();
          }
          if (targetting.size > 0) {
            my.canvasctx.beginPath();
            my.canvasctx.arc(ship.location.x, ship.location.y, 17, 0, 2 * Math.PI);
            my.canvasctx.fillStyle = my.hexToRGBA(my.gamesvc.myplayer().color, 0.35);
            my.canvasctx.fill();
          }
        }

        my.canvasctx.drawImage(shipimg, ship.location.x - 12, ship.location.y - 12,
          24, 24);
      }
    });
  }

  pointEq(one: Location, two: Location) {
    if (null == one || null == two) {
      return false;
    }

    return (one.x === two.x && one.y === two.y);
  }

  refreshData() {
    var my: MapComponent = this;

    var targetting: Map<Ship, any> = new Map<Ship, any>();
    if (my.ship.ammo > 0 && my.ship.cannons > 0) {
      my.longcollider.checkCollisions(my.ship.id).forEach(en => {
        targetting.set(en.src, { fire: true, board: false });
      });
    }

    my.shortcollider.checkCollisions(my.ship.id).forEach(en => {
      if (targetting.has(en.src)) {
        var t = targetting.get(en.src);
        t.board = true;
        targetting.set(en.src, t);
      }
      else {
        targetting.set(en.src, { fire: false, board: true });
      }
    });

    my.shipsvc.setTargets(targetting);
  }

  onhover(event: MouseEvent) {
    if (this.iswater(event.offsetX, event.offsetY)) {
      // do something?
    }
  }

  onclick(event: MouseEvent) {
    var x = event.offsetX;
    var y = event.offsetY;
    console.log(this.pixelname(x, y));

    if (this.iswater(x, y) || this.iscity(x, y)) {
      this.sailTo(x, y);
    }
  }

  pixel255(x: number, y: number, idx: number) {
    var pixel = this.offscreenctx.getImageData(x, y, 1, 1);
    var data = pixel.data;
    return (255 === data[idx]);
  }

  outOfBounds(x: number, y: number) {
    var pixel = this.offscreenctx.getImageData(x, y, 1, 1);
    var data = pixel.data;
    for (var i = 0; i < 3; i++){
      if (255 != data[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Sets our destination, but we still need to move there
   * 
   * @param x final x
   * @param y final y
   */
  sailTo(x: number, y: number) {
    var my: MapComponent = this;
    var ship: Ship = my.player.ship;
    if (ship.anchored) {
      console.log('setting sail!');
    }
    if (!ship.anchored) {
      console.log('setting new course!');
    }

    var diffx = (x - ship.location.x);
    var diffy = (y - ship.location.y);
    var slope = diffy / diffx;
    var angle = Math.atan(slope);

    var speed = ship.speed;
    var speedx = speed * Math.cos(angle);
    var speedy = speed * Math.sin(angle);

    if (diffx < 0) {
      speedx = 0 - speedx;
      speedy = 0 - speedy;
    }

    ship.course = {
      dstx: x,
      dsty: y,
      speedx: speedx,
      speedy: speedy
    };

    this.gamesvc.move(x, y);
  }

  pixelname(x: number, y: number) {
    if (this.outOfBounds(x, y)) {
      return 'out of bounds';
    }
    if (this.iscity(x, y)) {
      return 'city';
    }
    if (this.isshallows(x, y)) {
      return 'shallows';
    }
    if (this.isdeep(x, y)) {
      return 'deep water';
    }
    else {
      return 'land';
    }
  }

  iscity(x: number, y: number) {
    return this.pixel255(x, y, 1);
  }

  isshallows(x: number, y: number) {
    return this.pixel255(x, y, 0);
  }

  isdeep(x: number, y: number) {
    return this.pixel255(x, y, 2);
  }

  iswater(x: number, y: number) {
    return this.isshallows(x, y) || this.isdeep(x, y);
  }

  island(x: number, y: number) {
    return !( this.iswater(x, y) || this.outOfBounds(x,y) );
  }

  isinland(x: number, y: number) {
    return ( this.island(x, y) && !this.iscity(x, y) );
  }

  hexToRGBA(hex: string, a:number): string {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return 'rgba(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16)
      + ',' + parseInt(result[3], 16) + ',' + a + ')';
  }
}

interface CannonBallPath {
  srcx: number,
  srcy: number,
  dstx: number,
  dsty: number,
  turns: number
}