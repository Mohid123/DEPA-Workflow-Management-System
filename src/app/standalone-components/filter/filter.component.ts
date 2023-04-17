import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButtonModule, TuiHostedDropdownModule } from '@taiga-ui/core';
import { TuiDataListWrapperModule, TuiInputModule } from '@taiga-ui/kit';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'filter',
  standalone: true,
  imports: [CommonModule, TuiHostedDropdownModule, TuiButtonModule, TuiDataListWrapperModule, TuiInputModule, SearchBarComponent],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent {
  open = false;
  readonly items = ['Sort by Acsending', 'Sort by Decsending', 'Sort by Latest', 'Sort by Oldest'];
  @Input() searchEnabled: boolean = true;
  @Input() showSortCategories: boolean = true;
  @Input() filterBy: string;
  itemIsActive: boolean = false;

  searchTableData(searchStr: string) {
    console.log(searchStr)
  }

  setActiveAndFilter() {
    this.itemIsActive = !this.itemIsActive;
  }
}
