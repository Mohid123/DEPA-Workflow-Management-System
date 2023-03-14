import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-card.component.html',
  styleUrls: ['./menu-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuCardComponent {
  @Input() menuHeader!: string;
  @Input() showFilters!: boolean;
  @Input() menuSubHeader!: string;
  @Input() secondaryMenuSubHeader!: string;
  @Input() secondarySubHeader!: string;
  @Input() menuIcon!: string;
  @Input() secondaryMenuItems?: Observable<any>;
  @Input() apps?: Observable<any>;

  trackByFn(ndex: number, item: any) {
    return item.id; 
  }
}
