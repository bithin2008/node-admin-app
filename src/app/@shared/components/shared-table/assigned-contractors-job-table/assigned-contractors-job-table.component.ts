import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-assigned-contractors-job-table',
  templateUrl: './assigned-contractors-job-table.component.html',
  styleUrls: ['./assigned-contractors-job-table.component.scss']
})
export class AssignedContractorsJobTableComponent {
  @Input() tableHeaderData: any[] = [];
  @Input() tableBodyData: any[] = [];

}
