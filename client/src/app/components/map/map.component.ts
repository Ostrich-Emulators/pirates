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

    my.mapimg = new Image(740, 710);
    my.mapimg.src = '/assets/map.png';
    my.mapimg.onload = function () {
      my.map.nativeElement.height = img.naturalHeight;
      my.map.nativeElement.width = img.naturalWidth;
      my.canvasctx.drawImage(my.mapimg, 0, 0);

      my.shipsvc.avatars.forEach(av => { 
        my.images[av] = new Image();
        my.images[av].src = av;
      });
      my.images['/assets/galleon.svg'] = new Image();
      my.images['/assets/galleon.svg'].src = '/assets/galleon.svg';

      /*
      my.shipimg = new Image(24, 24);
      my.shipimg.src = my.playersvc.avatar;
      my.shipimg.onload = function () {
        my.shipx = 100;
        my.shipy = 200;
        my.canvasctx.drawImage(my.shipimg, my.shipx - 12, my.shipy - 12, 24, 24);

        function looper() {
          if (!my.anchored) {
            my.moveTo(my.shipx + my.speedx, my.shipy + my.speedy);
          }
          window.requestAnimationFrame(looper);
        }
        looper();
      };

      my.whirlpoolimg = new Image();
      my.whirlpoolimg.src = '/assets/whirlpool.png';
      my.whirlpoolimg.onload = function () {
        my.canvasctx.drawImage(my.whirlpoolimg, 285, 285);
      }

      my.seamonsterimg = new Image();
      my.seamonsterimg.src = '/assets/seamonster.png';
      my.seamonsterimg.onload = function () {
        console.log( 'her eI am')
        my.canvasctx.drawImage(my.seamonsterimg, 50, 300);
      }
      */
    };

    var img = new Image(740, 710);
    img.src = '/assets/map-guide.png';
    img.onload = function () { 
      my.mapguide.nativeElement.height = img.naturalHeight;
      my.mapguide.nativeElement.width = img.naturalWidth;
      my.offscreenctx.drawImage(img, 0, 0);
      img.style.display = 'none';
    };

    my.refreshShips(); // get ships from server
    window.setInterval(function () { my.refreshShips(); }, 2000);
    
    // start the animation frame
    setInterval(function () {
      my.moveShips();
    }, 250);
  }

  moveShips() {
    var my: MapComponent = this;

    // first, erase all our ships no matter what
    my.lastlocs.forEach(( loc, shipid ) => {
      my.canvasctx.drawImage(my.mapimg, loc.x - 13, loc.y - 13, 26, 26,
        loc.x - 13, loc.y - 13, 26, 26);
    });

    my.ships.forEach((ship: Ship) => {
      var shipimg = my.images[ship.avatar];
      if (!ship.anchored) {
        var speed = ship.speed / 4;

        var speedx = ship.course.slopex * speed;
        var speedy = ship.course.slopey * speed;
        ship.location.x += speedx;
        ship.location.y += speedy;
        my.lastlocs.set(ship.id, { x: ship.location.x, y: ship.location.y });
      }

      if (shipimg) {
        my.canvasctx.drawImage(shipimg, ship.location.x - 12, ship.location.y - 12,
          24, 24);
      }
    });
  }

  refreshShips() {
    console.log('refreshing ships!');
    var my: MapComponent = this;
    my.gamesvc.ships().subscribe((data: Ship[]) => {
      my.ships = data;
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
