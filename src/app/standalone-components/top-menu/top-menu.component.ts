import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopMenuComponent {

  @Output() selectByIndex = new EventEmitter();
  @Input() menuItems: any = [
    {
      name: 'apps',
      icon: '../../../assets/menu_bars.svg',
      altIcon: '../../../assets/menu_bars_alt.svg',
      isActive: true
    },
    {
      name: 'faq',
      icon: '../../../assets/faq.svg',
      altIcon: '../../../assets/faq_alt.svg',
      isActive: false
    },
    {
      name: 'about depa',
      icon: '../../../assets/copy.svg',
      altIcon: '../../../assets/copy_alt.svg',
      isActive: false
    },
  ];

  setActive(index: number) {
    this.menuItems[index].isActive = !this.menuItems[index].isActive;
    this.menuItems.map((item: any, i: any) => {
      if(i !== index) {
        item.isActive = false;
      }
    })
  }

}
