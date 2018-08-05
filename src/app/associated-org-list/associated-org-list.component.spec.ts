import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedOrgListComponent } from './associated-org-list.component';

describe('AssociatedOrgListComponent', () => {
  let component: AssociatedOrgListComponent;
  let fixture: ComponentFixture<AssociatedOrgListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociatedOrgListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedOrgListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
