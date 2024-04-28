import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimNoteTableComponent } from './claim-note-table.component';

describe('ClaimNoteTableComponent', () => {
  let component: ClaimNoteTableComponent;
  let fixture: ComponentFixture<ClaimNoteTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimNoteTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimNoteTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
