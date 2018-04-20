import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyDisplayComponent } from './supply-display.component';

describe('SupplyDisplayComponent', () => {
  let component: SupplyDisplayComponent;
  let fixture: ComponentFixture<SupplyDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplyDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplyDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
