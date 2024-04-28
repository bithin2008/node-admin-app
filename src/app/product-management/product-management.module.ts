import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductManagementRoutingModule } from './product-management-routing.module';
import { ProductComponent } from './product/product.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../@shared/shared.module';
import { ConfirmationDialogService } from '../@core/services/confirmation-dialog.service';
import { PrimeNgModule } from '../prime-ng.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ProductProblemsComponent } from './product-problems/product-problems.component';

@NgModule({
  declarations: [
    ProductComponent,
    ProductProblemsComponent
  ],
  imports: [
    CommonModule,
    ProductManagementRoutingModule,
    PrimeNgModule,
    SharedModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxDatatableModule,
    BsDatepickerModule
  ],
  providers: [ConfirmationDialogService]
})
export class ProductManagementModule { }
