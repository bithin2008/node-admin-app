import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from './directives/highlight.directive';
import { CheckCapsLockDirective } from './directives/check-caps-lock.directive';
import { ExponentialStrengthPipe } from './pipes/exponential-strength.pipe';
import { MaskPipe } from './pipes/mask.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DefaultLayoutComponent } from './components/layouts/default-layout/default-layout.component';
import { UnauthenticatedLayoutComponent } from './components/layouts/unauthenticated-layout/unauthenticated-layout.component';
import { AuthenticatedLayoutComponent } from './components/layouts/authenticated-layout/authenticated-layout.component';
import { ValidationErrorComponent } from './components/validation-error/validation-error.component';
import { AlertMessageComponent } from './components/alert-message/alert-message.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoaderComponent } from './components/loader/loader.component';
import { UiButtonComponent } from './components/ui-button/ui-button.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { StatusIndicatorDirective } from './directives/status-indicator.directive';
import { ThemeSwitchComponent } from './component/theme-switch/theme-switch.component';
import { IconComponent } from './components/icon/icon.component';
//import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { PrimeNgModule } from '../prime-ng.module';
import { SystemAuthenticatedLayoutComponent } from './components/layouts/system-authenticated-layout/system-authenticated-layout.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from '../@core/services/confirmation-dialog.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule,BsModalService } from 'ngx-bootstrap/modal';
import { PhoneUsFormatPipe } from './pipes/phone-us-format.pipe';
import { ImageCropperWrapperComponent } from './components/image-cropper-wrapper/image-cropper-wrapper.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DuplicateValueCheckComponent } from './components/duplicate-value-check/duplicate-value-check.component';
import { PasswordStrengthComponent } from './components/password-strength/password-strength.component';
import { PositiveNumberDirective } from './directives/positive-number.directive';
import { CapitalizeDirective } from './directives/capitalize/capitalize.directive';
import { InputLimitDirective } from './directives/input-limit/input-limit.directive';
import { CardExpiryDateDirective } from './directives/card-expiry-date/card-expiry-date.directive';
import { CardFormatterDirective } from './directives/card-formatter/card-formatter.directive';
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ClaimTableComponent } from './components/shared-table/claim-table/claim-table.component';
import { ClaimNoteTableComponent } from './components/shared-table/claim-note-table/claim-note-table.component';
import { PoliyNoteTableComponent } from './components/shared-table/poliy-note-table/poliy-note-table.component';
import { AutoCompleteSearchComponent } from './components/auto-complete-search/auto-complete-search.component';
import { AssignedContractorsJobTableComponent } from './components/shared-table/assigned-contractors-job-table/assigned-contractors-job-table.component';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

const data = [
  HighlightDirective,
  ExponentialStrengthPipe,
  MaskPipe,
  OrderByPipe,
  CheckCapsLockDirective,
  HeaderComponent,
  FooterComponent,
  ValidationErrorComponent,
  DefaultLayoutComponent,
  UnauthenticatedLayoutComponent,
  AuthenticatedLayoutComponent,
  SystemAuthenticatedLayoutComponent,
  AlertMessageComponent,
  SidebarComponent,
  LoaderComponent,
  UiButtonComponent,
  SearchInputComponent,
  FileUploadComponent,
  StatusIndicatorDirective,
  ThemeSwitchComponent,
  IconComponent,
  //CookieConsentComponent,
  ScrollToTopComponent,
  PhoneUsFormatPipe,
  ImageCropperWrapperComponent,
  DuplicateValueCheckComponent,
  PasswordStrengthComponent,
  PositiveNumberDirective,
  CapitalizeDirective,
  InputLimitDirective,
  CardExpiryDateDirective,
  CardFormatterDirective,
  AdvancedSearchComponent,
  ClaimTableComponent,
  ClaimNoteTableComponent,
  PoliyNoteTableComponent,
  AutoCompleteSearchComponent,
  AssignedContractorsJobTableComponent,

  // NgxBootstrapConfirmModalComponent
];

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimeNgModule,
    PerfectScrollbarModule,
    ModalModule,
    BsDropdownModule.forRoot(),
    ImageCropperModule,
    BsDatepickerModule,
    AutocompleteLibModule,
    LoadingBarHttpClientModule,

  ],
  declarations: [
    ...data,
     
  ],
  providers:[ConfirmationDialogService,BsModalService ],
  exports: [
    ...data
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {
}
