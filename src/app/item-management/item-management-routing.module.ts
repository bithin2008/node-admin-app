import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemManagementComponent } from './item-management.component';
import { AddEditItemComponent } from './add-edit-item/add-edit-item.component';

const routes: Routes = [
  { path: '', component:ItemManagementComponent },
  { path: 'add-item',  component: AddEditItemComponent },
  { path: 'edit-item/:item_id',  component: AddEditItemComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemManagementRoutingModule { }
