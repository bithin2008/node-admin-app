import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCallFeeComponent } from './service-call-fee.component';

describe('ServiceCallFeeComponent', () => {
  let component: ServiceCallFeeComponent;
  let fixture: ComponentFixture<ServiceCallFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceCallFeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceCallFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
