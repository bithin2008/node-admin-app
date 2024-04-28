import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingPeriodsComponent } from './holding-periods.component';

describe('HoldingPeriodsComponent', () => {
  let component: HoldingPeriodsComponent;
  let fixture: ComponentFixture<HoldingPeriodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldingPeriodsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldingPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
