import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedContractorsJobTableComponent } from './assigned-contractors-job-table.component';

describe('AssignedContractorsJobTableComponent', () => {
  let component: AssignedContractorsJobTableComponent;
  let fixture: ComponentFixture<AssignedContractorsJobTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignedContractorsJobTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedContractorsJobTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
