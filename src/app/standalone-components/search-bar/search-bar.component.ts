import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiInputModule } from '@taiga-ui/kit';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, map, takeUntil } from 'rxjs';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, TuiInputModule, ReactiveFormsModule, FormsModule, TuiTextfieldControllerModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent implements OnDestroy {
  searchValue: FormControl = new FormControl();
  destroy$ = new Subject();
  @Output() searchStr = new EventEmitter();

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
