import { ChangeDetectionStrategy, Component } from '@angular/core';
import { of } from 'rxjs';
import {tuiTablePaginationOptionsProvider} from '@taiga-ui/addon-table';
@Component({
  selector: 'app-app-listing',
  templateUrl: './app-listing.component.html',
  styleUrls: ['./app-listing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiTablePaginationOptionsProvider({
      showPages: false,
    }),
],
})
export class AppListingComponent {
  readonly columns = ['Apps', 'All', 'Approved', 'Rejected', 'In Progress'];
  apps$ = of([
    {
      name: 'Performance (PMS)',
      icon: '../../../../../assets/performance_icon.svg',
      status: 'Approved',
      department: 'Human Resource'
    },
    {
      name: 'Management',
      icon: '../../../../../assets/fly.svg',
      status: 'Rejected',
      department: 'Human Resource'
    },
    {
      name: 'Cisco Management',
      icon: '../../../../../assets/cisco.svg',
      status: 'In Progress',
      department: 'Networking'
    }
  ]);

  length = 10;
  index = 1;
  goToPage(index: number): void {
    this.index = index;
    console.info('New page:', index);
  }
}
