import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FilterComponent } from '../filter/filter.component';
import { TuiPaginationModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiLoaderModule } from '@taiga-ui/core';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { AuthService } from 'src/app/modules/auth/auth.service';

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
  @Input() tableColumns: string[] = ['Company Name', 'Submodule Code', 'Status'];

  /**
   * The data to display inside the table
   */
  @Input() tableData: any = [];

  /**
   * The filter parameters to show in the dropdown
   */
  filterMenuCompany =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg', sortBy: 'Company Name'},
    {name: 'Sort by Decsending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg', sortBy: 'Company Name'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg', sortBy: 'Company Name'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg', sortBy: 'Company Name'}
  ];

  /**
   * The filter parameters to show in the dropdown
   */
  filterMenuSubmodule =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg', sortBy: 'Submodule Code'},
    {name: 'Sort by Decsending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg', sortBy: 'Submodule Code'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg', sortBy: 'Submodule Code'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg', sortBy: 'Submodule Code'}
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
   page = 1;

  moduleId: string;
  moduleCode: string;
  currentUser: any;

  @Output() emitDeleteEvent = new EventEmitter();
  @Output() emitPagination = new EventEmitter();
  @Output() emitFilters = new EventEmitter();
  @Output() emitSearch = new EventEmitter();

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private dashboardService: DashboardService,
    private transport: DataTransportService,
    private auth: AuthService
  ) {
    this.currentUser = this.auth.currentUserValue
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

  splitURL(url: string) {
    return url.split('/').at(-1)
  }

  checkIfUserisViewOnly(value: any[]): boolean {
    return value.includes(this.currentUser?.id)
  }

  checkIfUserisAdmin(value: any[]): boolean {
    return value.includes(this.currentUser?.id)
  }

  /**
   *
   * @param {number} index
   * Handles pagination of table data
   */
  goToPage(index: number): void {
    this.page = index + 1;
    this.emitPagination.emit(this.page)
  }

  floorNumber(value: number) {
    return Math.round(value)
  }

  /**
   *
   * @param {any} value
   * Sends the selected filter value from the [Filter Component]{@link FilterComponent} to server and fetches result
   */
  sendFilterValue(value: any) {
    this.emitFilters.emit(value)
  }

  sendSearchValue(value: any) {
    this.emitSearch.emit(value)
  }
}
