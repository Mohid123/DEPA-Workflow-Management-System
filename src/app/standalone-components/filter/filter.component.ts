import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButtonModule, TuiHintModule, TuiHostedDropdownModule } from '@taiga-ui/core';
import { TuiDataListWrapperModule, TuiInputModule } from '@taiga-ui/kit';
import { SearchBarComponent } from '../search-bar/search-bar.component';

/**
 * Dynamic Filter component for handling search, sorting and other filters on the Table component Example usage:
 * 
 * ```typescript
 * <filter
 *  [filterBy]="Module Name"
 *  [items]="[{name: '', status: ''}]"
 *  [searchEnabled]="false"
 *  [showSortCategories]="false"
 *  (applyStatus)="EventEmitterFunction($event)"
 * >
 * </filter>
 * ```
 */
@Component({
  selector: 'filter',
  standalone: true,
  imports: [CommonModule, TuiHostedDropdownModule, TuiButtonModule, TuiDataListWrapperModule, TuiInputModule, SearchBarComponent, TuiHintModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent {
  /**
   * handles the state of the dropdown that shows the filters and searchbar
   */
  open = false;

  /**
   * The items to display in the filter dropdown
   */
  @Input() items: any[];

  /**
   * Handles whether search is enabled or not
   */
  @Input() searchEnabled: boolean = true;

  /**
   * Handles which sorting parameters are to be shown and where
   */
  @Input() showSortCategories: boolean = true;

  /**
   * Shows the name of the table category on which the filter is applied
   */
  @Input() filterBy: string;

  /**
   * @description
   * Emits status filter value
   */
  @Output() applyStatus = new EventEmitter();

  /**
   * @description
   * handles the resetting of filters
   */
  @Output() resetFilters = new EventEmitter();

  /**
   * Boolean to indicate that filter is active or not. Default is false "Reset Filter" button appears if value is true.
   */
  isFilterApplied: boolean = false;

  /**
   * @description
   * Get latest value from input field using form control, send api call and fetch results
   * 
   * @param {string} searchStr 
   * @returns void
   */
  searchTableData(searchStr: string) {
    console.log(searchStr)
  }

  /**
   * @description
   * Apply filters when user selects any option from the dropdown.
   * Also create indicators to let user know which filter is applied and active
   * 
   * @param {any} value
   * @returns void
   */
  setFilterAndApplyActive(value: {applyOn: string, sortType: string, index: number}) {
    this.applyStatus.emit(value);
    if(this.items?.some(val => val.name === value.sortType)) {
      this.items.forEach(val => {
        if(value.sortType === val.name) {
          val.status = 'active'
        }
        else {
          val.status = 'idle'
        }
      })
      this.isFilterApplied = true;
    }
  }

  /**
   * @description
   * Function for resetting filters
   */
  resetFilterValue() {
    this.isFilterApplied = false;
    this.items.forEach(val => val.status = 'idle');
  }

  /**
   * 
   * @param {any} item The item inside the ngFor loop 
   * @param {number} index The index of the item 
   * @returns The index of the current item on which any action is performed
   * @see [ngForTrackBy]{@link https://angular.io/api/common/NgForOf#description}
   */
  trackByFn(item: any, index: number) {
    return index
  }
}
