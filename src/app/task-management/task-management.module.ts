import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskManagementRoutingModule } from './task-management-routing.module';
import { TaskListComponent } from './task-list/task-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from "../@shared/shared.module";
import { PrimeNgModule } from '../prime-ng.module';

@NgModule({
  declarations: [
    TaskListComponent
  ],
  imports: [
    CommonModule,
    TaskManagementRoutingModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
    PrimeNgModule,
  ]
})
export class TaskManagementModule { }
