import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductProblemsComponent } from './product-problems.component';

describe('ProductProblemsComponent', () => {
  let component: ProductProblemsComponent;
  let fixture: ComponentFixture<ProductProblemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductProblemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductProblemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
