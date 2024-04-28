import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { SharedModule } from "../@shared/shared.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';

@NgModule({
    declarations: [
        ProfileComponent,
    ],
    imports: [
        CommonModule,
        ProfileRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        BsDatepickerModule,
    ],
})
export class ProfileModule { }
