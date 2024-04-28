import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-claim-note-table',
  templateUrl: './claim-note-table.component.html',
  styleUrls: ['./claim-note-table.component.scss']
})
export class ClaimNoteTableComponent {
  @Input() tableHeaderData: any[] = [];
  @Input() tableBodyData: any[] = [];
}
