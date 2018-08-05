import {
  Component,
  OnInit,
  Input,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';
import { AssociatedOrgListComponent } from '../associated-org-list/associated-org-list.component';
import { OverlayPanel } from 'primeng/primeng';
@Component({
  selector: 'app-associated-org-dropdown',
  templateUrl: './associated-org-dropdown.component.html',
  styleUrls: ['./associated-org-dropdown.component.scss']
})
export class AssociatedOrgDropdownComponent implements OnInit {
  @Input() treeData;
  @Input() isEditUser;
  @Input() selectedUser;
  @Input() selectedAssociateOrganisations;
  @Output() onChildOrganisationSelect = new EventEmitter();
  @ViewChild(AssociatedOrgListComponent) asst: AssociatedOrgListComponent;
  @ViewChild(OverlayPanel) overlay: OverlayPanel;
  isAddClick: boolean;

  constructor() {}

  ngOnInit() {}
  onAddClick() {
    this.asst.onAddClick();
    this.overlay.hide();
  }
  selectedOrgsData(data) {
    this.onChildOrganisationSelect.emit(data);
  }
  public onTreeSearch(evt, elem, data) {
    if (elem.value != '') {
      this.filterTree(evt, elem, data);
    } else {
      this.clearTreeFilter();
    }
  }
  public filterTree(evt, elem, data) {
    this.asst.filter(data, elem.value);
  }
  public clearTreeFilter() {
    this.asst.clearFilter();
  }
  public collapseAll() {
    this.asst.collapseNodes();
  }
  childOrgSelect(event: any, el: any) {
    if (this.treeData !== undefined) {
      if (!this.isEditUser) {
        if (this.selectedUser !== undefined && this.selectedUser.screenName) {
          el.toggle(event);
        }
      } else {
        el.toggle(event);
      }
    }
  }
}
