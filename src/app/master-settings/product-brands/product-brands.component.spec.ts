import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBrandsComponent } from './product-brands.component';

describe('ProductBrandsComponent', () => {
  let component: ProductBrandsComponent;
  let fixture: ComponentFixture<ProductBrandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductBrandsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBrandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
