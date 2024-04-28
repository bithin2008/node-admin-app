import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAdminLoginComponent } from './system-admin-login.component';

describe('SystemAdminLoginComponent', () => {
  let component: SystemAdminLoginComponent;
  let fixture: ComponentFixture<SystemAdminLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemAdminLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemAdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
