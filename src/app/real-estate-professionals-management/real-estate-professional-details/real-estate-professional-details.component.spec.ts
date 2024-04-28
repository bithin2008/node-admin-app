import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealEstateProfessionalDetailsComponent } from './real-estate-professional-details.component';

describe('RealEstateProfessionalDetailsComponent', () => {
  let component: RealEstateProfessionalDetailsComponent;
  let fixture: ComponentFixture<RealEstateProfessionalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RealEstateProfessionalDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealEstateProfessionalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
