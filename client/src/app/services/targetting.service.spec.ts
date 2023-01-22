import { TestBed } from '@angular/core/testing';

import { TargettingService } from './targetting.service';

describe('TargettingService', () => {
  let service: TargettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TargettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
