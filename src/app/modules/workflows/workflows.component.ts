import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss']
})
export class WorkflowsComponent {
  constructor(private router: Router) {
    let param: string = getItem(StorageItem.workflowID) || '';
    let moduleSlug = getItem(StorageItem.moduleSlug);
    if(this.router.url == `/submodule/${moduleSlug}`) {
      this.router.navigate([`/submodule/${moduleSlug}`, param])
    }
  }
}
