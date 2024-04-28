import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimTableComponent } from './claim-table.component';

describe('ClaimTableComponent', () => {
  let component: ClaimTableComponent;
  let fixture: ComponentFixture<ClaimTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
