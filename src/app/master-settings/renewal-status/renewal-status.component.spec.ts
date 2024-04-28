import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalStatusComponent } from './renewal-status.component';

describe('RenewalStatusComponent', () => {
  let component: RenewalStatusComponent;
  let fixture: ComponentFixture<RenewalStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenewalStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
