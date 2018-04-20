import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipDisplayComponent } from './ship-display.component';

describe('ShipDisplayComponent', () => {
  let component: ShipDisplayComponent;
  let fixture: ComponentFixture<ShipDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
