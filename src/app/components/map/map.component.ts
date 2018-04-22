import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { ShipService } from '../../services/ship.service';
import { GameService } from '../../services/game.service';

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

  constructor(private shipsvc: ShipService, private gavesvc: GameService) { }

  ngOnInit() {
    this.offscreenctx = this.mapguide.nativeElement.getContext('2d');
    this.canvasctx = this.map.nativeElement.getContext('2d');
  }

  ngAfterViewInit() {
    var my: MapComponent = this;

    var mapimg = new Image(740, 710);
    mapimg.src = '/assets/map.png';
    mapimg.onload = function () {
      my.map.nativeElement.height = img.naturalHeight;
      my.map.nativeElement.width = img.naturalWidth;
      my.canvasctx.drawImage(mapimg, 0, 0);

      my.shipimg = new Image(24, 24);
      my.shipimg.src = my.shipsvc.avatar;
      my.shipimg.onload = function () {
        my.canvasctx.drawImage(my.shipimg, 100, 200, 24, 24);
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
    console.log(this.pixelname(x,y));
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
    return !( this.isshallows(x, y) || this.outOfBounds(x,y) );
  }
}
