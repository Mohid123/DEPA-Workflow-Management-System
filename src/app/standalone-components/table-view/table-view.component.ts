import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '../filter/filter.component';
import { TuiPaginationModule } from '@taiga-ui/kit';
import { Observable, of } from 'rxjs';
import { TuiLoaderModule } from '@taiga-ui/core';

/**
 * Reusable Table view component. Uses nested filter and pagination components
 */
@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, RouterModule, FilterComponent, TuiPaginationModule, TuiLoaderModule],
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableViewComponent {
  /**
   * The category names to show as table column headers
   */
  @Input() tableColumns: string[] = ['Company Name', 'Module Name', 'Submodule Name', 'Status'];

  /**
   * The data to display inside the table
   */
  @Input() tableData: Observable<any> = of([]);

  /**
   * The filter parameters to show in the dropdown
   */
  filterMenuCompany =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg'},
    {name: 'Sort by Decsending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg'}
  ];

  /**
   * The filter parameters to show in the dropdown
   */
  filterMenuSubmodule =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg'},
    {name: 'Sort by Decsending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg'}
  ];

  /**
   * The filter parameters to show in the dropdown
   */
  filterMenuModule =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg'},
    {name: 'Sort by Decsending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg'}
  ];

   /**
   * The filter parameters to show in the dropdown
   */
  statusMenu = [
    {name: 'Draft', status: 'idle', icon: ''},
    {name: 'Published', status: 'idle', icon: ''}
  ];

   /**
   * @ignore
   */
  length = 20;

   /**
   * @ignore
   */
  index = 1;

  /**
   *
   * @param {number} index
   * Handles pagination of table data
   */
  goToPage(index: number): void {
    this.index = index;
    console.info('New page:', index);
  }

  /**
   *
   * @param {any} value
   * Sends the selected filter value from the [Filter Component]{@link FilterComponent} to server and fetches result
   */
  sendFilterValue(value: any) {
    console.log(value);
    //send api call here
  }
}
