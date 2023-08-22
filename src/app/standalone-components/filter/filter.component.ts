import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButtonModule, TuiHintModule, TuiHostedDropdownModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiDataListWrapperModule, TuiInputModule } from '@taiga-ui/kit';
import { BehaviorSubject, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

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
  imports: [CommonModule, TuiHostedDropdownModule, TuiButtonModule, TuiDataListWrapperModule, TuiInputModule, TuiHintModule, ReactiveFormsModule, TuiTextfieldControllerModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnDestroy {
  /**
   * handles the state of the dropdown that shows the filters and searchbar
   */
  open = false;

  destroy$ = new Subject();
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
  @Input() disabled: boolean = false;

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
  @Output() sendSearchToTable = new EventEmitter();

  /**
   * Boolean to indicate that filter is active or not. Default is false "Reset Filter" button appears if value is true.
   */
  isFilterApplied: boolean = false;
  previousFilterValues = new BehaviorSubject<any>([]);
  searchValue: FormControl = new FormControl();

  constructor() {
    this.searchValue.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$))
    .subscribe(typedValue => {
      this.sendSearchToTable.emit(typedValue ? typedValue : null)
    })
  }


  /**
   * @description
   * Get latest value from input field using form control, send api call and fetch results
   * 
   * @param {string} searchStr 
   * @returns void
   */
  searchTableData(searchStr: string, filterBy: string) {
    const params = {
      search: searchStr,
      searchBy: filterBy
    }
    this.sendSearchToTable.emit(params);
    this.isFilterApplied = true;
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
    if(this.disabled == true) {
      return
    }
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

  areArraysEqual(array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
    const sortedArray1 = array1.slice().sort((a, b) => a.id - b.id);
    const sortedArray2 = array2.slice().sort((a, b) => a.id - b.id);
  
    for (let i = 0; i < sortedArray1.length; i++) {
      const obj1 = sortedArray1[i];
      const obj2 = sortedArray2[i];
  
      // Compare each property of the objects
      for (let key in obj1) {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
    }
  
    return true;
  }

  /**
   * @description
   * Function for resetting filters
   */
  resetFilterValue() {
    this.isFilterApplied = false;
    this.items.forEach(val => val.status = 'idle');
    this.resetFilters.emit('reset');
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

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
