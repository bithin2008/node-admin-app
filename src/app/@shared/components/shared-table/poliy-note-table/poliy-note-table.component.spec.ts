import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliyNoteTableComponent } from './poliy-note-table.component';

describe('PoliyNoteTableComponent', () => {
  let component: PoliyNoteTableComponent;
  let fixture: ComponentFixture<PoliyNoteTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoliyNoteTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliyNoteTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
