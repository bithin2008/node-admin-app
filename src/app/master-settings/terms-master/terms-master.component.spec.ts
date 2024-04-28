import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsMasterComponent } from './terms-master.component';

describe('TermsMasterComponent', () => {
  let component: TermsMasterComponent;
  let fixture: ComponentFixture<TermsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
