import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageSeoRoutingModule } from './page-seo-routing.module';
import { PageSeoManagementComponent } from './page-seo-management/page-seo-management.component';
import { SharedModule } from '../@shared/shared.module';
import { PrimeNgModule } from '../prime-ng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    PageSeoManagementComponent
  ],
  imports: [
    CommonModule,
    PageSeoRoutingModule,
    CommonModule,
    PrimeNgModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PageSeoModule { }
