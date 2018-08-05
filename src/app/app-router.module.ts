import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddUserComponent } from './add-user/add-user.component';
import { AppComponent } from './app.component';

const routes: Routes = [
    { path: '', component: AppComponent },
    { path: 'adduser', component: AddUserComponent }
];

export const AppRouting: ModuleWithProviders = RouterModule.forChild(routes);