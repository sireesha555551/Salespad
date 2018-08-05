import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  TemplateRef,
  Renderer2
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AddUserComponent } from './add-user/add-user.component';
import { MessageService } from 'primeng/components/common/messageservice';
import { SalesPadDataService } from './services/sales-pad-data/sales-pad-data.service';
import { HttpParams } from '@angular/common/http';
import { SalesPadLoading } from './services/loading-mask/sales-pad-loading.service';
import { Subscription } from 'rxjs/Subscription';
import { urls, Constants } from './services/constants/constants';
import { observableToBeFn } from 'rxjs/testing/TestScheduler';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewInit {
  selectedOrg: any;
  selectedFiles: any;
  toggleUp: string = 'fa fa-caret-up';
  toggleDown: string = 'fa fa-caret-down';
  alertMsgs: any;
  loadingMaskVisible: boolean = false;
  dataObject: any[] = [];
  start: any = 0;
  limit: any = 10;
  asstLimit: any = 1000;
  totalSize: any = 0;
  isViaSearch: boolean = false;
  searchTerm: string = '';
  treeData: any;
  url: any = 'http://192.168.1.207:9095/maintenance/getUsers';
  loadingMaskSubscription: Subscription;
  token: any;
  constructor(
    public loadingMaskService: SalesPadLoading,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private alertMsgService: MessageService,
    private salesPadService: SalesPadDataService,
    private render: Renderer2,
    private http: HttpClient
  ) {

    let tokenObj = { "token": "getSalesPadToken" };
    window.parent.postMessage(JSON.stringify(tokenObj), '*');
    let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    let eventer = window[eventMethod];
    let messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, this.getTokenData.bind(this));
  }

  public getTokenData(e: any){
    var typeCheck = "string";
    if (typeCheck == typeof (e.data)) {
      let tokenData = JSON.parse(e.data);
      if(this.token){
        return;
      }
      else if(tokenData && tokenData.token) {
        if (tokenData.token == "getSalesPadToken") {
          this.token = "NoAccess";
        } else {
          this.token = tokenData.token;
          window['Authorization'] = tokenData.token;
        }
        if(tokenData.orgId){
          Constants.orgId = tokenData.orgId;
        }
        this.init();
      }
    }
  }

  @ViewChild(AddUserComponent) addUserCmp: AddUserComponent;
  @ViewChild('associativeOrgCount') associativeCountElement: ElementRef;
  public getSalesPadData(url, params) {
    debugger
    this.loadingMaskSubscription = this.loadingMaskService.getCmpLoadMaskValue().subscribe(loadValue => this.loadingMask(loadValue));
    this.loadingMaskService.sendAppLoadMaskValue('show');
    this.cdr.detectChanges();
    this.salesPadService.getUsers(url, params).subscribe(
      (res: any) => {
        if (res && res.status == 'success') {
          if (res['Data'] != undefined) {
            this.dataObject = res['Data'];
            this.totalSize = res['Count'];
            this.dataObject.forEach(e => (e['leaf'] = false));
            this.updateAssociateCount();
          }
          this.loadingMaskService.sendAppLoadMaskValue('hide');
        } else {
          console.error('Response failed');
          this.loadingMaskService.sendAppLoadMaskValue('hide');
        }
      },
      error => {
        this.loadingMaskService.sendAppLoadMaskValue('hide');
        console.log(error);
      }
    );
  }
  ngOnInit() {
  }
  ngAfterViewInit() {
  }

  private init(){
    this.titleService.setTitle('SalesPad');
    let httpParams = new HttpParams()
      .set('start', this.start)
      .set('limit', this.limit)
      .set('orgId', Constants.orgId);

    this.getSalesPadData(urls.getUsersUrl, httpParams);
  }

  public orgSearch(e) {
    debugger
    if (e.keyCode == 13 && this.searchTerm.length > 0) {
      this.searchTerm = this.searchTerm.trim();
      if (this.searchTerm.length > 0) {
        this.start = 0;
        this.isViaSearch = true;
        this.loadingMaskSubscription = this.loadingMaskService
          .getCmpLoadMaskValue()
          .subscribe(loadValue => this.loadingMask(loadValue));
        this.loadingMaskService.sendAppLoadMaskValue('show');
        let httpParams = new HttpParams()
          .set('start', this.start)
          .set('limit', this.limit)
          .set('orgId', Constants.orgId)
          .set('searchTerm', this.searchTerm);

        this.getSalesPadData(urls.getUsersBySearchUrl, httpParams);
      }
    }
  }

  public getAcctOrgs(url, params) {
    this.loadingMaskSubscription = this.loadingMaskService
      .getCmpLoadMaskValue()
      .subscribe(loadValue => this.loadingMask(loadValue));
    this.loadingMaskService.sendAppLoadMaskValue('show');
    var response = null;
    this.salesPadService.getAcctOrgs(url, params).subscribe(
      (res: any) => {
        if (res && res.status == 'success') {
          this.loadingMaskService.sendAppLoadMaskValue('hide');

          return res;
        } else {
          console.error('Response failed');
          this.loadingMaskService.sendAppLoadMaskValue('hide');
        }
      },
      error => {
        this.loadingMaskService.sendAppLoadMaskValue('hide');
        console.log(error);
      }
    );
  }

  public getTotalChildCount(rec) {
    var total = 0;
    if (rec.Active != undefined) {
      total += Number(rec.Active);
    }
    if (rec.Inactive != undefined) {
      total += Number(rec.Inactive);
    }
    return total;
  }

  public loadAcctOrgs(e) {
    if (e.node && e.node.data) {
      var rec = e.node.data;
      var org = rec.orgId;
      var user = rec.userId;
      if (e.node.children == undefined) {
        e.node.childPage = 0;
        e.node.childTotalPages = Math.ceil(
          this.getTotalChildCount(e.node.data.statusCounts) / this.limit
        );
        let httpParams = new HttpParams()
          .set('orgId', org)
          .set('userId', user)
          .set('start', '0')
          .set('limit', this.asstLimit);
        this.loadingMaskService.sendAppLoadMaskValue('show');

        this.salesPadService
          .getAcctOrgs(urls.getAcctOrgsUrl, httpParams)
          .subscribe(
            res => {
              if (res['status'] === 'success') {
                e.node.children = res['Data'];
                this.loadingMaskService.sendAppLoadMaskValue('hide');
              } else {
                console.error('Response failed');
                this.loadingMaskService.sendAppLoadMaskValue('hide');
              }
            },
            error => {
              e.node.children = [];
              this.loadingMaskService.sendAppLoadMaskValue('hide');
            }
          );
      }
    }
  }

  public resetSalesPad(event) {
    this.start = 0;
    this.searchTerm = '';
    this.isViaSearch = false;
    let httpParams = new HttpParams()
      .set('start', this.start)
      .set('limit', this.limit)
      .set('orgId', Constants.orgId);

    this.getSalesPadData(urls.getUsersUrl, httpParams);
  }

  public paginate(event) {
    this.start = event.first;
    var url = '';
    if (this.isViaSearch == true) {
      url = urls.getUsersBySearchUrl;
      let httpParams = new HttpParams()
        .set('start', this.start)
        .set('limit', this.limit)
        .set('orgId', Constants.orgId)
        .set('searchTerm', this.searchTerm);
      this.getSalesPadData(url, httpParams);
    } else {
      url = urls.getUsersUrl;
      let httpParams = new HttpParams()
        .set('start', this.start)
        .set('limit', this.limit)
        .set('orgId', Constants.orgId);
      this.getSalesPadData(url, httpParams);
    }
  }

  /****
   * Loading mask based on value(show/hide)
   */
  public loadingMask(value) {
    if (value === 'show') {
      this.loadingMaskVisible = true;
    } else if (value === 'hide') {
      this.loadingMaskVisible = false;
    }
  }

  /****
   *  This method is used to count the organisation data
   */

  public orgsDataCount(orgData?) {
    let count: any;
    let childOrgName: any;
    if (orgData && orgData['data'] != undefined) {
      var childData = orgData['data']['statusCounts'];
      if (childData === undefined) {
        if (orgData.data.childOrgName !== undefined) {
          return orgData.data.childOrgName;
        } else {
          if (orgData && orgData.children && orgData.children !== undefined) {
            let activeCount = 0;
            let inActiveCount = 0;
            orgData.children.forEach((item, i) => {
              if (item.data.status === 1 || item.data.status === 'Active') {
                activeCount++;
              } else if (
                item.data.status === 0 ||
                item.data.status === 'Inactive'
              ) {
                inActiveCount++;
              }
            });
            let totalCount = Number(activeCount) + Number(inActiveCount);
            return '(' + totalCount + ')';
          }
        }
      } else {
        let totalCount = 0,
          activeCount = 0,
          inactiveCount = 0;

        if (
          childData &&
          childData['Active'] &&
          childData['Active'] != undefined
        ) {
          activeCount = Number(childData['Active']);
        }
        if (
          childData &&
          childData['Inactive'] &&
          childData['Inactive'] != undefined
        ) {
          inactiveCount = Number(childData['Inactive']);
        }
        totalCount = activeCount + inactiveCount;
        return '(' + totalCount + ')';
      }
    } else {
      return orgData.childOrgName;
    }
  }

  /****
   *  This method is used to count the organisation data
   */

  public hideFields(item) {
    if (item) {
      if (item.leaf == false) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /****
   *  This method is executed when the add user button is clicked.
   */

  public addUser(isAddUser) {
    this.addUserCmp.onAddUserClick(null);
    this.addUserCmp.showAddUser(isAddUser);
  }

  /****
   *  This method is executed when the edit button is clicked in the sales pad
   * @param  editItem conatins the data related to the the edit user option click
   * on the sales pad table
   * @param isEditUser describes that the data is related to editUser
   */

  public editUserOrg(editItem, isEditUser) {
    if (editItem.children && editItem.children.length > 0) {
      let organization = this.prepareOrganization(editItem.children);
      editItem['children'] = organization;
      this.addUserCmp.editUser(editItem, isEditUser);
    } else if (editItem.children === undefined) {
      var rec = editItem.data;
      var org = rec.orgId;
      var user = rec.userId;
      this.loadingMaskService.sendAppLoadMaskValue('show');
      if (editItem.children == undefined) {
        editItem.childPage = 0;
        editItem.childTotalPages = Math.ceil(
          this.getTotalChildCount(editItem.data.statusCounts) / this.limit
        );
        let httpParams = new HttpParams()
          .set('orgId', org)
          .set('userId', user)
          .set('start', '0')
          .set('limit', this.asstLimit);

        this.salesPadService
          .getAcctOrgs(urls.getAcctOrgsUrl, httpParams)
          .subscribe(
            res => {
              if (res['status'] === 'success') {
                let data = res['Data'];
                editItem.children = this.prepareOrganization(data);
                this.addUserCmp.editUser(editItem, isEditUser);
                this.loadingMaskService.sendAppLoadMaskValue('hide');
              } else {
                console.error('Response failed');
                this.loadingMaskService.sendAppLoadMaskValue('hide');
              }
            },
            error => {
              editItem.children = [];
              this.loadingMaskService.sendAppLoadMaskValue('hide');
            }
          );
      }
    }
  }
  /****
   *  addOrganisations is called when the save button is clicked from the add user form
   * @param orgData contains data of the updated records to be updated in the sales pad
   * data table
   */

  public addOrganization(orgData) {
    let org = {};
    org['orgId'] = orgData[0].orgId;
    org['orgName'] = orgData[0].orgName;
    org['screenName'] = orgData[0].screenName;
    org['userId'] = orgData[0].userId;
    let orgDataIndex = this.dataObject.findIndex(
      x =>
        x.data.orgName === org['orgName'] &&
        x.data.screenName === org['screenName']
    );
    if (orgDataIndex >= 0) {
      let asstIndex;
      let obj = {};
      orgData.forEach(ele => {
        if (this.dataObject[orgDataIndex].children !== undefined) {
          asstIndex = this.dataObject[orgDataIndex].children.findIndex(
            child => child.childOrgId === ele.asstOrgId
          );
        }
        if (asstIndex >= 0) {
          this.dataObject[orgDataIndex].children[asstIndex].status = ele.status;
          // this.dataObject[orgDataIndex].children.splice(asstIndex, 0,);
        } else {
          obj = {
            data: {
              childOrgId: ele.asstOrgId,
              childOrgName: ele.asstOrgName,
              id: ele.id,
              status: ele.status
            }
          };
          if (this.dataObject[orgDataIndex].children === undefined) {
            // var rec = e.node.data;
            var org = ele.orgId;
            var user = ele.userId;
            if (this.dataObject[orgDataIndex].children == undefined) {
              // this.dataObject[orgDataIndex]['children']['childPage'] = 0;
              this.dataObject[
                orgDataIndex
              ].children.childTotalPages = Math.ceil(
                this.getTotalChildCount(
                  this.dataObject[orgDataIndex].node.data.statusCounts
                ) / this.limit
              );
              let httpParams = new HttpParams()
                .set('orgId', org)
                .set('userId', user)
                .set('start', '0')
                .set('limit', this.asstLimit);
              this.loadingMaskService.sendAppLoadMaskValue('show');

              this.salesPadService
                .getAcctOrgs(urls.getAcctOrgsUrl, httpParams)
                .subscribe(
                  res => {
                    this.dataObject[orgDataIndex].children = res['Data'];
                    this.dataObject[orgDataIndex]['children'].push(obj);

                    this.loadingMaskService.sendAppLoadMaskValue('hide');
                  },
                  error => {
                    this.dataObject[orgDataIndex].children = [];
                    this.loadingMaskService.sendAppLoadMaskValue('hide');
                  }
                );
            }
          } else {
            this.dataObject[orgDataIndex]['children'].push(obj);
          }
        }
      });
    } else {
      let dataObj: any = { data: {}, children: [] };
      let data: any;
      let children: any;
      let childarr = [];
      orgData.forEach(ele => {
        data = {
          orgName: ele.orgName,
          screenName: ele.screenName,
          userId: ele.userId,
          orgId: ele.orgId,
          status: '',
          id: ele.id
        };
        children = {
          data: {
            childOrgId: ele.asstOrgId,
            childOrgName: ele.asstOrgName,
            id: ele.id,
            status: ele.status
          }
        };

        childarr.push(children);
      });
      dataObj.data = data;
      dataObj.children = childarr;
      this.dataObject.push(dataObj);
      this.dataObject.forEach(e => (e['leaf'] = false));
    }

    this.updateAssociateCount();
  }

  /****
   *  This method is used to update the status count of the depending on the status of the
   * associated organizations dynamically.
   */

  private updateAssociateCount() {
    this.dataObject.forEach(item => {
      let activeCount = 0;
      let inActiveCount = 0;

      if (item.data && item.data.statusCounts) {
        var childData = item.data.statusCounts;

        if (childData['Active'] != undefined) {
          activeCount = Number(childData['Active']);
        } else {
          activeCount = 0;
        }

        if (childData['Inactive'] != undefined) {
          inActiveCount = Number(childData['Inactive']);
        } else {
          inActiveCount = 0;
        }
      } else {
        if (item && item.children && item.children !== undefined) {
          item.children.forEach((item, i) => {
            if (item.data.status === 1 || item.data.status === 'Active') {
              activeCount++;
            } else if (
              item.data.status === 0 ||
              item.data.status === 'Inactive'
            ) {
              inActiveCount++;
            }
          });
        }
      }
      item.data.status = `Active (${activeCount}) Inactive (${inActiveCount})`;
    });
  }

  /****
   *  This method is executed when the save button is clicked in the edit users form
   * @param orgData contains the data of updated records and deleted records of that
   * particular record.
   */

  public updateOrganization(orgData) {
    orgData.data.updatedUsers.forEach(ele => {
      let i = null;
      this.dataObject.forEach((element, index) => {
        if (i == null) {
          if (element.data.id && element.data.id !== undefined) {
            if (element.data.id == ele.id) {
              i = index;
            }
          }
        }
      });
      if (i === null) {
        this.dataObject.forEach((element, index) => {
          if (
            element.data.screenName == ele.screenName &&
            element.data.orgId == ele.orgId
          ) {
            i = index;
          }
        });
      }
      let asstIndex = this.dataObject[i].children.findIndex(
        x => x.data.childOrgName == ele.asstOrgName
      );

      if (asstIndex >= 0) {
        this.dataObject[i].children[asstIndex].data.status = ele.status;
        let active = 0;
        let inactive = 0;
        this.dataObject[i].children.forEach(child => {
          if (child.data.status === 1) {
            active++;
          } else if (child.data.status === 0) {
            inactive++;
          }
        });
        this.dataObject[
          i
        ].data.status = `Active (${active}) Inactive (${inactive})`;
        if (this.dataObject[i].data.statusCounts !== undefined) {
          this.dataObject[i].data.statusCounts.Active = Number(active);
          this.dataObject[i].data.statusCounts.Inactive = Number(inactive);
        }
      } else {
        let obj = {
          data: {
            childOrgId: ele.asstOrgId,
            childOrgName: ele.asstOrgName,
            id: ele.id,
            status: ele.status
          }
        };
        this.dataObject[i].children.push(obj);
        let active = 0;
        let inactive = 0;
        this.dataObject[i].children.forEach(child => {
          if (child.data.status === 1) {
            active++;
          } else if (child.data.status === 0) {
            inactive++;
          }
        });
        this.dataObject[
          i
        ].data.status = `Active (${active}) Inactive (${inactive})`;
        if (this.dataObject[i].data.statusCounts !== undefined) {
          this.dataObject[i].data.statusCounts.Active = Number(active);
          this.dataObject[i].data.statusCounts.Inactive = Number(inactive);
        }
      }
      this.updateAssociateCount();
    });
    orgData.data.deletedUsers.forEach(user => {
      this.dataObject.forEach((ele, index) => {
        if (ele.children !== undefined) {
          let i = ele.children.findIndex(child => child.data.id == user.id);
          if (i >= 0) {
            ele.children.splice(i, 1);
            let active = 0;
            let inactive = 0;
            this.dataObject[index].children.forEach(child => {
              if (child.data.status === 1) {
                active++;
              } else if (child.data.status === 0) {
                inactive++;
              }
            });
            this.dataObject[
              index
            ].data.status = `Active (${active}) Inactive (${inactive})`;
            if (
              this.dataObject[index] &&
              this.dataObject[index].data !== undefined &&
              this.dataObject[index].data.statusCounts !== undefined
            ) {
              this.dataObject[index].data.statusCounts.Active = Number(active);
              this.dataObject[index].data.statusCounts.Inactive = Number(
                inactive
              );
            }
          }
        } else {
        }
        this.updateAssociateCount();
      });
    });

    for(let i=0; i< this.dataObject.length; i++){
     if(this.dataObject != undefined && this.dataObject[i].data != undefined){
      if(this.dataObject[i].data.status == "Active (0) Inactive (0)"){
        this.dataObject.splice(i, 1);
      }
     }
    }

    this.cdr.detectChanges();
  }

  /****
   * Returns the array of the data of the organisation elements
   * @param organisation conatins organisations data
   */

  public prepareOrganization(organisation) {
    var array = [];
    for (var i = 0; i < organisation.length; i++) {
      if (organisation[i].data && organisation[i].data !== undefined) {
        array.push({ data: organisation[i].data });
      } else {
        array.push({ data: organisation[i] });
      }
    }
    return array;
  }

  /****
   * Method to show success/failure
   * @param severity contains the state of the record
   * @param msg contains the message to display based upon the severity
   */

  public showMessage(severity, msg) {
    this.alertMsgService.add({ severity: 'success', summary: '', detail: msg });
  }

  /****
   * Method to set the status to active or Inactive
   * @param statusData contains Data of  the associated child organizations
   * @param childElement element reference to the child element
   */

  public getStatus(statusData, childElement) {
    if (statusData.leaf != undefined && statusData.leaf == false) {
      return statusData.data.status;
    } else {
      if (statusData.data && statusData.data !== undefined) {
        if (
          (statusData.data.status != undefined &&
            statusData.data.status == true) ||
          statusData.data.status == 1
        ) {
          this.render.setStyle(childElement, 'color', 'green');
          return 'Active';
        } else if (
          (statusData.data.status != undefined &&
            statusData.data.status == false) ||
          statusData.data.status == 0
        ) {
          this.render.setStyle(childElement, 'color', 'red');
          return 'Inactive';
        } else if (statusData.data.status !== undefined) {
          return statusData.data.status;
        }
      } else {
        if (statusData.status != undefined && statusData.status == true) {
          this.render.setStyle(childElement, 'color', 'green');
          return 'Active';
        } else {
          this.render.setStyle(childElement, 'color', 'red');
          return 'Inactive';
        }
      }
    }
  }
}
