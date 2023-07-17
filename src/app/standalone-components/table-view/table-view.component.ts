import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FilterComponent } from '../filter/filter.component';
import { TuiBadgeModule, TuiPaginationModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiLoaderModule } from '@taiga-ui/core';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { DataTransportService } from 'src/core/core-services/data-transport.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { StorageItem, getItem, setItem } from 'src/core/utils/local-storage.utils';
import { Observable, Subject, takeUntil } from 'rxjs';
import {TuiPreviewModule, TuiPreviewDialogService} from '@taiga-ui/addon-preview';

/**
 * Reusable Table view component. Uses nested filter and pagination components
 */
@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, RouterModule, FilterComponent, TuiPaginationModule, TuiLoaderModule, TuiButtonModule, TuiBadgeModule],
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableViewComponent implements OnDestroy {
  /**
   * The category names to show as table column headers
   */
  @Input() tableColumns: string[] = ['Title', 'Company Name', 'Status'];

  /**
   * The data to display inside the table
   */
  @Input() tableData: any = [];

  fetchingTableData = new Subject<boolean>()

  /**
   * The filter parameters to show in the dropdown
   */
  filterMenuCompany =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg', sortBy: 'Company Name'},
    {name: 'Sort by Descending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg', sortBy: 'Company Name'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg', sortBy: 'Company Name'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg', sortBy: 'Company Name'}
  ];

  /**
   * The filter parameters to show in the dropdown
   */
  filterMenuSubmodule =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg', sortBy: 'Submodule Code'},
    {name: 'Sort by Descending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg', sortBy: 'Submodule Code'},
    {name: 'Sort by Latest', status: 'idle', icon: 'fa fa-calendar-check-o fa-lg', sortBy: 'Submodule Code'},
    {name: 'Sort by Oldest', status: 'idle', icon: 'fa fa-calendar-times-o fa-lg', sortBy: 'Submodule Code'}
  ];

  /**
   * The filter parameters to show in the dropdown
   */
  filterMenuModule =  [
    {name: 'Sort by Acsending', status: 'idle', icon: 'fa fa-sort-alpha-asc fa-lg'},
    {name: 'Sort by Descending', status: 'idle', icon: 'fa fa-sort-alpha-desc fa-lg'},
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

  @Input() moduleData: Observable<any>

   /**
   * @ignore
   */
   page = 1;

  moduleId: string;
  moduleCode: string;
  currentUser: any;
  destroy$ =  new Subject();
  isFilterApplied: boolean = false;

  @Output() emitDeleteEvent = new EventEmitter();
  @Output() emitPagination = new EventEmitter();
  @Output() emitFilters = new EventEmitter();
  @Output() emitSearch = new EventEmitter();
  @Output() emitPageChange = new EventEmitter();
  @ViewChild('preview') readonly preview?: TemplateRef<TuiDialogContext>;
  currentImg: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private dashboardService: DashboardService,
    private transport: DataTransportService,
    private auth: AuthService,
    private router: Router,
    @Inject(TuiPreviewDialogService)
    private previewDialogService: TuiPreviewDialogService
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

  showImage(image: string) {
    this.currentImg = image
    this.previewDialogService.open(this.preview)
    .pipe(takeUntil(this.destroy$))
    .subscribe();
  }

  showStatus(value: number) {
    if(value == 1) {
      return 'Published'
    }
    if(value == 3) {
      return 'Draft'
    }
    return 'Deleted'
  }

  splitURL(url: string) {
    return url.split('/').at(-1)
  }

  checkIfUserisViewOnly(value: any[]): boolean {
    return value.includes(this.currentUser?.id)
  }

  checkIfUserisAdmin(value: any[]): boolean {
    return value?.map(data => data?.id).includes(this.currentUser?.id)
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
  getSortType(value: any): string {
    if(value?.sortType == 'Sort by Latest') {
      return 'latest'
    }
    if(value?.sortType == 'Sort by Oldest') {
      return 'oldest'
    }
    if(value?.sortType == 'Sort by Descending') {
      return 'desc'
    }
    return 'asc'
  }

  sendFilters(value: any) {
    if(value) {
      this.fetchingTableData.next(true)
      const queryParams = {
        field: value?.applyOn == 'Submodule Code' ? 'subModuleCode': 'companyName',
        sortByTime: ['latest', 'oldest'].includes(this.getSortType(value)) == true ? this.getSortType(value) : undefined,
        sortBy: ['asc', 'desc'].includes(this.getSortType(value)) == true ? this.getSortType(value) : undefined,
      }
      if(queryParams.sortBy == undefined) {
        delete queryParams.sortBy
      }
      if(queryParams.sortByTime == undefined) {
        delete queryParams.sortByTime
      }
      this.dashboardService.getSubModuleByModuleSlug(getItem(StorageItem.moduleSlug), 7, this.page, queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.tableData = res
        this.fetchingTableData.next(false)
      })
    }
  }

  sendSearchValue(value: any) {
    this.fetchingTableData.next(true)
    const queryParams = {
      field: 'subModuleTitle',
      search: value
    }
    if(queryParams.search == null) {
      delete queryParams.search
    }
    this.dashboardService.getSubModuleByModuleSlug(getItem(StorageItem.moduleSlug), 7, this.page, queryParams)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      this.tableData = res;
      this.fetchingTableData.next(false)
    })
  }

  resetFilterValues(value: any) {
    this.fetchingTableData.next(true)
    if(value) {
      this.dashboardService.getSubModuleByModuleSlug(getItem(StorageItem.moduleSlug), 7, this.page)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.tableData = res;
        this.fetchingTableData.next(false);
      })
    }
  }

  setSubmoduleSlug(code: string, id: string) {
    setItem(StorageItem.moduleSlug, code);
    setItem(StorageItem.moduleID, id);
    this.emitPageChange.emit({code, id})
    this.router.navigate(['/modules', code], {queryParams: {moduleID: id || ''}})
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
