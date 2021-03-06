import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ship-status',
  templateUrl: './ship-status.component.html',
  styleUrls: ['./ship-status.component.scss']
})
export class ShipStatusComponent implements OnInit {
  @Input() title: string = '';
  private _area: any;
  private _fields: string[] = [];

  @Input() set area(a: any) {
    this._area = a;
  }

  get area(): any {
    return this._area;
  }

  @Input() set fields(a: string[]) {
    if (!this.area) {
      this.fields = [];
      return;
    }

    if (a && null != a) {
      this._fields = a;
    }

    console.log(this._fields);
  }

  get fields(): string[]{
    return this._fields;
  }

  constructor() { }

  ngOnInit(): void {
  }

  field(key: string): any {
    return (this.area
      ? this.area[key]
      : undefined);    
  }
}
