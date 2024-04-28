import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertySizeComponent } from './property-size.component';

describe('PropertySizeComponent', () => {
  let component: PropertySizeComponent;
  let fixture: ComponentFixture<PropertySizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertySizeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertySizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
