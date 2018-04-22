import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapguide', { read: ElementRef }) mapguide: ElementRef;
  @ViewChild('guideimg', { read: ElementRef }) guideimg: ElementRef;
  private canvasctx: CanvasRenderingContext2D;

  constructor() { }

  ngOnInit() {
    this.canvasctx = this.mapguide.nativeElement.getContext('2d');
  }

  ngAfterViewInit() {
    var my: MapComponent = this;

    var img = new Image(740, 710);
    img.src = '/assets/map-guide.png';
    img.onload = function () { 
      my.mapguide.nativeElement.height = img.naturalHeight;
      my.mapguide.nativeElement.width = img.naturalWidth;
      my.canvasctx.drawImage(img, 0, 0);
      img.style.display = 'none';
    };


    console.log(this.guideimg);
    this.canvasctx.drawImage(this.guideimg.nativeElement, 10, 10);
  }


  onhover(event: MouseEvent) {
  }

  onclick(event: MouseEvent) {
    console.log(event);

    var x = event.offsetX;
    var y = event.offsetY;
    var pixel = this.canvasctx.getImageData(x, y, 1, 1);
    var data = pixel.data;
    var rgba = 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + (data[3] / 255) + ')';
    console.log(rgba);
  }
}
