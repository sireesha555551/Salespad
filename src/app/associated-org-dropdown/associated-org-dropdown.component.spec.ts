import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedOrgDropdownComponent } from './associated-org-dropdown.component';

describe('AssociatedOrgDropdownComponent', () => {
  let component: AssociatedOrgDropdownComponent;
  let fixture: ComponentFixture<AssociatedOrgDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociatedOrgDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedOrgDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
