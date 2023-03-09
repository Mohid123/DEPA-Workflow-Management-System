import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-store-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './store-card.component.html',
  styleUrls: ['./store-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreCardComponent {
  @Input() appIcon!: string;
  @Input() appName!: string;
  @Input() themeColor!: string;
}
