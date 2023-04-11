import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/core/core-services/api.service';

interface BreadCrumbs {
  caption: string,
  routerLink: string
}

@Injectable({
  providedIn: 'root'
})

export class DashboardService extends ApiService<any> {
  items: BreadCrumbs[] = [];

  constructor(protected override http: HttpClient) {
    super(http)
  }

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
