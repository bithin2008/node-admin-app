import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsPriorityComponent } from './claims-priority.component';

describe('ClaimsPriorityComponent', () => {
  let component: ClaimsPriorityComponent;
  let fixture: ComponentFixture<ClaimsPriorityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimsPriorityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
