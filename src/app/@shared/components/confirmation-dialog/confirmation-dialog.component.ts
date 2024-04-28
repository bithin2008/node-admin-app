import { Component, Input, OnInit,AfterViewInit  } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent implements OnInit {
  onClose: Subject<boolean> | undefined;
  modalRef?: BsModalRef | null;
  title: string | undefined;
  message: string | undefined;
  btnOkText: string | undefined;
  btnCancelText: string | undefined;

  constructor(private confrmSvc: ConfirmationDialogService) { }

  ngOnInit() { 
    this.onClose = new Subject(); 
  }

  public confirm() {
    this.onClose?.next(true);
    this.confrmSvc.modalRef?.hide();
  }

  public decline() {
    this.onClose?.next(false)
    this.confrmSvc.modalRef?.hide();
  }
}
