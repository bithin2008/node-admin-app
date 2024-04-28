import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private receivedUserData: BehaviorSubject<object> = new BehaviorSubject<object>({});
  sharedUserData$ = this.receivedUserData.asObservable();

  private receivedSubmoduleDetails: BehaviorSubject<object> = new BehaviorSubject<object>({});
  sharedSubmoduleDetails$ = this.receivedSubmoduleDetails.asObservable();

  constructor() { }

  updateUserData(data: any) {
    this.receivedUserData.next(data)
  }

  updateSubmoduleDetails(data: any) {
    this.receivedSubmoduleDetails.next(data)
  }
}
