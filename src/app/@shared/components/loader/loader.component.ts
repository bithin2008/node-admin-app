import { Component, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, Event } from '@angular/router';
import { delay } from 'rxjs/operators';
import { LoaderService } from 'src/app/@core/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  loading = true;
  constructor(
    public loader: LoaderService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.loader.getLoader()
      .pipe(delay(500)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((val: any) => {
        this.loading = val;
      });
    // Subscribe to NavigationStart event

    this.router.events.subscribe((event: Event) => {
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
    });
  }


}
