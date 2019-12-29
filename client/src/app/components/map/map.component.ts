import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core'
import { GameService } from '../../services/game.service'
import { TargettingService } from '../../services/targetting.service';
import { AvatarService } from '../../services/avatar.service';

import { Player } from '../../../../../common/model/player'
import { Ship } from '../../../../../common/model/ship'
import { Location } from '../../../../../common/model/location'
import { CombatResult, HitCode } from '../../../../../common/model/combat-result';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('map', { read: ElementRef, static: true }) map: ElementRef;
  @ViewChild('mapguide', { read: ElementRef, static: true }) mapguide: ElementRef;
  private offscreenctx: CanvasRenderingContext2D; // for navigation and such
  private canvasctx: CanvasRenderingContext2D; // for actually drawing the map
  private whirlpoolimg;
  private poolloc: Location = null;
  private monsterloc: Location = null;
  private seamonsterimg;
  private player: Player;
  private ships: Ship[] = [];
  private lastlocs: Map<string, Location> = new Map<string, Location>();
  private myshipimg; // image of my ship
  private lastperf = 0;
  private ballpaths: CannonBallPath[] = [];
  private explosions: Explosion[] = [];
  private sinkings: Sinking[] = [];
  private ship: Ship;
  private static CANNONPATH_DURATION: number = 40;// 40 frames (2/3 second?)
  private static EXPLOSION_DURATION: number = 40;// 40 frames (2/3 second?)
  private static SINK_DURATION: number = 240;// 40 frames (2/3 second?)
  

  constructor(private targetting: TargettingService, private gamesvc: GameService,
    private imgsvc: AvatarService) { }

  ngOnDestroy(): void { }
  
  ngOnInit() {
    this.offscreenctx = this.mapguide.nativeElement.getContext('2d');
    this.canvasctx = this.map.nativeElement.getContext('2d');

    this.gamesvc.myplayer().pipe(takeUntil(componentDestroyed(this))).subscribe(d => { 
      this.player = d;
    });

    this.gamesvc.poolloc().pipe(takeUntil(componentDestroyed(this))).subscribe(data => {
      this.poolloc = data;
    });

    this.gamesvc.monsterloc().pipe(takeUntil(componentDestroyed(this))).subscribe(data => {
      this.monsterloc = data;
    });

    this.gamesvc.myship().pipe(takeUntil(componentDestroyed(this))).subscribe(data => {
      this.ship = data;
      if (!this.myshipimg) {
        console.log('setting ship image:', this.ship.avatar);
        this.myshipimg = this.imgsvc.getImage(this.ship.avatar, this.player.color);
      }
    });

    this.gamesvc.combat().pipe(takeUntil(componentDestroyed(this))).subscribe(data => {
      data.forEach(c => {
        if (c.attacker.id === this.ship.id || c.attackee.id === this.ship.id) {
          this.registerCombat(c);
        }
      });
    });

    this.gamesvc.ships().pipe(takeUntil(componentDestroyed(this))).subscribe(data => {
      //console.log('refreshing ships in map');

      // check for ships that have sunk
      var oldshiplkp: Map<string, Ship> = new Map<string, Ship>();
      var newshipids: Set<string> = new Set<string>();
      for (var i = 0; i < this.ships.length; i++) {
        oldshiplkp.set(this.ships[i].id, Object.assign({}, this.ships[i]));
      }
      for (var i = 0; i < data.length; i++) {
        newshipids.add(data[i].id);
      }

      this.ships = data;

      oldshiplkp.forEach((ship, id) => {
        if (!newshipids.has(id)) {
          // we have a missing ship! it must have sunk!
          this.sinkings.push({
            x: ship.location.x,
            y: ship.location.y,
            turns: MapComponent.SINK_DURATION,
            avatar: ship.avatar
          });
        }
      });
    });
  }

  ngAfterViewInit() {
    this.seamonsterimg = new Image();
    this.seamonsterimg.src = '/assets/seamonster.png';
    this.whirlpoolimg = new Image();
    this.whirlpoolimg.src = '/assets/whirlpool.png';

    this.map.nativeElement.height = 710;
    this.map.nativeElement.width = 740;

    var img = new Image(740, 710);
    img.src = '/assets/map-guide.png';
    img.onload = () => {
      this.mapguide.nativeElement.height = img.naturalHeight;
      this.mapguide.nativeElement.width = img.naturalWidth;
      this.offscreenctx.drawImage(img, 0, 0);
      img.style.display = 'none';
    }

    // start the animation frame
    var looper = () => {
      // first, erase everything no matter what
      var now = performance.now();
      this.canvasctx.clearRect(0, 0, 740, 710);
      this.drawSpecials();
      this.moveShips((now - this.lastperf) / this.gamesvc.REFRESH_RATE);
      this.drawCombat();
      this.lastperf = performance.now();
      window.requestAnimationFrame(looper);
    }
    looper();
  }

  registerCombat(combat: CombatResult) {
    var expls = 0;
    combat.hitcodes.forEach(hc => {
      if (HitCode.CANNON_EXPLODED === hc) {
        expls += 1;
      }
    });
    if (expls > 0) {
      // cannon exploded, so explode the attacker
      this.explosions.push({
        x: combat.attacker.location.x,
        y: combat.attacker.location.y,
        turns: MapComponent.EXPLOSION_DURATION,
        delay: 0
      });

      if (expls > 1) {
        for (var i = 1; i < expls; i++) {
          this.explosions.push({
            x: combat.attacker.location.x - 10 + Math.random() * 20,
            y: combat.attacker.location.y - 10 + Math.random() * 20,
            turns: MapComponent.EXPLOSION_DURATION,
            delay: Math.ceil(Math.random() * MapComponent.EXPLOSION_DURATION)
          });
        }
      }

    }

    this.ballpaths.push({
      srcx: combat.attacker.location.x,
      srcy: combat.attacker.location.y,
      dstx: combat.attackee.location.x,
      dsty: combat.attackee.location.y,
      ctrlx: (combat.attacker.location.x + combat.attackee.location.x) / 2,
      ctrly: (combat.attacker.location.y + combat.attackee.location.y) / 2 - 40,
      turns: MapComponent.CANNONPATH_DURATION,
      rslt: combat
    });
  }

  drawSpecials() {
    if (null != this.monsterloc) {
      var imgh = this.seamonsterimg.naturalHeight;
      var imgw = this.seamonsterimg.naturalWidth;

      this.canvasctx.drawImage(this.seamonsterimg, this.monsterloc.x - imgw / 2, this.monsterloc.y - imgh / 2, imgw, imgh);
      this.canvasctx.beginPath();
      this.canvasctx.arc(this.monsterloc.x, this.monsterloc.y, 25, 0, 2 * Math.PI);
      this.canvasctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.canvasctx.strokeStyle = 'black';
      this.canvasctx.stroke();
    }

    if (null != this.poolloc) {
      var imgh = this.whirlpoolimg.naturalHeight;
      var imgw = this.whirlpoolimg.naturalWidth;

      this.canvasctx.drawImage(this.whirlpoolimg, this.poolloc.x - imgw / 2, this.poolloc.y - imgh / 2, imgw, imgh);
      this.canvasctx.beginPath();
      this.canvasctx.arc(this.poolloc.x, this.poolloc.y, 30, 0, 2 * Math.PI);
      this.canvasctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      this.canvasctx.strokeStyle = 'black';
      this.canvasctx.stroke();
    }
  }

  drawCombat() {
    this.sinkings.forEach((sink, idx) => {
      this.canvasctx.save();
      // first half of duration, rotate the image slightly
      // second half: sink the ship
      var pct: number = (1 - (sink.turns / MapComponent.SINK_DURATION));
      var rotation: number = (pct < 0.5 ? pct : 0.5);
      this.canvasctx.translate(sink.x, sink.y);
      this.canvasctx.rotate(rotation * Math.PI);
      this.canvasctx.translate(-12, -12);
      var img = this.imgsvc.getImage(sink.avatar);
      if (pct < 0.5) {
        // rotate the (teetering) ship
        this.canvasctx.drawImage(img, 0, 0, 24, 24);
      }
      else {
        // sink the ship into the sea

        // we want to slowly draw less of the ship,
        // but we want to start with 100%, and go down to 0%
        // but pct is >0.5 at this point
        var imgpct: number = (sink.turns * 2 / MapComponent.SINK_DURATION);

        // this code looks like x & y are reversed, until you
        // realize that the canvas is rotated 90 degrees
        this.canvasctx.drawImage(img,
          // srcX: number, srcY: number, srcW: number, srcH: number, 
          0, 0, 700 * imgpct, 700, // no idea where these 700s come from: the svgs are 512px square
          // dstX: number, dstY: number, dstW: number, dstH: number
          24 * (1 - imgpct), 0, 24 * imgpct, 24);
      }

      sink.turns -= 1;
      if (sink.turns <= 0) {
        this.sinkings.splice(idx, 1);
        sink.turns = MapComponent.SINK_DURATION;
      }

      this.canvasctx.restore();
    });

    this.explosions.forEach((exp, idx) => {
      if (0 === exp.delay) {
        this.canvasctx.beginPath();
        this.canvasctx.arc(exp.x, exp.y, exp.turns / 2, 0, 2 * Math.PI);
        this.canvasctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        this.canvasctx.fill();

        exp.turns -= 1;
        if (exp.turns <= 0) {
          this.explosions.splice(idx, 1);
        }
      }
      else {
        exp.delay -= 1;
      }
    });

    this.ballpaths.forEach((cbp, idx) => {

      // draw an arched path to the target
      this.canvasctx.beginPath();
      this.canvasctx.moveTo(cbp.srcx, cbp.srcy);
      this.canvasctx.quadraticCurveTo(cbp.ctrlx, cbp.ctrly, cbp.dstx, cbp.dsty);
      this.canvasctx.strokeStyle = 'white';
      this.canvasctx.stroke();

      // draw a cannonball flying on that path
      this.canvasctx.beginPath();
      var loc: Location = this.getQuadraticBezierXYatT(cbp);
      this.canvasctx.arc(loc.x, loc.y, 5, 0, 2 * Math.PI);
      this.canvasctx.fillStyle = "rgba(0, 0, 0, 1)";
      this.canvasctx.strokeStyle = 'black';
      this.canvasctx.fill();

      cbp.turns -= 1;

      if (cbp.turns <= 0) {
        if (cbp.rslt.hits > 0) {
          this.explosions.push({
            x: cbp.rslt.attackee.location.x,
            y: cbp.rslt.attackee.location.y,
            turns: MapComponent.EXPLOSION_DURATION,
            delay: 0
          });


          if (cbp.rslt.hits > 1) {
            for (var i = 0; i < cbp.rslt.hits; i++) {
              this.explosions.push({
                x: cbp.rslt.attackee.location.x - 10 + Math.random() * 20,
                y: cbp.rslt.attackee.location.y - 10 + Math.random() * 20,
                turns: MapComponent.EXPLOSION_DURATION,
                delay: Math.ceil(Math.random() * MapComponent.EXPLOSION_DURATION)
              });
            }
          }
        }
        this.ballpaths.splice(idx, 1);
      }
    });
  }

  moveShips(speedratio: number) {
    // two loops: update ship locations, then draw ships
    this.ships.forEach((ship: Ship) => {
      if (!ship.anchored) {
        var speedx = ship.course.speedx * speedratio;
        var speedy = ship.course.speedy * speedratio;
        ship.location.x += speedx;
        ship.location.y += speedy;
        this.lastlocs.set(ship.id, { x: ship.location.x, y: ship.location.y });
      }
    });

    var showCannonTargetting: boolean = this.targetting.firingRange();
    var showBoardTargetting: boolean = this.targetting.boardingRange();

    this.ships.forEach((ship: Ship) => {
      // console.log(ship.id + '=>' + ship.crew.count);
      var shipimg = this.imgsvc.getImage(ship.crew.count > 0 ? ship.avatar : '/assets/abandoned.svg');
      var ismyship: boolean = (ship.id === this.ship.id);
      if (ismyship) {
        shipimg = this.myshipimg;
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
            this.canvasctx.beginPath();

            var rad = this.canvasctx.createRadialGradient(
              ship.location.x, ship.location.y, 1,
              ship.location.x, ship.location.y, ship.cannons.range);

            rad.addColorStop(0, this.hexToRGBA(this.player.color, 0.6));
            rad.addColorStop(1, this.hexToRGBA(this.player.color, 0.1));
            this.canvasctx.fillStyle = rad;
            this.canvasctx.arc(ship.location.x, ship.location.y, ship.cannons.range, 0, 2 * Math.PI);
            this.canvasctx.fill();
          }
          if (showBoardTargetting) {
            this.canvasctx.beginPath();
            this.canvasctx.arc(ship.location.x, ship.location.y, 17, 0, 2 * Math.PI);
            this.canvasctx.fillStyle = this.hexToRGBA(this.player.color, 0.35);
            this.canvasctx.fill();
          }
        }

        this.canvasctx.drawImage(shipimg, ship.location.x - 12, ship.location.y - 12,
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

  onhover(event: MouseEvent) {
    var my: MapComponent = this;
    /* this works, but need someplace to display it
    var check: CollisionBody = {
      id:'mousecheck',
      getX: function () { return event.offsetX },
      getY: function () { return event.offsetY },
      getR: function () { return 15;}
    };
  
    var collisions = this.shortcollider.checkCollisions(check);
    collisions.forEach(cb => { 
      if (cb.src) {
        console.log( cb.src.name );
      }
    });
    */

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
    for (var i = 0; i < 3; i++) {
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
    var ship: Ship = this.ship;
    if (ship.anchored) {
      console.log('setting sail!');
    }
    if (!ship.anchored) {
      console.log('setting new course!', x, y, ship);
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
    return !(this.iswater(x, y) || this.outOfBounds(x, y));
  }

  isinland(x: number, y: number) {
    return (this.island(x, y) && !this.iscity(x, y));
  }

  hexToRGBA(hex: string, a: number): string {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return 'rgba(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16)
      + ',' + parseInt(result[3], 16) + ',' + a + ')';
  }

  getQuadraticBezierXYatT(cbp: CannonBallPath): Location {
    var pct: number = cbp.turns / MapComponent.CANNONPATH_DURATION;
    if (pct < 0.25) {
      pct = 1;
    }
    else if (pct < 0.5) {
      pct = 0.75;
    }
    else if (pct < 0.75) {
      pct = 0.5;
    }
    else {
      pct = 0.25;
    }

    // var x = Math.pow(1 - T, 2) * startPt.x + 2 * (1 - T) * T * controlPt.x + Math.pow(T, 2) * endPt.x;
    // var y = Math.pow(1 - T, 2) * startPt.y + 2 * (1 - T) * T * controlPt.y + Math.pow(T, 2) * endPt.y;
    // return ({ x: x, y: y });    

    var x = Math.pow(1 - pct, 2) * cbp.srcx + 2 * (1 - pct) * pct * cbp.ctrlx + Math.pow(pct, 2) * cbp.dstx;
    var y = Math.pow(1 - pct, 2) * cbp.srcy + 2 * (1 - pct) * pct * cbp.ctrly + Math.pow(pct, 2) * cbp.dsty;
    return ({ x: x, y: y });
  }
}

interface CannonBallPath {
  srcx: number,
  srcy: number,
  dstx: number,
  dsty: number,
  ctrlx: number,
  ctrly: number,
  turns: number,
  rslt: CombatResult
}

interface Explosion {
  x: number,
  y: number,
  delay: number,
  turns: number
}

interface Sinking {
  x: number,
  y: number,
  turns: number,
  avatar: string
}