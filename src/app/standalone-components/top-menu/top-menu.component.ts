import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthService } from 'src/app/modules/auth/auth.service';

export interface TabItems {
  name: string,
  icon: string, 
  isActive: boolean
}
@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TopMenuComponent {
  constructor(private auth: AuthService) {

  }
  @Output() selectByIndex = new EventEmitter();
  @Input() menuItems: TabItems[];

  setActive(index: number) {
    this.menuItems[index].isActive = !this.menuItems[index].isActive;
    this.menuItems.map((item: any, i: any) => {
      if(i !== index) {
        item.isActive = false;
      }
    })
  }

  logout() {
    this.auth.logout();
  }

}
