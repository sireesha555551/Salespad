import { TestBed, inject } from '@angular/core/testing';

import { SalesPadDataService } from './sales-pad-data.service';

describe('SalesPadDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesPadDataService]
    });
  });

  it('should be created', inject([SalesPadDataService], (service: SalesPadDataService) => {
    expect(service).toBeTruthy();
  }));
});
