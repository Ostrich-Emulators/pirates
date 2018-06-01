import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { ShipService } from '../../services/ship.service';
import { GameService } from '../../services/game.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable } from 'rxjs/Observable';
import { Player } from '../../../../../common/model/player';
import { Ship } from '../../../../../common/model/ship';
import { Location } from '../../../../../common/model/location';

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
  private whirlloc: Location = null;
  private monsterloc: Location = null;
  private seamonsterimg;
  private mapimg;
  private images: Map<string, any> = new Map<string, any>();
  private player: Player;
  private messages: string = '';
  private ships: Ship[] = [];
  private lastlocs: Map<string, Location> = new Map<string, Location>();

  constructor(private shipsvc: ShipService, private gamesvc: GameService) { }

  ngOnInit() {
    this.offscreenctx = this.mapguide.nativeElement.getContext('2d');
    this.canvasctx = this.map.nativeElement.getContext('2d');
    this.player = this.gamesvc.myplayer();
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

    my.refreshData(); // get ships from server
    window.setInterval(function () { my.refreshData(); }, 500);
    
    // start the animation frame
    setInterval(function () {
      // first, erase everything no matter what
      my.canvasctx.clearRect(0, 0, 740, 710);
      my.drawSpecials();
      my.moveShips();
    }, 100);
  }

  drawSpecials() {
    var my: MapComponent = this;

    if (null != my.monsterloc) {
      my.canvasctx.drawImage(my.seamonsterimg,
        my.monsterloc.x, my.monsterloc.y,
        my.seamonsterimg.naturalWidth, my.seamonsterimg.naturalHeight);
    }

    if( null != my.whirlloc ){
      my.canvasctx.drawImage(my.whirlpoolimg,
        my.whirlloc.x, my.whirlloc.y,
        my.whirlpoolimg.naturalWidth, my.whirlpoolimg.naturalHeight);
    }
  }

  moveShips() {
    var my: MapComponent = this;

    my.ships.forEach((ship: Ship) => {
      var shipimg = my.images[ship.avatar];
      if (!ship.anchored) {
        var speedx = ship.course.speedx;
        var speedy = ship.course.speedy;
        ship.location.x += speedx;
        ship.location.y += speedy;
        my.lastlocs.set(ship.id, { x: ship.location.x, y: ship.location.y });
      }

      if (shipimg) {
        //console.log('drawing ship image ' + ship.location.x + ' ' + ship.location.y);
        my.canvasctx.drawImage(shipimg, ship.location.x, ship.location.y,
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
    //console.log('refreshing ships!');
    var my: MapComponent = this;
    my.gamesvc.ships().subscribe((data: Ship[]) => {
      my.ships = data;
    });

    my.gamesvc.status().subscribe((data: any) => {
        my.whirlloc = data['whirlpoolloc'];
        my.monsterloc = data['seamonsterloc'];
    });
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
}
