import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public showLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // loadingSub: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // loadingMap: Map<string, boolean> = new Map<string, boolean>();
  private loadingBarCount = 0;
  public loadingBar$ = new BehaviorSubject<boolean>(false); 
  constructor() {
  }

  getLoader(): Observable<boolean> {
    return this.showLoader.asObservable();
  }

  show() {
    this.showLoader.next(true);
  }

  hide() {
    this.showLoader.next(false);
  }

  // setLoading(loading: boolean, url: string): void {
  //   if (!url) {
  //     throw new Error('The request URL must be provided to the LoadingService.setLoading function');
  //   }
  //   if (loading === true) {
  //     this.loadingMap.set(url, loading);
  //     this.loadingSub.next(true);
  //   }else if (loading === false && this.loadingMap.has(url)) {
  //     this.loadingMap.delete(url);
  //   }
  //   if (this.loadingMap.size === 0) {
  //     this.loadingSub.next(false);
  //   }
  // }
  setLoadingBarState(loading: boolean) {
    this.loadingBarCount += loading ? 1 : -1;
    this.loadingBar$.next(this.loadingBarCount > 0);
  }
}
