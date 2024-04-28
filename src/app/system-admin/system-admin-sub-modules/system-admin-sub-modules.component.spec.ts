import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAdminSubModulesComponent } from './system-admin-sub-modules.component';

describe('SystemAdminSubModulesComponent', () => {
  let component: SystemAdminSubModulesComponent;
  let fixture: ComponentFixture<SystemAdminSubModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemAdminSubModulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemAdminSubModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
