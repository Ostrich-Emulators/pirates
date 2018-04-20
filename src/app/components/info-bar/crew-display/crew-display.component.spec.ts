import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewDisplayComponent } from './crew-display.component';

describe('CrewDisplayComponent', () => {
  let component: CrewDisplayComponent;
  let fixture: ComponentFixture<CrewDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrewDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrewDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
