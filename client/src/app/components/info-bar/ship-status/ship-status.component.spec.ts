import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipStatusComponent } from './ship-status.component';

describe('ShipStatusComponent', () => {
  let component: ShipStatusComponent;
  let fixture: ComponentFixture<ShipStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShipStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
