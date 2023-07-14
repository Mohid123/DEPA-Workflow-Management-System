import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiInputModule } from '@taiga-ui/kit';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';

/**
 * Reusable Component for handling search dynamically
 * @implements OnDestroy
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
   * Form Control for manipulating search bar value.
   */
  searchValue: FormControl = new FormControl();

  /**
   * [Subject]{@link https://rxjs.dev/guide/subject} for handling observable unsubscriptions after component is destroyed
   */
  destroy$ = new Subject();

  /**
   * The value the component will emit after user types in the input field
   */
  @Output() searchStr = new EventEmitter();

  /**
   * @constructor
   * The form control will emit values when the user starts typing. RxJS operators debounce and map handle delay and trim logic when user types.
   * After user finishes typing, the component will emit the latest value
   */
  constructor() {
    this.searchValue.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$))
    .subscribe(typedValue => {
      this.searchStr.emit(typedValue ? typedValue : null)
    })
  }

  /**
   * Built in Angular Lifecycle method that is run when component or page is destroyed or removed from DOM
   */
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
