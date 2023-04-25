import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiInputModule } from '@taiga-ui/kit';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, map, takeUntil } from 'rxjs';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';

/**
 * Reusable Component for handling search dynamically
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, TuiInputModule, ReactiveFormsModule, FormsModule, TuiTextfieldControllerModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent implements OnDestroy {
  /**
   * @description
   * Form Control for manipulating searhc bar value.
   */
  searchValue: FormControl = new FormControl();

  /**
   * @ignore
   */
  destroy$ = new Subject();

  /**
   * @description
   * The value the component will emit after user types in the input field
   */
  @Output() searchStr = new EventEmitter();

  /**
   * @constructor
   * @description
   * The form control will emit values when the user starts typing. RxJS operators debounce and map handle delay and trim logic when user types.
   * After user finishes typing, the component will emit the latest value
   */
  constructor() {
    this.searchValue.valueChanges
    .pipe(
      debounceTime(400),
      map(val => val.trim()),
      takeUntil(this.destroy$))
    .subscribe(typedValue => this.searchStr.emit(typedValue))
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
