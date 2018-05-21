import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { ShipService } from '../../services/ship.service';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';

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
  private shipimg;
  private mapimg;

  private shipx: number;
  private shipy: number;
  private speedx: number = 0;
  private speedy: number = 0;
  private dstx: number;
  private dsty: number;
  private anchored: boolean = true;
  private grounded: boolean = false;

  constructor(private shipsvc: ShipService, private playersvc: PlayerService,
    private gavesvc: GameService) { }

  ngOnInit() {
    this.offscreenctx = this.mapguide.nativeElement.getContext('2d');
    this.canvasctx = this.map.nativeElement.getContext('2d');
  }

  ngAfterViewInit() {
    var my: MapComponent = this;

    my.mapimg = new Image(740, 710);
    my.mapimg.src = '/assets/map.png';
    my.mapimg.onload = function () {
      my.map.nativeElement.height = img.naturalHeight;
      my.map.nativeElement.width = img.naturalWidth;
      my.canvasctx.drawImage(my.mapimg, 0, 0);

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
    };

    var img = new Image(740, 710);
    img.src = '/assets/map-guide.png';
    img.onload = function () { 
      my.mapguide.nativeElement.height = img.naturalHeight;
      my.mapguide.nativeElement.width = img.naturalWidth;
      my.offscreenctx.drawImage(img, 0, 0);
      img.style.display = 'none';
    };
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

  moveTo(x: number, y: number) {
    var my: MapComponent = this;
    my.canvasctx.drawImage(my.mapimg, Math.floor( my.shipx - 12 ), Math.floor( my.shipy - 12 ), 24, 24,
      Math.floor( my.shipx - 12 ), Math.floor( my.shipy - 12 ), 24, 24);
    my.canvasctx.drawImage(my.shipimg, Math.floor( x - 12 ), Math.floor( y - 12 ), 24, 24);
    my.shipx = x;
    my.shipy = y;

    if (my.isinland(my.shipx, my.shipy)) {
      my.anchored = true;
      console.log('we\'ve run aground!');
      my.shipsvc.ship.hullStrength -= 3;
      my.grounded = true;
    }

    var both: number = 0;
    if (Math.abs(my.shipx - my.dstx) < 1) {
      my.speedx = 0;
      my.shipx = Math.floor(my.shipx);
    }
    if (Math.abs(my.shipy - my.dsty) < 1) {
      my.speedy = 0;
      my.shipy = Math.floor(my.shipy);
    }

    if (my.speedx === 0 && 0 === my.speedy && !my.anchored) {
      my.anchored = true;
      console.log('anchoring at ' + my.shipx + ',' + my.shipy);
    }

  }

  /**
   * Sets our destination, but we still need to move there
   * 
   * @param x final x
   * @param y final y
   */
  sailTo(x: number, y: number) {
    var my: MapComponent = this;
    if (my.anchored) {
      console.log('setting sail!');
    }
    if (!my.anchored) {
      console.log('setting new course!');
    }

    my.anchored = false;
    var diffx = (x - this.shipx);
    var diffy = (y - this.shipy);
    var slope = diffy / diffx;
    var angle = Math.atan(slope);

    var speed = 0.25;
    var speedx = speed * Math.cos(angle);
    var speedy = speed * Math.sin(angle);

    if (diffx < 0 && diffy > 0) {
      //console.log('flip 1');
      speedx = 0 - speedx;
      speedy = 0 - speedy;
    }
    else if (diffx < 0 && diffy < 0) {
      //console.log('flip 3');
      speedx = 0 - speedx;
      speedy = 0 - speedy;
    }

    my.shipx = Math.floor(my.shipx);
    my.shipy = Math.floor(my.shipy);
    my.dstx = x;
    my.dsty = y;
    my.speedx = speedx;
    my.speedy = speedy;

    // just for debugging
    var obj = {
      shipx: my.shipx,
      shipy: my.shipy,
      dstx: my.dstx,
      dsty: my.dsty,
      diffx: diffx,
      diffy: diffy,
      slope: slope,
      angle: angle,
      speedx: my.speedx,
      speedy: my.speedy
    };
    console.log(obj);
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
