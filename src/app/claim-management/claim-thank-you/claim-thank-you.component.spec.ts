import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimThankYouComponent } from './claim-thank-you.component';

describe('ClaimThankYouComponent', () => {
  let component: ClaimThankYouComponent;
  let fixture: ComponentFixture<ClaimThankYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimThankYouComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimThankYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
