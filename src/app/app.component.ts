import { Component, VERSION, OnInit } from '@angular/core';
import { Router, Event, NavigationStart, NavigationCancel, NavigationEnd, NavigationError, RoutesRecognized } from '@angular/router';
import { LoaderService } from './@core/services/loader.service';
import { Meta, Title } from "@angular/platform-browser";
import { AppConfig } from './@utils/const/app.config';
import { filter, map } from 'rxjs';
import { pairwise } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  version = VERSION;
  status: boolean = false;
  previousURL: any = '';
  currentURL: any = '';
  constructor(
    private router: Router,
    private loader: LoaderService,
    private titleService: Title,
    private meta: Meta
  ) {
    //this.titleService.setTitle('MyApp - Angular');

    router.events
      .pipe(
        filter(evt => evt instanceof NavigationError),
        map(evt => evt as NavigationError)
      )
      .subscribe(evt => {
        if (evt.error instanceof Error && evt.error.name == 'ChunkLoadError') {
          window.location.assign(evt.url);
        }
      });

    this.router.events
      .pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
      .subscribe(async (events: RoutesRecognized[]) => {
        // console.log('previous url', events[0].urlAfterRedirects);
        this.previousURL = events[0].urlAfterRedirects.split('?')[0];
        // console.log('this.previousURL', events[0].urlAfterRedirects);
        // console.log('current url', events[1].urlAfterRedirects);
        this.currentURL = events[1].urlAfterRedirects.split('?')[0];
        // console.log('this.currentURL', this.currentURL);
        if (events[0].urlAfterRedirects.indexOf('page=') > -1 || events[0].urlAfterRedirects.indexOf('limit=') > -1) {
          let isSamePrevAndCurrentUrl = this.checkPreviousAndCurrentURLSame(this.previousURL, this.currentURL);
          if (!isSamePrevAndCurrentUrl) {
            this.router.navigateByUrl(this.currentURL);
          }
        }

      });



    /*    this.router.events.subscribe((event: Event) => {
         if (!(event instanceof NavigationEnd)) {
           return;
         }
         switch (true) {
           case event instanceof NavigationStart: {
              this.loader.show();
             break;
           }
           case event instanceof NavigationEnd:
           case event instanceof NavigationCancel:
           case event instanceof NavigationError: {
              this.loader.hide();
             break;
           }
           default: {
             break;
           }
         }
       }); */
  }

  ngOnInit() {
    if (AppConfig.production) {
      this.meta.addTags([
        { name: 'description', content: 'Employee Portal of United Exploration India Private Limited. United Exploration India Private Limited delivers GIS, Remote Sensing and Minining Services across India and overseas.' }
      ]);
    }
  }

  checkPreviousAndCurrentURLSame(prev: any, current: any) {
    if (prev && current) {
      if (prev.includes(current)) {
        return true
      }
    }
    return false
  }

  public loadScript() {
    let body = <HTMLDivElement>document.body;
    let script = document.createElement('script');
    script.innerHTML = '';
    script.src = 'assets/js/backend.js';
    script.async = true;
    script.defer = true;
    body.appendChild(script);
  }
}
