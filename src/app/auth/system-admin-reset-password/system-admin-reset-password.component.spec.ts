import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAdminResetPasswordComponent } from './system-admin-reset-password.component';

describe('SystemAdminResetPasswordComponent', () => {
  let component: SystemAdminResetPasswordComponent;
  let fixture: ComponentFixture<SystemAdminResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemAdminResetPasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemAdminResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
