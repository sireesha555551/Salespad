import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideModule } from 'ng-click-outside';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  ButtonModule,
  DataTableModule,
  SharedModule,
  RadioButtonModule,
  TreeTableModule,
  TreeNode,
  PaginatorModule,
  OverlayPanelModule,
  DialogModule,
  DropdownModule,
  InputTextModule,
  MessagesModule,
  GrowlModule,
  TreeModule,
  ProgressSpinnerModule,
  BlockUIModule,
  PanelModule,
  AutoCompleteModule
} from 'primeng/primeng';
import { AssociatedOrgDropdownComponent} from './associated-org-dropdown/associated-org-dropdown.component'
import { AssociatedOrgListComponent } from './associated-org-list/associated-org-list.component'
import { AddUserComponent } from './add-user/add-user.component';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { OrganisationListComponent } from './organisation-list/organisation-list.component';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';
// import { ConstantsService } from './services/constants/constants.service';

import { SalesPadDataService } from './services/sales-pad-data/sales-pad-data.service';
// import { PtreeDropdownComponent } from './ptree-dropdown/ptree-dropdown.component';
import { SalesPadLoading } from './services/loading-mask/sales-pad-loading.service';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { AppRouting } from './app-router.module';
import { AppComponent } from './app.component';
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRouting,
    ButtonModule,
    DataTableModule,
    SharedModule,
    RadioButtonModule,
    TreeTableModule,
    PaginatorModule,
    OverlayPanelModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    HttpClientModule,
    FlexLayoutModule,
    FormsModule,
    MessagesModule,
    GrowlModule,
    ClickOutsideModule,
    TreeModule,
    ProgressSpinnerModule,
    BlockUIModule,
    PanelModule,
    AutoCompleteModule,
    ConfirmDialogModule
  ],
  declarations: [
    AppComponent,
    AddUserComponent,
    TreeViewComponent,
    OrganisationListComponent,
    // PtreeDropdownComponent,
    AssociatedOrgListComponent,
    AssociatedOrgDropdownComponent
  ],
  exports: [AppComponent],
  providers: [
    MessageService,
    // ConstantsService,
    SalesPadDataService,
    SalesPadLoading,
    ConfirmationService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
