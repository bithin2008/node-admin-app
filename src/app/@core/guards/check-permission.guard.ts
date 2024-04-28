import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { SharedService } from '../services/shared.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CheckPermissionGuard implements Resolve<any> {
  constructor(private sharedService: SharedService,private router: Router) {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Get the router state tree
    let currentRoute:any = state.url.split('?')[0].substring(1);
    // console.log('currentRoute',currentRoute);
    // console.log('state',state);
    
    return this.sharedService.sharedUserData$.pipe(
      switchMap((response: any) => {
        if (response.data) {
          // Find the object in the array that matches the route parameter
          var result = _.chain(response.data.accessable_module_submodules)
            .map('submodules') // pluck all elements from data
            .flatten() // flatten the elements into a single array
            .filter({ route_path: currentRoute }) // extract elements with a route_path of currentRoute
            .value();
          if (result.length>0) {
            // If a match is found, resolve with the matched object
            return of(result[0]);
          } else {
            // If no match is found, navigate to an error page or handle the error as needed
            this.router.navigate(['/unauthorized']); // Adjust to your error route
            return of(null); // Return null to indicate an error
          }
        }
        return of(null); // Return null if response.data is falsy
      }),
      catchError((error) => {
        console.error('Error:', error);
        this.router.navigate(['/unauthorized']); // Handle error navigation
        return of(null); // Return null to indicate an error
      })
    );
  }
}

