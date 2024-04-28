import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyThankYouComponent } from './policy-thank-you.component';

describe('PolicyThankYouComponent', () => {
  let component: PolicyThankYouComponent;
  let fixture: ComponentFixture<PolicyThankYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyThankYouComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyThankYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
