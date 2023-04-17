import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '../filter/filter.component';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, RouterModule, FilterComponent],
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableViewComponent {
}
