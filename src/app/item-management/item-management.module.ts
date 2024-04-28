import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemManagementRoutingModule } from './item-management-routing.module';
import { ItemManagementComponent } from './item-management.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../@shared/shared.module';
import { PrimeNgModule } from '../prime-ng.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AddEditItemComponent } from './add-edit-item/add-edit-item.component';

@NgModule({
  declarations: [
    ItemManagementComponent,
    AddEditItemComponent
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    BsDatepickerModule,
    SharedModule,
    ItemManagementRoutingModule,
    BsDropdownModule.forRoot()
  ]
})
export class ItemManagementModule { }
