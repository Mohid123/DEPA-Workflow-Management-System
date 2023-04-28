import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/core/core-services/api.service';

/**
 * Interface for Breadcrumb navigation
 */
interface BreadCrumbs {
  /**
   * breadcrumb caption
   */
  caption: string,

  /**
   * The route link or path to enable navigation
   */
  routerLink: string
}

/**
 * Dashboard service that handles data manipulation and api handling related to the dashboard module
 */
@Injectable({
  providedIn: 'root'
})

export class DashboardService extends ApiService<any> {

  /**
   * Breadcrumb array to display
   */
  items: BreadCrumbs[] = [];

  /**
   * Uses HttpClient as an override method that asserts that function it describes is in the parent or base class i.e http methods inside the Api Service
   * @param http Performs HTTP requests.
   */
  constructor(protected override http: HttpClient) {
    super(http)
  }

  /**
   * Handles the dynamic creation of breadcrumbs when route changes
   * @param route Provides access to information about a route associated with a component that is loaded in an outlet. 
   * @param routerLink The route path
   * @param breadcrumbs Array fo breadcrumbs
   * @returns {BreadCrumbs[]} An array of breadcrumbs
   */
  public createBreadcrumbs(route: ActivatedRoute, routerLink: string = '', breadcrumbs: BreadCrumbs[] = []) {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        routerLink += `/${routeURL}`;
      }
      const caption = child.snapshot.data['breadcrumb'];
      if (caption) {
        breadcrumbs.push({caption, routerLink});
      }
      return this.createBreadcrumbs(child, routerLink, breadcrumbs);
    }
  }
}
