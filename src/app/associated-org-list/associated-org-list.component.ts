import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  ChangeDetectorRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-associated-org-list',
  templateUrl: './associated-org-list.component.html',
  styleUrls: ['./associated-org-list.component.scss']
})
export class AssociatedOrgListComponent implements OnInit, OnChanges {
  @Input() treeData;
  @Input() isAddClick;
  @Input() isEditUser;
  @Input() selectedUser;
  @Input() selectedAssociateOrganisations;
  @Output() selectedOrgsData = new EventEmitter();
  /*Node selected event on Organisation component*/
  @Output() nodeSelected = new EventEmitter();

  /*Node selected event on recursive component*/
  @Output() childNodeSelected = new EventEmitter();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}
  ngOnChanges() {
    if (this.isAddClick === true) {
      this.onAddClick();
      this.isAddClick = false;
    }
    if (
      this.selectedAssociateOrganisations &&
      this.selectedAssociateOrganisations !== undefined
    ) {
      this.arr = this.selectedAssociateOrganisations;
    }
  }
  ngOnInit() {}
  checkboxSelected: boolean;
  arr = [];
  /**
   * Toggle parent node expand/collapse
   * @param elem is the parent node element
   * @param node contains details/data of the node.
   */
  public toggleList(elem, node) {
    if (node.expanded == undefined || node.expanded == false) {
      node.expanded = true;
    } else {
      node.expanded = false;
    }
  }

  /**
   * Expand all parent nodes
   */
  public expandNodes() {
    function iterate(obj) {
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] == 'object') {
            iterate(obj[property]);
          } else {
            obj['expanded'] = true;
          }
        }
      }
    }
    iterate(this.treeData);
  }

  /**
   * Collapse all parent nodes
   */
  public collapseNodes() {
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
    iterate(this.treeData);
  }

  /**
   * Expand selected path
   */
  public expandSelectedNodePath(data, searchText) {
    function getPath(obj, val, path?) {
      path = path || '';
      var fullpath = '';
      for (var b in obj) {
        if (b == 'orgId' && obj[b] == val) {
          return path + '/' + obj['orgName'];
        } else if (typeof obj[b] === 'object') {
          if (obj['orgName']) {
            fullpath =
              getPath(obj[b], val, path + '/' + obj['orgName']) || fullpath;
          } else {
            fullpath = getPath(obj[b], val, path + '/') || fullpath;
          }
        }
      }
      return fullpath;
    }

    var v = getPath(data, searchText);
    var pathArray = v.split('/');
    pathArray = pathArray.filter(value => value != '');

    function iterate(obj, searchText, queryField, deepChild) {
      var returnVal = true;
      for (var i = 0; i < obj.length; i++) {
        var prop = obj[i];
        if (prop.hasOwnProperty(queryField)) {
          if (prop['children'] == undefined || prop['children'].length == 0) {
            if (prop[queryField] == searchText) {
              prop['expanded'] = true;
              returnVal = false;
            } else {
              prop['expanded'] = false;
            }
          } else {
            var childrenObj = prop['children'];
            var flag = true,
              found = false;
            flag = iterate(childrenObj, searchText, queryField, deepChild);
            if (prop[queryField] == searchText) {
              found = true;
            }
            prop['expanded'] = !(!found && flag);
            if (!(!found && flag)) {
              returnVal = !found && flag;
            }
          }
        }
      }
      return returnVal;
    }

    var searchField = 'orgName';
    if (pathArray && pathArray.length > 0) {
      var len = pathArray.length;
      if (len <= 1) {
      } else {
        var a = 0;
        while (len > a) {
          if (this.treeData != undefined) {
            var deepChild: boolean = false;
            if (a == len - 1) {
              deepChild = true;
              iterate(this.treeData, pathArray[a], searchField, deepChild);
            } else {
              iterate(this.treeData, pathArray[a], searchField, deepChild);
            }
            a++;
          }
        }
      }
    }

    /**
     * To Highlight the selected node.
     */
    function highlightNode() {
      var treeview = document.getElementById('mainTree');
      if (treeview && treeview.getElementsByTagName('span')) {
        var elements = treeview.getElementsByTagName('span');
        if (elements && elements.length > 0) {
          var len = elements.length;
          for (var i = 0; i < len; i++) {
            if (pathArray && pathArray.length > 0) {
              if (
                elements[i] &&
                elements[i].innerHTML == pathArray[pathArray.length - 1]
              ) {
                var prev = document.getElementsByClassName('deepnode');
                if (prev && prev.length > 0) {
                  for (var a = 0; a < prev.length; a++) {
                    var e = <HTMLElement>prev[a];
                    e.className = '';
                  }
                }
                var element = <HTMLElement>elements[i];
                element.className = 'deepnode';
              }
            } else {
              var prev = document.getElementsByClassName('deepnode');
              if (prev && prev.length > 0) {
                for (var a = 0; a < prev.length; a++) {
                  var e = <HTMLElement>prev[a];
                  e.className = '';
                }
              }
              var element = <HTMLElement>elements[0];
              element.className = 'deepnode';
              break;
            }
          }
        }

        /**
         * To scroll to the node which is selected.
         */
        var dnode = document.getElementsByClassName('deepnode');
        if (dnode && dnode.length > 0) {
          if (dnode[0] && typeof dnode[0].getBoundingClientRect == 'function') {
            var elPosition = dnode[0].getBoundingClientRect();
            var elTop = elPosition.top;
            var frame = document.getElementById('mainTree');
            if (
              frame &&
              frame.scrollHeight &&
              frame.clientHeight &&
              frame.scrollHeight > frame.clientHeight
            ) {
              if (elTop > 250) {
                frame.scrollTop = elTop - 150;
              }
            }
          }
        }
      }
    }

    setTimeout(highlightNode, 100);
  }

  /**
   * Handle child node selection on recursive component
   * @param node contains the selected node details/data.
   */
  public childNodeSelection(node) {
    // this.nodeSelected.emit(node);
  }

  /**
   * Child node selection event emitted to send data of node to parent component.
   * @param node contains selected node details/data.
   * @param evt contains event object.
   */
  public selectNode(node, evt) {
    // this.nodeSelected.emit(node);
  }

  /*To toggle the expand/collapse icon based on node*/
  public getIconClass(isExpanded) {
    if (isExpanded == true) {
      return 'fa fa-caret-down';
    } else {
      return 'fa fa-caret-right';
    }
  }

  /**
   * Recursive function to assign any values to nodes.
   * @param data contains the tree object to iterate.
   * @param searchText is property name to which any data should be assigned.
   */

  private iterateNodes(data, searchText) {
    function iterate(obj, searchText, queryField) {
      var returnVal = true;
      for (var i = 0; i < obj.length; i++) {
        var prop = obj[i];
        if (prop.hasOwnProperty(queryField)) {
          if (prop['children'] == undefined || prop['children'].length == 0) {
            if (
              prop[queryField]
                .toLowerCase()
                .indexOf(searchText.trim().toLowerCase()) >= 0
            ) {
              prop['hidden'] = false;
              prop['expanded'] = true;
              returnVal = false;
            } else {
              prop['hidden'] = true;
              prop['expanded'] = false;
            }
          } else {
            var childrenObj = prop['children'];
            var flag = true,
              found = false;
            flag = iterate(childrenObj, searchText, queryField);
            if (
              prop[queryField]
                .toLowerCase()
                .indexOf(searchText.trim().toLowerCase()) >= 0
            ) {
              found = true;
            }
            prop['hidden'] = !found && flag;
            prop['expanded'] = !(!found && flag);
            if (!(!found && flag)) {
              returnVal = !found && flag;
            }
          }
        }
      }
      return returnVal;
    }
    var searchField = 'orgName';
    iterate(data, searchText, searchField);
  }

  /**
   * To filter the tree view data
   * @param data contains the tree object.
   * @param searchText is property name to filter with.
   */

  public filter(data, searchText) {
    if (data != undefined && searchText != undefined) {
      this.iterateNodes(data, searchText);
      data = JSON.parse(JSON.stringify(data));
      this.expandNodes();
    }
  }

  /**
   * To clear filter for the tree view data
   */
  public clearFilter() {
    (<HTMLInputElement>document.getElementById('treeinput')).value = '';
    if (this.treeData != undefined) {
      this.iterateNodes(this.treeData, '');
    }
  }

  /**
   * To check if the parent node is expanded or collapsed.
   * @param elem contains the element of the parent node to check state of visibility.
   */
  private isNodeExpanded(elem) {
    if (
      elem &&
      elem.getElementsByTagName('tree-view')[0] &&
      elem.getElementsByTagName('tree-view')[0].style.display == 'none'
    ) {
      return false;
    } else {
      return true;
    }
  }

  onOrgSelection(evt, node) {
    if (!this.checkboxSelected) {
      this.checkboxSelected = true;

      if (node.children && node.children.length === 0) {
        if (node.isSelected === undefined) {
          node.isSelected = true;
        } else if (node.isSelected !== undefined) {
          if (node.isSelected === true) {
            node.isSelected = false;
          } else {
            node.isSelected = true;
          }
        }
      } else {
        this.selectAll(node);
      }
    } else {
      this.checkboxSelected = false;
      if (node.children && node.children.length === 0) {
        if (node.isSelected === undefined) {
          node.isSelected = true;
        } else if (node.isSelected !== undefined && node.isSelected === true) {
          node.isSelected = false;
        }
      } else {
        this.unselectAll(node);
      }
    }
  }
  selectAll(val) {
    if (val.children !== undefined && val.children.length > 0) {
      val.children.forEach(element => {
        element['isSelected'] = true;
        return this.selectAll(element);
      });
    }
  }
  unselectAll(val) {
    if (val.children !== undefined) {
      val.children.forEach(element => {
        element['isSelected'] = false;
        return this.unselectAll(element);
      });
    }
  }
  onAddClick() {
    this.selectedOrgsList();
    this.selectedOrgsData.emit(this.arr);
  }
  selectedOrgsList() {
    this.arr = [];
    this.treeData.forEach(element => {
      this.selectedOrgs(element);
    });
  }

  private selectedOrgs(element: any) {
    if (element.children && element.children.length > 0) {
      element.children.forEach(element => {
        if (element.isSelected === true) {
          this.arr.push(element);
        }
        this.selectedOrgs(element);
      });
    }
  }
}
