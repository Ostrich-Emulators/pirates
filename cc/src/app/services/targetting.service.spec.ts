import { TestBed, inject } from '@angular/core/testing';

import { TargettingService } from './targetting.service';

describe('ShipService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TargettingService]
    });
  });

  it('should be created', inject([TargettingService], (service: TargettingService) => {
    expect(service).toBeTruthy();
  }));
});
