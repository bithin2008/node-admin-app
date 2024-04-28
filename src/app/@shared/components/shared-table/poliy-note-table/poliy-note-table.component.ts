import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-poliy-note-table',
  templateUrl: './poliy-note-table.component.html',
  styleUrls: ['./poliy-note-table.component.scss']
})
export class PoliyNoteTableComponent {
  @Output() copyToClipBoardEvent = new EventEmitter<string>();
  @Input() tableHeaderData: any[] = [];
  @Input() tableBodyData: any[] = [];


  constructor(
    private router: Router,
  ) {}
  copyToClipBoard(item:any){
      this.copyToClipBoardEvent.emit(item);
  }

  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }
}
