import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonCategoryManagementComponent } from './addon-category-management.component';

describe('AddonCategoryManagementComponent', () => {
  let component: AddonCategoryManagementComponent;
  let fixture: ComponentFixture<AddonCategoryManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddonCategoryManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddonCategoryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
