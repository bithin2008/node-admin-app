import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimStatusComponent } from './claim-status.component';

describe('ClaimStatusComponent', () => {
  let component: ClaimStatusComponent;
  let fixture: ComponentFixture<ClaimStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
