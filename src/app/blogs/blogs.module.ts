import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogsRoutingModule } from './blogs-routing.module';
import { BlogsComponent } from './blogs.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../@shared/shared.module';
import { ConfirmationDialogService } from '../@core/services/confirmation-dialog.service';
import { PrimeNgModule } from '../prime-ng.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { EditorModule } from '@tinymce/tinymce-angular';


@NgModule({
  declarations: [
    BlogsComponent
  ],
  imports: [
    CommonModule,
    BlogsRoutingModule,
    PrimeNgModule,
    SharedModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxDatatableModule,
    BsDatepickerModule,
    FormsModule,
    EditorModule,
  ]
})
export class BlogsModule { }
