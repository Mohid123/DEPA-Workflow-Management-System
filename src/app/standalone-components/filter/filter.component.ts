import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButtonModule, TuiHintModule, TuiHostedDropdownModule } from '@taiga-ui/core';
import { TuiDataListWrapperModule, TuiInputModule } from '@taiga-ui/kit';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'filter',
  standalone: true,
  imports: [CommonModule, TuiHostedDropdownModule, TuiButtonModule, TuiDataListWrapperModule, TuiInputModule, SearchBarComponent, TuiHintModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent {
  open = false;
  @Input() items: any[];
  @Input() searchEnabled: boolean = true;
  @Input() showSortCategories: boolean = true;
  @Input() filterBy: string;
  @Output() applyStatus = new EventEmitter();
  @Output() resetFilters = new EventEmitter();
  isFilterApplied = false;

  searchTableData(searchStr: string) {
    console.log(searchStr)
  }

  setFilterAndApplyActive(value: any) {
    this.applyStatus.emit(value);
    if(this.items?.some(val => val.name === value.applyOn)) {
      this.items[value.index].status = 'active';
      this.isFilterApplied = true;
    }
  }
}
