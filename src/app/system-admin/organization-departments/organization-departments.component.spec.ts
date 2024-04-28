import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationDepartmentsComponent } from './organization-departments.component';

describe('OrganizationDepartmentsComponent', () => {
  let component: OrganizationDepartmentsComponent;
  let fixture: ComponentFixture<OrganizationDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationDepartmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
