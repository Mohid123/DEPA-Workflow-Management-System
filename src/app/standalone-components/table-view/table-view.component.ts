import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '../filter/filter.component';
import { TuiPaginationModule } from '@taiga-ui/kit';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, RouterModule, FilterComponent, TuiPaginationModule],
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableViewComponent {
  @Input() tableColumns: string[] = ['Company Name', 'Submodule Name', 'Module Name', 'Status'];
  filterMenu =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg'},
    {name: 'Sort by Decsending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg'}
  ];
  statusMenu = [
    {name: 'Draft', status: 'idle', icon: ''},
    {name: 'Published', status: 'idle', icon: ''}
  ];
  length = 20;
  index = 1;
 
  goToPage(index: number): void {
    this.index = index;
    console.info('New page:', index);
  }

  sendFilterValue(value: any) {
    console.log(value);
    //send api call here
  }
}
