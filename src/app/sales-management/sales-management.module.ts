import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../@shared/shared.module';
import { ConfirmationDialogService } from '../@core/services/confirmation-dialog.service';
import { PrimeNgModule } from '../prime-ng.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SalesManagementRoutingModule } from './sales-management-routing.module';
import { AllSalesManComponent } from './all-sales-man/all-sales-man.component';
import { SalesManDetailsComponent } from './sales-man-details/sales-man-details.component';


@NgModule({
  declarations: [AllSalesManComponent,SalesManDetailsComponent],
  imports: [
    CommonModule,
    SalesManagementRoutingModule,
    PrimeNgModule,
    SharedModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxDatatableModule,
    BsDatepickerModule,
    FormsModule 
  ]
})
export class SalesManagementModule { }
