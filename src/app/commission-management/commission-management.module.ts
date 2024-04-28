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
import { CommissionManagementRoutingModule } from './commission-management-routing.module';
import { ComissionMasterSettingsComponent } from './comission-master-settings/comission-master-settings.component';
import { ManageSalesCommissionComponent } from './manage-sales-commission/manage-sales-commission.component';



@NgModule({
  declarations: [
    ComissionMasterSettingsComponent,
    ManageSalesCommissionComponent
  ],
  imports: [
    CommissionManagementRoutingModule,
    CommonModule,
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
export class CommissionManagementModule { }
