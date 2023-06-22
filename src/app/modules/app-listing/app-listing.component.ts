import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';

/**
 * Central component that shows all router outlets of the entire lazy loaded module.
 */
@Component({
  selector: 'app-app-listing',
  templateUrl: './app-listing.component.html',
  styleUrls: ['./app-listing.component.scss']
})
export class AppListingComponent {
  constructor(private ac: ActivatedRoute, private router: Router) {
    let param: string = getItem(StorageItem.moduleSlug) || '';
    let queryParam: string = getItem(StorageItem.moduleID) || '';
    if(this.router.url == '/submodule') {
      this.router.navigate(['/submodule', param], { queryParams: { moduleID: queryParam } })
    }
  }
}
