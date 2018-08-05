import {
  Component,
  OnInit,
  ViewEncapsulation,
  Renderer2,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Dropdown } from 'primeng/primeng';
import { ViewChild } from '@angular/core';
import { SalesPadDataService } from '../services/sales-pad-data/sales-pad-data.service';
import { SalesPadLoading } from '../services/loading-mask/sales-pad-loading.service';
import { Subscription } from 'rxjs/Subscription';
import { ConfirmationService } from 'primeng/api';
import { Constants, urls } from '../services/constants/constants';
import { setTimeout } from 'timers';
import { Observable } from 'rxjs/Observable';
import { element } from 'protractor';
@Component({
  selector: 'add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddUserComponent implements OnInit, AfterViewInit {
  loadingMaskSubscription: Subscription;
  constructor(
    private salesPadService: SalesPadDataService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private renderer: Renderer2,
    private eleRef: ElementRef,
    public loadingMaskService: SalesPadLoading,
    private confirmationService: ConfirmationService
  ) {}
  currentOrg: any;
  addUserVisible: boolean = false;
  dragDialog: boolean = false;
  isAddUser = true;
  isEditUser: boolean;
  selectedUser: any;
  responsePoPrifix: any;
  selectedAssociateOrganisations = [];
  organisationsList = [];
  editUserObject: any;
  user: any[];
  filterUsers: any[];
  formLoadingMaskVisible = false;
  formHeader: string;
  isUserRecordUpdated: boolean;
  organization: any = [
    { label: 'Lianmer' },
    { label: 'Sparco' },
    { label: 'Leece-Neville' }
  ];
  associatedOrg: any = [
    { label: 'Associated1' },
    { label: 'Associated2' },
    { label: 'Associated3' }
  ];
  addRecords: any = [
    {
      data: {
        orgs: 'test',
        id: this.dynamicUserId(),
        status: 'Active',
        statusVal: true
      }
    }
  ];
  recordDetails = {
    updatedUsers: [],
    deletedUsers: []
  };

  cloneaddRecords: any = [];
  treeArray = [];
  formMode: any;
  currentUser: any;
  uiTreeData: any;
  childOrganisationData: any;
  existingaddRecords = [];
  selectedParentOrganization: '';
  allRecords = [];
  selectedAssociateOrganisation: any;
  tableRowIndex: any;
  poPrefix: string;

  @Output() addOrganization = new EventEmitter();
  @Output() updateOrganization = new EventEmitter();
  @ViewChild('userDropDown') userDropDown: Dropdown;

  ngOnInit() {
    this.loadingMaskSubscription = this.loadingMaskService
      .getCmpLoadMaskValue()
      .subscribe(loadValue => this.loadingMask(loadValue));
  }

  ngAfterViewInit() {
    const dropDownElement = this.eleRef.nativeElement.querySelector(
      '.dropdown-cls'
    );
  }

  /****
   * This action is performed when the Add User button is clicked and sets the display
   * state of the form to true.
   * @param isAddUSer contains the boolean value whether its a edit user or edit user form
   */

  public showAddUser(isAddUser?) {
    if (isAddUser) {
      this.isAddUser = true;
    }
    this.addUserVisible = true;
  }
  public close(evt) {
    this.addUserVisible = false;
  }

  /****
   * Loading mask based on value(show/hide)
   * @param value contains show or value to display or hide the loading mask
   */

  public loadingMask(value) {
    if (value === 'show') {
      this.formLoadingMaskVisible = true;
    } else if (value === 'hide') {
      this.formLoadingMaskVisible = false;
    }
  }

  /****
   * Add a record as per the selected user and child organisation
   * @param associatedOrgDetails conatins the associated organization data
   * @param isChildOrgChanged defines whether a associated organization is
   * changes or not
   */

  public addAssociatedOrg(associatedOrgDetails, isChildOrgChanged) {
    if (this.addRecords) {
      if (this.currentOrg === undefined) {
        var addOrg: any = {
          orgName: this.addRecords[0].data.orgName,
          orgId: this.addRecords[0].data.orgId,
          status: 1,
          screenName: this.addRecords[0].data.screenName,
          userId: this.addRecords[0].data.userId,
          asstOrgName: '',
          asstOrgId: 12,
          id: 0
        };
      } else if (this.formMode == 'edit') {
        var addOrg: any = {
          orgName: this.currentOrg.orgName,
          orgId: this.currentOrg.orgId,
          status: 1,
          screenName: this.editUserObject.screenName,
          userId: this.editUserObject.userId,
          asstOrgName: '',
          asstOrgId: 12,
          id: 0
        };
      } else {
        var addOrg: any = {
          orgName: this.currentOrg.orgName,
          orgId: this.currentOrg.orgId,
          status: 1,
          screenName: this.selectedUser.screenName,
          userId: this.selectedUser.userId,
          asstOrgName: '',
          asstOrgId: 12,
          id: 0
        };
      }

      if (associatedOrgDetails) {
        addOrg.asstOrgName = associatedOrgDetails.orgName;
        addOrg.asstOrgId = associatedOrgDetails.orgId;
      }
      if (isChildOrgChanged) {
        this.treeArray.push({ data: addOrg });
      } else {
        this.recordDetails.updatedUsers.push(addOrg);
        this.addRecords.push({ data: addOrg });
      }
    }
  }

  /****
   * Delete a record from the add or edit user form when we click on delete button
   @param org organization record that is to be deleted
   @param index the index value of the record to be deleted 
   */

  public deleteAssociatedOrg(org, index) {
    this.isUserRecordUpdated = true;
    if (this.formMode === 'edit') {
      var removeIndex = this.allRecords
        .map(function(item) {
          return item.data.id;
        })
        .indexOf(org.data.id);
      var recordDetailsId = this.recordDetails.updatedUsers
        .map(item => {
          return item.id;
        })
        .indexOf(org.data.id);
      if (removeIndex >= 0) {
        this.allRecords.splice(removeIndex, 1);
        this.recordDetails.updatedUsers.splice(removeIndex, 1);
        let delObj = { id: org.data.id };
        this.recordDetails.deletedUsers.push(delObj);
      }
    } else {
      if (index >= 0) {
        this.allRecords.splice(index, 1);
        this.recordDetails.updatedUsers.splice(index, 1);
        let delObj = { id: org.data.id };
        this.recordDetails.deletedUsers.push(delObj);
      }
    }
  }

  public dynamicUserId() {
    var date = new Date();
    return date.getUTCMilliseconds();
  }

  /****
   * Reset the records of the form.If its edit user form then reset to the existing
   * child records and if its add user empty the recors list.
   * @param resetValue contains empty list if the form is Add user.If its edit form
   * then contains the associated organizations data
   */

  public reset(resetValue) {
    if (this.isEditUser) {
      let x = JSON.parse(JSON.stringify(this.cloneaddRecords));
      this.allRecords = x;
      x.forEach(element => {
        this.recordDetails.updatedUsers.push(element.data);
      });
    } else {
      this.addRecords = [];
      this.recordDetails.updatedUsers = [];
      this.allRecords = [];
      this.poPrefix = '';
      this.selectedParentOrganization = '';
      this.selectedUser = {};
      this.user = [];
    }
  }

  /****
   * Action perfomed when one clicks on the save button of the form
   */

  public save() {
    this.formSubmit();
  }

  /****
   * Action perfomed when one clicks on the Add form button in the sales pad home screen
   @param nullValue conatins null value
   */

  public onAddUserClick(nullValue) {
    this.formMode = 'add';
    this.formHeader = 'Add User';
    this.isEditUser = false;
    this.addRecords = [];
    this.poPrefix = '';
    this.recordDetails.updatedUsers = [];
    this.recordDetails.deletedUsers = [];
    this.selectedParentOrganization = '';
    this.user = [];
    this.editUserObject = {};
    this.selectedUser = {};
    this.allRecords = [];
    this.reset(null);
    this.uiTreeData = [];
    this.isUserRecordUpdated = false;
    this.selectedAssociateOrganisations = [];
    let httpParams = new HttpParams().set('orgId', Constants.orgId);
    this.formLoadingMaskVisible = true;
    let getOrgsService: Observable<any>;
    let url;
    if (Constants.orgId === window['loginOrgId']) {
      getOrgsService = this.salesPadService.getOrgs(urls.getWdOrgsUrl);
    } else {
      url = urls.getOrgsUrl;
      getOrgsService = this.salesPadService.getOrgs(url, httpParams);
    }
    //  let temp_wd_url = '/assets/data/wdData.json';
    // this.salesPadService.getOrgs(temp_wd_url, httpParams)
    getOrgsService.subscribe(
      data => {
        var wdOrgs = [];
        if (data['status'] === 'success') {
          wdOrgs = data['Data'].orgs.filter(function(e) {
            return e.orgName.charAt(0) != 'z' && e.orgName.charAt(0) != 'Z';
          });
          this.uiTreeData = /* data['Data'].orgs */ JSON.parse(
            JSON.stringify(wdOrgs)
          );
          this.formLoadingMaskVisible = false;
        } else {
          console.error('response failed');
          this.formLoadingMaskVisible = false;
        }
      },
      error => {
        this.formLoadingMaskVisible = false;
        console.log(error);
      }
    );
  }

  /****
   * Action perfomed to set the radio button of active or inactive based on the
   * status of the child organization
   * @param radioElement radio button element(Active/Inactive)
   * @param status active or inactive(1/0) status
   */

  public getChecked(radioElement, status) {
    if (radioElement) {
      if (status == 1 && radioElement.value == 1) {
        return true;
      } else if (status == 1 && radioElement.value == 0) {
        return true;
      } else if (status == 0 && radioElement.value == 1) {
        return false;
      } else if (status == 0 && radioElement.value == 0) {
        return false;
      }
    }
  }

  /****
   * Action perfomed when one clicks on the edit button in the data table in sales pad
  @param editItem contains the organisation data i.e,orgName,orgId of the record where 
  edit button is clicked
  @param idEditUser tells whether the form is Edit user form or add user form
   */

  public editUser(editItem, idEditUser?) {
    this.editUserObject = editItem.data;
    this.selectedParentOrganization = '';
    this.responsePoPrifix = {};
    this.poPrefix = '';
    this.isEditUser = idEditUser;
    this.formHeader = 'Edit User';
    if (idEditUser) {
      this.formMode = 'edit';
      let orgId = editItem.data.orgId;
      let httpParams = new HttpParams().set('orgId', orgId);
      this.formLoadingMaskVisible = true;
      let poHttpParams = new HttpParams().set(
        'userId',
        this.editUserObject.userId
      );

      this.salesPadService
        .getPoPrefix(urls.getPoPrefixUrl, poHttpParams)
        .subscribe(res => {
          if (res['status'] === 'success') {
            this.responsePoPrifix = res['Data'];
            if (this.responsePoPrifix.attrValue !== undefined) {
              this.poPrefix = this.responsePoPrifix.attrValue;
            }
          }
        });
      this.salesPadService.getOrgs(urls.getOrgsUrl, httpParams).subscribe(
        data => {
          if (data['status'] === 'success') {
            this.uiTreeData = data['Data'].orgs;
            this.formLoadingMaskVisible = false;
          } else {
            console.error('Response Failed');

            this.formLoadingMaskVisible = false;
          }
        },
        error => {
          console.log(error);
          this.formLoadingMaskVisible = false;
        }
      );
      this.addRecords = [];
      this.recordDetails.updatedUsers = [];
      this.recordDetails.deletedUsers = [];
      editItem.children.forEach(ele => {
        let obj = {};
        obj = {
          data: {
            orgName: editItem.data.orgName,
            orgId: editItem.data.orgId,
            status: ele.data.status,
            screenName: editItem.data.screenName,
            userId: editItem.data.userId,
            asstOrgName: ele.data.childOrgName,
            asstOrgId: ele.data.childOrgId,
            id: ele.data.id
          }
        };
        this.addRecords.push(obj);
        // this.recordDetails.updatedUsers.push(obj['data']);
      });
      this.allRecords = [].concat(this.addRecords, this.treeArray);
      this.cloneaddRecords = JSON.parse(JSON.stringify(this.addRecords));
    }

    this.showAddUser();
    this.cdr.detectChanges();
  }

  /****
   * Get the name of the radio button as per the record in the form
   * @param formRecord individual record with screenName,userId,orgName,OrgId,asstOrgId,
   * associated orgName
   */

  public getRadioName(formRecord) {
    if (formRecord && formRecord.data && formRecord.data.length != undefined) {
      return formRecord.data[0].asstOrgName;
    } else {
      return formRecord.data.asstOrgName;
    }
  }

  /****
   * Set the radio button status to checked is the status value is 1
   * If the status is 0 then set the radio button to unchecked
   * @param orgData contains the records of the form.Each record contains data related selections made
   * in form
   */

  public getActiveChecked(orgData) {
    if (orgData && orgData.data && orgData.data.length != undefined) {
      return orgData.data[0].status;
    } else {
      return orgData.data.status;
    }
  }

  /****
   * Set the radio button status to checked is the status value is 0
   * If the status is 1 then set the radio button to unchecked
   * @param orgData contains the records of the form.Each record contains data related selections made
   * in form
   */

  public getInactiveChecked(orgData) {
    if (orgData && orgData.data && orgData.data.length != undefined) {
      return !orgData.data[0].status;
    } else {
      if (orgData.data.status === 1) {
        return 0;
      } else {
        return 1;
      }
    }
  }

  /****
   * Set the current user based upon the user selected from the users dropdown of the
   * add user form
   * @param user selected user from the users drop down
   */

  public onUserChange(user) {
    if (this.formMode == 'add') {
      this.currentUser = user;
    } else {
      this.currentUser = user;
    }
  }

  /****
   * When Save button of the form is clicked the list of updated and deleted records is
   * sent and the records in the sales pad data table are updated
   */

  public formSubmit() {
    // this.loadingMaskService.sendAppLoadMaskValue('show');
    // this.formLoadingMaskVisible = true;

    if (this.formMode == 'add') {
      if (
        this.recordDetails.updatedUsers != undefined && this.recordDetails.deletedUsers != undefined &&
        (this.recordDetails.updatedUsers.length > 0 || this.recordDetails.deletedUsers.length > 0)
      ) {
        this.formLoadingMaskVisible = true;

        this.salesPadService
          .updateUserData(urls.updateUsersDataUrl, this.recordDetails)
          .subscribe(
            data => {
              if (data['status']) {
                if (data['Data'].userUpdation != undefined) {
                  let resData = data['Data'].userUpdation.updatedRecords;
                  resData.forEach(ele => {
                    let i = this.recordDetails.updatedUsers.findIndex(
                      x => x.asstOrgId == ele.acctOrgId
                    );
                    if (i >= 0) {
                      this.recordDetails.updatedUsers[i].id = ele.id;
                    }
                  });
                  this.addOrganization.emit(this.recordDetails.updatedUsers);
                }
                this.formLoadingMaskVisible = false;
                this.close(null);
              } else {
                console.error('Response failed');
                this.formLoadingMaskVisible = false;
                this.close(null);
              }
              // this.loadingMaskService.sendAppLoadMaskValue('hide');
            },
            error => {
              // this.loadingMaskService.sendAppLoadMaskValue('hide');
              this.formLoadingMaskVisible = false;
              this.close(null);
              console.log(error);
            }
          );
      }
      if (
        this.poPrefix !== undefined &&
        this.poPrefix !== '' &&
        this.currentUser &&
        this.currentUser !== undefined
      ) {
        if (
          this.responsePoPrifix &&
          this.responsePoPrifix !== undefined &&
          this.responsePoPrifix.attrValue !== undefined
        ) {
          if (this.responsePoPrifix.attrValue !== this.poPrefix) {
            let httpParams;
            if (this.responsePoPrifix.id !== undefined) {
              httpParams = new HttpParams()
                .set('userId', this.currentUser.userId)
                .set('attrValue', this.poPrefix)
                .set('id', this.responsePoPrifix.id);
            } else {
              httpParams = new HttpParams()
                .set('userId', this.currentUser.userId)
                .set('attrValue', this.poPrefix)
                .set('id', '0');
            }
            // .set('id', this.responsePoPrifix.id);
            this.formLoadingMaskVisible = true;

            this.salesPadService
              .updateAttributeValue(urls.updateAttributeValueUrl, httpParams)
              .subscribe(
                data => {
                  this.formLoadingMaskVisible = false;
                },
                error => {
                  this.formLoadingMaskVisible = false;
                }
              );
            this.close(null);
          }
        }
        else {
          let httpParams;
          httpParams = new HttpParams()
            .set('userId', this.currentUser.userId)
            .set('attrValue', this.poPrefix)
            .set('id', '0');
          this.formLoadingMaskVisible = true;
          this.salesPadService
            .updateAttributeValue(urls.updateAttributeValueUrl, httpParams)
            .subscribe(
              data => {
                this.formLoadingMaskVisible = false;
              },
              error => {
                this.formLoadingMaskVisible = false;
              }
            );
          this.close(null);
        }
      }
     
    } else if (this.formMode == 'edit') {
      this.formLoadingMaskVisible = true;

      this.http;
      this.salesPadService
        .updateUserData(urls.updateUsersDataUrl, this.recordDetails)
        .subscribe(
          data => {
            if (data['status'] === 'success') {
              if (data['Data'].userUpdation) {
                let resData = data['Data'].userUpdation.updatedRecords;
                resData.forEach(ele => {
                  let i = this.recordDetails.updatedUsers.findIndex(
                    x => x.asstOrgId == ele.acctOrgId
                  );
                  if (i >= 0) {
                    this.recordDetails.updatedUsers[i].id = ele.id;
                  }
                });
              }
              this.updateOrganization.emit({
                data: this.recordDetails,
                index: this.tableRowIndex
              });
              delete this.tableRowIndex;
              this.formLoadingMaskVisible = false;
              this.close(null);
            } else {
              console.error('Response failed');

              this.formLoadingMaskVisible = false;
              this.close(null);
            }
            // this.loadingMaskService.sendAppLoadMaskValue('hide');
          },
          error => {
            // this.loadingMaskService.sendAppLoadMaskValue('hide');
            this.formLoadingMaskVisible = false;
            this.close(null);
            console.log(error);
          }
        );
      if (
        this.poPrefix !== undefined &&
        this.poPrefix !== '' &&
        this.editUserObject &&
        this.editUserObject !== undefined
      ) {
        let httpParams;

        if (
          this.responsePoPrifix !== undefined &&
          this.responsePoPrifix.attrValue !== undefined
        ) {
          if (this.responsePoPrifix.attrValue !== this.poPrefix) {
            if (this.responsePoPrifix.id !== undefined) {
              httpParams = new HttpParams()
                .set('userId', this.editUserObject.userId)
                .set('attrValue', this.poPrefix)
                .set('id', this.responsePoPrifix.id);
            } else {
              httpParams = new HttpParams()
                .set('userId', this.editUserObject.userId)
                .set('attrValue', this.poPrefix)
                .set('id', '0');
            }
            /* 
          TODO:Add the micro service with the httpParams as parameters
          */
            this.editUpdatePoPrifix(httpParams);
          }
        } else {
          httpParams = new HttpParams()
            .set('userId', this.editUserObject.userId)
            .set('attrValue', this.poPrefix)
            .set('id', '0');
          this.editUpdatePoPrifix(httpParams);
        }
      }
    }

    /* 
          TODO:Add the micro service with the httpParams as parameters
          */
    // }
    // this.loadingMaskService.sendAppLoadMaskValue('hide');
    // this.formLoadingMaskVisible = false;
  }

  private editUpdatePoPrifix(httpParams: any) {
    this.formLoadingMaskVisible = true;
    this.salesPadService
      .updateAttributeValue(urls.updateAttributeValueUrl, httpParams)
      .subscribe(data => {
        this.formLoadingMaskVisible = false;
      });
  }

  /****
   * This Action is performed when the one of the organizations is selected from the
   * organization drop down.Calls the getDetailsById url which returns the list of
   * users and list of child organisations based on the selected orgId
   * @param organization ornisation data of the organization selected from the
   * organisations drop down
   */

  orgListData(organization) {
    this.selectedUser = '';
    this.poPrefix = '';
    this.allRecords = [];
    this.currentOrg = organization;
    let orgId = organization.orgId;
    //this.reset(null);
    let httpParams = new HttpParams().set('orgId', orgId);
    this.formLoadingMaskVisible = true;
    this.salesPadService
      .getDetailsByOrgId(urls.getDetailsByOrgIdUrl, httpParams)
      .subscribe(
        data => {
          if (data['status'] === 'success') {
            let childData = data['Data'].allAsstOrgs;
            this.childOrganisationData = childData;
            this.user = data['Data'].allUsers;
            this.formLoadingMaskVisible = false;
          } else {
            console.log('failed');
            this.formLoadingMaskVisible = false;
          }
        },
        error => {
          this.formLoadingMaskVisible = false;
          console.log(error);
        }
      );
  }

  /****
   * Action performes when the child organization is selected.Adds records to the
   * existing records if there are any records or add to empty records array
   * i.e..,addRecords
   * @param selectedChildOrganization contains data of the selected child
   * organization of the associated child organizatons drop down
   */

  onChildOrganisationSelect(selectedChildOrganization) {
    this.isUserRecordUpdated = true;
    selectedChildOrganization.forEach(orgnisation => {
      let exists;
      if (this.addRecords.length > 0) {
        for (let i = 0; i < this.addRecords.length; i++) {
          if (
            orgnisation.orgId === this.addRecords[i].data.asstOrgId &&
            orgnisation.orgName === this.addRecords[i].data.asstOrgName
          ) {
            exists = true;
            break;
          } else {
            exists = false;
          }
        }
        if (!exists) {
          this.addAssociatedOrg(orgnisation, true);
        }
      } else {
        this.addAssociatedOrg(orgnisation, true);
      }
    });
    this.allRecords = [].concat(this.addRecords, this.treeArray);
    let updatedRecords = this.treeArray.map(ele => ele.data);
    this.recordDetails.updatedUsers = [...updatedRecords];
    this.treeArray = [];
  }

  /****
   * This is executed when the change event is fired when the radio button is clicked.
   * Sets value according to the radio button clicked
   * @param radioItem record of the clicked radio button
   * @param status defines Active or Inactive state(1,0 respectively)
   */

  public onStatusChange(radioItem, status) {
    if (status) {
      let addRecordsIndex = this.addRecords.findIndex(
        x => x.data.asstOrgId == radioItem.data.asstOrgId
      );
      if (addRecordsIndex >= 0) {
        if (this.addRecords[addRecordsIndex].data.initialStatus === undefined) {
          this.addRecords[addRecordsIndex].data['initialStatus'] =
            radioItem.data.status;
        }
        if (this.addRecords[addRecordsIndex].data.status !== status) {
          let ind = this.recordDetails.updatedUsers.findIndex(
            x => x.asstOrgId == radioItem.data.asstOrgId
          );
          if (ind >= 0) {
            if (
              status !== this.addRecords[addRecordsIndex].data['initialStatus']
            ) {
              this.recordDetails.updatedUsers[ind].status = status;
            } else {
              this.recordDetails.updatedUsers.splice(ind, 1);
            }
          } else {
            this.recordDetails.updatedUsers.push(radioItem.data);
          }
        } else {
          let foundIndex = this.recordDetails.updatedUsers.findIndex(
            x => x.asstOrgId == radioItem.data.asstOrgId
          );
          if (foundIndex >= 0) {
            this.recordDetails.updatedUsers.splice(foundIndex, 1);
          }
        }
      }
      if (this.recordDetails.updatedUsers !== undefined) {
        let index = this.recordDetails.updatedUsers.findIndex(
          x => x.asstOrgId == radioItem.data.asstOrgId
        );
        if (index >= 0) {
          this.recordDetails.updatedUsers[index].status = 1;
          radioItem.data.status = 1;
        }
      }
    } else {
      let addRecordsIndex = this.addRecords.findIndex(
        x => x.data.asstOrgId == radioItem.data.asstOrgId
      );
      if (addRecordsIndex >= 0) {
        if (this.addRecords[addRecordsIndex].data.initialStatus === undefined) {
          this.addRecords[addRecordsIndex].data['initialStatus'] =
            radioItem.data.status;
        }
        if (this.addRecords[addRecordsIndex].data.status !== status) {
          let ind = this.recordDetails.updatedUsers.findIndex(
            x => x.asstOrgId == radioItem.data.asstOrgId
          );
          if (ind >= 0) {
            if (
              status !== this.addRecords[addRecordsIndex].data['initialStatus']
            ) {
              this.recordDetails.updatedUsers[ind].status = status;
            } else {
              this.recordDetails.updatedUsers.splice(ind, 1);
            }
          } else {
            this.recordDetails.updatedUsers.push(radioItem.data);
          }
          // this.recordDetails.updatedUsers.push(radioItem.data);
        } else {
          let foundIndex = this.recordDetails.updatedUsers.findIndex(
            x => x.assrOrgId == radioItem.data.asstOrgId
          );
          if (foundIndex >= 0) {
            this.recordDetails.updatedUsers.splice(foundIndex, 1);
          }
        }
      }
      if (this.recordDetails.updatedUsers !== undefined) {
        let index = this.recordDetails.updatedUsers.findIndex(
          x => x.asstOrgId == radioItem.data.asstOrgId
        );
        if (index >= 0) {
          this.recordDetails.updatedUsers[index].status = 0;
          radioItem.data.status = 0;
        }
      }
    }
    this.isUserRecordUpdated = true;
  }

  /****
   * This is called when the user is selected from the users drop down.In this method
   * api request is made to get the child organisations if there are any for the
   * selected user
   * @param selectedUser user selected from the user drop down
   */

  onUserClick(selectedUser) {
    let httpParams = new HttpParams().set('userId', selectedUser.userId);
    if (this.isUserRecordUpdated) {
      this.confirmationService.confirm({
        message:
          'All the records of the currently selected user will be removed. Do you want to continue?',
        accept: () => {
          this.getUserData(selectedUser);
          this.getPoPrefixData(httpParams);
          //  this.getUserData(selectedUser);
          this.isUserRecordUpdated = false;
        },
        reject: () => {
          //  this.getUserData(selectedUser);
          if (this.allRecords && this.allRecords.length > 0) {
            if (this.allRecords[0].data.screenName != selectedUser.screenName) {
              this.selectedUser = this.allRecords[0].data;
              this.getUserData(this.selectedUser);
              this.isUserRecordUpdated = false;
            }
          }
        }
      });
    } else {
      this.getUserData(selectedUser);
      this.getPoPrefixData(httpParams);
    }
    this.cdr.detectChanges();
  }

  private getPoPrefixData(httpParams: HttpParams) {
    this.salesPadService
      .getPoPrefix(urls.getPoPrefixUrl, httpParams)
      .subscribe(res => {
        if (res['status'] === 'success') {
          this.responsePoPrifix = res['Data'];
          if (this.responsePoPrifix.attrValue !== undefined) {
            this.poPrefix = this.responsePoPrifix.attrValue;
          }else{
            this.poPrefix = "";
          }
        }
      });
  }

  private getUserData(selectedUser: any) {
    let id = selectedUser.userId;
    let httpParams = new HttpParams().set('userId', id);
    this.formLoadingMaskVisible = true;
    this.salesPadService
      .getRecordsByUser(urls.getRecordsByUserUrl, httpParams)
      .subscribe(
        res => {
          if (res['status'] === 'success') {
            if (res && res['Data'] && res['Data'].records !== undefined) {
              const arr = [...res['Data'].records];
              //this.recordDetails.updatedUsers = [...arr];
              let a = [];
              let obj = { data: {} };
              for (let i = 0; i < arr.length; i++) {
                obj = { data: {} };
                obj.data = arr[i];
                a.push(obj);
              }
              this.addRecords = [...a];
              this.allRecords = [].concat(this.addRecords, this.treeArray);
            } else if (res && res['Data']) {
              this.addRecords = [];
              this.allRecords = [];
            }
            this.formLoadingMaskVisible = false;
          } else {
            console.log('failed');
            this.formLoadingMaskVisible = false;
          }
        },
        error => {
          this.formLoadingMaskVisible = false;
          console.log(error);
        }
      );
  }
  search(event) {
    this.filterUsers = [];
    for (let i = 0; i < this.user.length; i++) {
      let brand = this.user[i];
      if (
        brand.screenName.toLowerCase().indexOf(event.query.toLowerCase()) == 0
      ) {
        this.filterUsers.push(brand);
      }
    }
  }
  saveDisabled() {
    if (
      this.recordDetails.updatedUsers != undefined &&
      this.recordDetails.updatedUsers.length > 0
    ) {
      return false;
    } else if (
      this.recordDetails.deletedUsers != undefined &&
      this.recordDetails.deletedUsers.length > 0
    ) {
      return false;
    } else if (this.poPrefix !== undefined && this.poPrefix !== '') {
      if (this.formMode === 'add') {
        if (this.currentUser && this.currentUser !== undefined) {
          return this.poPrefixButtonDisable();
        }
      } else if (this.formMode === 'edit') {
        if (this.editUserObject && this.editUserObject !== undefined) {
          return this.poPrefixButtonDisable();
        }
      }
    } else {
      return true;
    }
  }
  poPrefixButtonDisable() {
    if (this.responsePoPrifix.attrValue !== undefined) {
      if (this.poPrefix === this.responsePoPrifix.attrValue) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
