import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AffiliatesListComponent } from './affiliates-list/affiliates-list.component';

const routes: Routes = [
  { path: '', component:AffiliatesListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AffiliatesManagementRoutingModule { }
