import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FilterComponent } from '../filter/filter.component';
import { TuiPaginationModule } from '@taiga-ui/kit';
import { Observable, Subject, of } from 'rxjs';
import { TuiButtonModule, TuiLoaderModule } from '@taiga-ui/core';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { StorageItem, getItem } from 'src/core/utils/local-storage.utils';
import { DataTransportService } from 'src/core/core-services/data-transport.service';

/**
 * Reusable Table view component. Uses nested filter and pagination components
 */
@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, RouterModule, FilterComponent, TuiPaginationModule, TuiLoaderModule, TuiButtonModule],
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableViewComponent {
  /**
   * The category names to show as table column headers
   */
  @Input() tableColumns: string[] = ['Company Name', 'Module Name', 'Submodule Code', 'Status'];

  /**
   * The data to display inside the table
   */
  @Input() tableData: any = [];

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

  submoduleID: string;

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

  moduleId: string;
  moduleCode: string;

  @Output() emitDeleteEvent = new EventEmitter()

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private dashboardService: DashboardService,
    private transport: DataTransportService
  ) {
    this.activatedRoute.queryParams.subscribe(val => this.moduleId = val['moduleID']);
    this.activatedRoute.params.subscribe(val => {
      this.transport.moduleCode.next(val['name']);
      this.moduleCode = val['name'];
    });
  }

  showDialog(subModuleID: string, content: PolymorpheusContent<TuiDialogContext>): void {
    if(subModuleID) {
      this.submoduleID = subModuleID;
      this.dialogs.open(content).subscribe();
    }
  }

  deleteModule() {
    this.dashboardService.deleteSubModule(this.submoduleID).subscribe((res: any) => {
      this.emitDeleteEvent.emit(true);
    });
  }

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
