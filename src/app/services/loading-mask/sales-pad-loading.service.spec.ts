import { TestBed, inject } from '@angular/core/testing';
import { SalesPadLoading } from './sales-pad-loading.service';


//import { Subject } from 'rxjs/Subject';
describe('LoadingMaskService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesPadLoading]
    });

    
  });

  it('should be created', inject([SalesPadLoading], (service: SalesPadLoading) => {
    expect(service).toBeDefined();
  }));

  // it('should inject the component\'s loadingService instance',
  //   inject([LoadingMaskService], (service: LoadingMaskService) => {
  //   expect(service).toBe(componentloadingService);
  // }));

  
  // it('subject using reactive service', () => {
  //   loadingService.getCmpLoadMaskValue().subscribe((subject) => {
  //       expect(subject).toBeDefined();
  //   });
  // });
});
