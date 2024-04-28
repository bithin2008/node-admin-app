import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthLayoutComponent } from './auth-layout.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ForgotPasswordFormComponent } from './forgot-password-form/forgot-password-form.component';
import { ResetPasswordFormComponent } from './reset-password-form/reset-password-form.component';
import { SharedModule } from '../@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidateOtpComponent } from './validate-otp/validate-otp.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { UserActivationComponent } from './user-activation/user-activation.component';
import { SystemAdminLoginComponent } from './system-admin-login/system-admin-login.component';
import { SystemAdminForgotPasswordFormComponent } from './system-admin-forgot-password-form/system-admin-forgot-password-form.component';
import { ValidateSystemAdminOtpComponent } from './validate-system-admin-otp/validate-system-admin-otp.component';
import { SystemAdminResetPasswordComponent } from './system-admin-reset-password/system-admin-reset-password.component';
import { CountdownModule } from 'ngx-countdown';
@NgModule({
  declarations: [
    AuthLayoutComponent,
    ValidateSystemAdminOtpComponent,
    SystemAdminForgotPasswordFormComponent,
    LoginFormComponent,
    ForgotPasswordFormComponent,
    ResetPasswordFormComponent,
    ValidateOtpComponent,
    UserActivationComponent,
    SystemAdminLoginComponent,
    SystemAdminResetPasswordComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    CountdownModule,
    
  ]
})
export class AuthModule { }
