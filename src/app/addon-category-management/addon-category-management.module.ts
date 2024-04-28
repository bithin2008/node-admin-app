import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddonCategoryManagementRoutingModule } from './addon-category-management-routing.module';
import { AddonCategoryManagementComponent } from './addon-category-management.component';






import { RouterModule } from '@angular/router';
import { SharedModule } from '../@shared/shared.module';
import { PrimeNgModule } from '../prime-ng.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AddEditAddonCategoryComponent } from './add-edit-addon-category/add-edit-addon-category.component';


@NgModule({
  declarations: [
    AddonCategoryManagementComponent,
    AddEditAddonCategoryComponent
  ],
  imports: [
    CommonModule,
    AddonCategoryManagementRoutingModule,
    PrimeNgModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    BsDatepickerModule,
    SharedModule,
    BsDropdownModule.forRoot()
  ]
})
export class AddonCategoryManagementModule { }
