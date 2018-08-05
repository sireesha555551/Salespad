/**
 * Tree View Component [Custom component to display the data in tree view]
 */
import {
  Component,
  Input,
  Output,
  NgModule,
  EventEmitter,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SalesPadDataService } from '../services/sales-pad-data/sales-pad-data.service';
import { urls } from '../services/constants/constants';

// import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
/**
 * Tree view component
 * <tree-view [treeData]="data" (nodeSelected)="handleNodeSelection($event,op)"></tree-view>
 * [treeData] is input parameter where data from service is assigned.
 * (nodeSelected) event to send the selected node to parent component.
 */
@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TreeViewComponent implements OnInit {
  _treeData: any;
  /*Input property to bind the data to the component*/
  @Input() treeData;

  /*Node selected event on Organisation component*/
  @Output() nodeSelected = new EventEmitter();

  /*Node selected event on recursive component*/
  @Output() childNodeSelected = new EventEmitter();
  ngOnInit() {}
  showLoadingMask: boolean;
  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private salesPadService: SalesPadDataService
  ) {}
  /**
   * Toggle parent node expand/collapse
   * @param elem is the parent node element
   * @param node contains details/data of the node.
   */
  public toggleList(elem, node) {
    if (
      node.parentOrgId == 0 &&
      node.children &&
      node.children.length == 0 &&
      (node.expanded == undefined || node.expanded == false)
    ) {
      let httpParams = new HttpParams().set('orgId', node.orgId);
      if (document.getElementById('listMask')) {
        document.getElementById('listMask').style.display = 'block';
      }
      this.cdr.detectChanges();
      this.salesPadService.getOrgs(urls.getOrgsUrl, httpParams).subscribe(
        data => {
          if (data['status'] === 'success') {
            var childData = [];
            if (
              data['Data'] &&
              data['Data'].orgs &&
              data['Data'].orgs.length > 0
            ) {
              childData = data['Data'].orgs[0].children;
            }
            node.children = JSON.parse(JSON.stringify(childData));
            if (document.getElementById('listMask')) {
              document.getElementById('listMask').style.display = 'none';
            }
          } else {
            console.error('response failed');
            if (document.getElementById('listMask')) {
              document.getElementById('listMask').style.display = 'none';
            }
          }
          node.expanded = true;
        },
        error => {
          if (document.getElementById('listMask')) {
            document.getElementById('listMask').style.display = 'none';
          }
          console.log(error);
        }
      );
    } else if (node.expanded == true && node.parentOrgId == 0) {
      node.expanded = false;
    } else {
      if (node.expanded == undefined || node.expanded == false) {
        node.expanded = true;
      } else {
        node.expanded = false;
      }
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
    this.nodeSelected.emit(node);
  }

  /**
   * Child node selection event emitted to send data of node to parent component.
   * @param node contains selected node details/data.
   * @param evt contains event object.
   */
  public selectNode(node, evt) {
    this.nodeSelected.emit(node);
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
              if (
                prop['parentOrgId'] != 0 ||
                (prop['children'] != undefined && prop['children'].length > 0)
              ) {
                prop['expanded'] = true;
              }
              returnVal = false;
            } else {
              prop['hidden'] = true;
              if (
                prop['parentOrgId'] != 0 ||
                (prop['children'] != undefined && prop['children'].length > 0)
              ) {
                prop['expanded'] = false;
              }
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
            if (
              prop['parentOrgId'] != 0 ||
              (prop['children'] != undefined && prop['children'].length > 0)
            ) {
              prop['expanded'] = !(!found && flag);
            }
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
      // this.expandNodes();
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

  public isParentNode(node): boolean {
    if (node.parentOrgId == 0) {
      return true;
    } else if (node.children && node.children.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
