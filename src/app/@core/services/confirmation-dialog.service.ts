import { Injectable } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ConfirmationDialogComponent } from 'src/app/@shared/components/confirmation-dialog/confirmation-dialog.component';



@Injectable()
export class ConfirmationDialogService {
  modalRef?: BsModalRef | null;
  confirmResolve?: () => void;
  confirmReject?: () => void;
  confirmPromise?: Promise<void>;
  constructor(private modalSvc: BsModalService) { }

  confirm(
    title: string,
    message: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancel',
    dialogSize: string = 'sm'): Promise<any> {
    return new Promise((resolve, reject) => {
      const initialState: ModalOptions = {
        initialState: {
          title: title,
          message: message,
          btnOkText: btnOkText ? btnOkText : 'OK',
          btnCancelText: btnCancelText ? btnCancelText : 'Cancel',
          class: dialogSize == 'sm' ? 'modal-sm' : 'modal-lg',
        },
       
      };

      this.modalRef = this.modalSvc.show(ConfirmationDialogComponent, initialState);
      this.modalRef.content.onClose.subscribe((result: any) => {     
        resolve(result);
      })
    });

  }

}
