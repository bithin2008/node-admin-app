import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SplashScreenRoutingModule } from './splash-screen-routing.module';
import { SplashScreenComponent } from './splash-screen.component';


@NgModule({
  declarations: [
    SplashScreenComponent
  ],
  imports: [
    CommonModule,
    SplashScreenRoutingModule
  ]
})
export class SplashScreenModule { }
