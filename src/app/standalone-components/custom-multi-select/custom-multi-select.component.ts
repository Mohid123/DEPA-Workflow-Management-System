import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCheckboxLabeledModule, TuiInputModule } from '@taiga-ui/kit';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';
 

@Component({
  selector: 'custom-multi-select',
  standalone: true,
  imports: [CommonModule, TuiCheckboxLabeledModule, ReactiveFormsModule, TuiInputModule, TuiTextfieldControllerModule],
  templateUrl: './custom-multi-select.component.html',
  styleUrls: ['./custom-multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomMultiSelectComponent {
  open = false;
  searchValue = new FormControl();
  @ViewChild('customElem') customElem?: ElementRef;
  @Input() items: any[] = [
    {name: 'Ali', control: new FormControl(false)},
    {name: 'Abid', control: new FormControl(false)},
    {name: 'Junaid', control: new FormControl(false)},
    {name: 'Fadi', control: new FormControl(false)},
    {name: 'Ahtasham', control: new FormControl(false)},
    {name: 'Sadiq', control: new FormControl(false)}
  ]

  @HostListener('document:click', ['$event'])
  listenToDOMClick() {
    if(!this.customElem.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  toggleDropDown() {
    this.open = !this.open;
  }
}
