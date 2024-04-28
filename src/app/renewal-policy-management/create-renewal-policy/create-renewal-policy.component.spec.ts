import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRenewalPolicyComponent } from './create-renewal-policy.component';

describe('CreateRenewalPolicyComponent', () => {
  let component: CreateRenewalPolicyComponent;
  let fixture: ComponentFixture<CreateRenewalPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateRenewalPolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRenewalPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
