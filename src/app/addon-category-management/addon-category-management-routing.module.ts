import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddonCategoryManagementComponent } from './addon-category-management.component';
import { AddEditAddonCategoryComponent } from './add-edit-addon-category/add-edit-addon-category.component';

const routes: Routes = [
  { path: '', component:AddonCategoryManagementComponent },
  { path: 'add-addon-category',  component: AddEditAddonCategoryComponent },
  { path: 'edit-addon-category/:addon_category_id',  component: AddEditAddonCategoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddonCategoryManagementRoutingModule { }
