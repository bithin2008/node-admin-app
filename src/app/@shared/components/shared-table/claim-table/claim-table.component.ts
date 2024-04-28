import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-claim-table',
  templateUrl: './claim-table.component.html',
  styleUrls: ['./claim-table.component.scss']
})
export class ClaimTableComponent {
  @Input() headers: any[] = [];
  @Input() data: any[][] = [];

}
