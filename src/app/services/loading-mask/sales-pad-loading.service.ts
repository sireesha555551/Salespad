import { Injectable,ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SalesPadLoading {
  constructor() {}

  private toAppCmpArea = new Subject<any>();
  private toForm = new Subject<any>();

  public sendAppLoadMaskValue(value) {
    this.toAppCmpArea.next(value);
  }

  public getCmpLoadMaskValue(): Observable<any> {
    return this.toAppCmpArea.asObservable();
  }
  
}
