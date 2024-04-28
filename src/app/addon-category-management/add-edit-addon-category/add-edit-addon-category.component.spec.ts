import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAddonCategoryComponent } from './add-edit-addon-category.component';

describe('AddEditAddonCategoryComponent', () => {
  let component: AddEditAddonCategoryComponent;
  let fixture: ComponentFixture<AddEditAddonCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAddonCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAddonCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
