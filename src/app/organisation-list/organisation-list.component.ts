import {
  Component,
  Output,
  Input,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ChangeDetectorRef,
  forwardRef,
  NgZone,
  ElementRef
} from '@angular/core';
import { OverlayPanelModule, TreeNode } from 'primeng/primeng';
import { TreeViewComponent } from '../tree-view/tree-view.component';
import { HttpClient } from '@angular/common/http';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrganisationListComponent),
      multi: true
    }
  ]
})
export class OrganisationListComponent implements OnInit, ControlValueAccessor {
  treeData: TreeNode[]; //Service data
  @Input() uiTreeData: any; //UI bound data
  _uiTreeData: any;
  orgData: any;
  showOPtip: boolean = false;
  showDropDown: boolean;
  element: HTMLElement;
  showOrgButton: boolean = false;
  hasData: boolean = false;
  _selectedOrganisation: string;
  set selectedOrganisation(value) {
    this._selectedOrganisation = value;
    this.propagateChange(this._selectedOrganisation);
  }
  get selectedOrganisation() {
    return this._selectedOrganisation;
  }
  /*Organisation change event is emitted to app component after child node is received from tree view*/
  @Output() orgChanged = new EventEmitter();

  /*Token should be updated to app component*/
  @Output() updateToken = new EventEmitter();

  /*Custom tree view component*/
  @ViewChild(TreeViewComponent) tree_view: TreeViewComponent;

  constructor(
    private ref: ChangeDetectorRef,
    private el: ElementRef,
    private http: HttpClient,
    private zone: NgZone
  ) {}
  ngAfterViewInit() {}
  /**
   * Fires after the overlay panel is shown
   */
  public afterShow(evt, op) {
    this.expandAll();
    this.expandSelected();
    this.beforeToggle();
  }

  /**
   * Fires after the overlay panel is hidden and internally clears the filter.
   */
  public afterHide() {
    this.clearTreeFilter();
    this.collapseAll();
    this.beforeToggle();
  }

  /**
   * Toggle the custom tip of the overlay panel
   */
  public beforeToggle() {
    if (this.showOPtip == false) {
      this.showOPtip = true;
      //To set the position of overlay panel tip
      if (document.getElementById('org-btn')) {
        var tipXY = document.getElementById('org-btn').getBoundingClientRect();
        if (
          tipXY &&
          tipXY.left != undefined &&
          document.getElementById('op-tip')
        ) {
          document.getElementById('op-tip').style.left = tipXY.left + 'px';
        }
      }
    } else {
      this.showOPtip = false;
    }
  }

  /*Filtering the tree panel data*/
  public filterTree(evt, elem, data) {
    this.tree_view.filter(data, elem.value);
  }

  /*Clearing the filtered tree data*/
  public clearTreeFilter() {
    this.tree_view.clearFilter();
  }

  /*Child node click handled*/
  public handleNodeSelection(node, overlay_panel) {
    this.showDropDown = false;
    this.selectedOrganisation = node.orgName;
    /*console.info(node);//Do stuff here...*/
    this.orgData = node;
    this.orgChanged.emit(node);
    // overlay_panel.hide();
  }

  /*Handle keyboard ENTER key of input for filtering tree*/
  public onTreeSearch(evt, elem, data) {
    if (elem.value != '') {
      this.filterTree(evt, elem, data);
    } else {
      this.clearTreeFilter();
    }
  }

  /**
   * Expand Selected Node Path
   */

  public expandSelected() {
    var _orgId = '';
    if (this.orgData && this.orgData.orgId) {
      _orgId = this.orgData.orgId;
    }
    this.tree_view.expandSelectedNodePath(this.uiTreeData, _orgId);
  }

  /*Expand all nodes*/
  public expandAll() {
    this.tree_view.expandNodes();
  }

  /*Collapse all nodes*/
  public collapseAll() {
    this.tree_view.collapseNodes();
  }

  /*Get tree data and return to a new variable*/
  private getTreeData() {
    var data = <TreeNode[]>this.treeData;
    function iterate(obj) {
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] == 'object') {
            iterate(obj[property]);
          } else {
            obj['expanded'] = false;
          }
        }
      }
    }
    iterate(data);
    return data;
  }

  /*Initializing, service call and data assigning*/
  public initialize(url, data, isWdAdmin) {}

  ngOnInit() {}
  propagateChange = (_: any) => {};

  /**
   * Custom value accessor function which sets the selectedOrganisation value when
   * there is change in the selectedOrganisation from the add or edit user form
   */

  writeValue(value: any) {
    if (value !== undefined) {
      this.selectedOrganisation = value;
    }
  }

  /**
   * registerOnChange is called when the value is changed
   */

  registerOnChange(fn) {
    this.propagateChange = fn;
  }
  registerOnTouched() {}

  /**
   * Show/hide the organisation drop down
   */
  onShowDropDownClick(event) {
    if (!this.showDropDown) {
      this.showDropDown = true;
      setTimeout(() => {
        this._uiTreeData = this.uiTreeData;
      }, 50);
    } else {
      this.showDropDown = false;
      this._uiTreeData = [];
    }
  }

  /**
   * Hide the organisation drop down when we click outside the drop down
   */

  onClickedOutside() {
    this.showDropDown = false;
    this._uiTreeData = [];
  }
}
