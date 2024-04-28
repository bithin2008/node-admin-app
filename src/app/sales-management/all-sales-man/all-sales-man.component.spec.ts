import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSalesManComponent } from './all-sales-man.component';

describe('AllSalesManComponent', () => {
  let component: AllSalesManComponent;
  let fixture: ComponentFixture<AllSalesManComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllSalesManComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSalesManComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
