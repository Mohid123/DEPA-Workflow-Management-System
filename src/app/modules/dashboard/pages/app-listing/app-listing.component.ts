import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, of } from 'rxjs';
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
  appliedFilter: string = 'All'
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
    },
    {
      name: 'HR Management',
      icon: '../../../../../assets/performance_icon.svg',
      status: 'Rejected',
      department: 'Human Resource'
    },
    {
      name: 'Finance Application',
      icon: '../../../../../assets/fly.svg',
      status: 'In Progress',
      department: 'Human Resource'
    },
    {
      name: 'Cisco Management',
      icon: '../../../../../assets/cisco.svg',
      status: 'Approved',
      department: 'Networking'
    }
  ]);

  length = 10;
  index = 0;
  goToPage(index: number): void {
    this.index = index;
  }

  applyFilters(filterStr: string) {
    this.apps$ = of([
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
      },
      {
        name: 'HR Management',
        icon: '../../../../../assets/performance_icon.svg',
        status: 'Rejected',
        department: 'Human Resource'
      },
      {
        name: 'Finance Application',
        icon: '../../../../../assets/fly.svg',
        status: 'In Progress',
        department: 'Human Resource'
      },
      {
        name: 'Cisco Management',
        icon: '../../../../../assets/cisco.svg',
        status: 'Approved',
        department: 'Networking'
      }
    ]);
    this.appliedFilter = filterStr
    if(filterStr == 'All') {
      return this.apps$;
    }
    this.apps$ = this.apps$.pipe(map(val => val.filter(items => items.status == filterStr)));
    return this.apps$
  }
}
