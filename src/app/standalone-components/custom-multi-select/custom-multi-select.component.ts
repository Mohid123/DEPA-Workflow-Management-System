import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCheckboxLabeledModule, TuiInputModule } from '@taiga-ui/kit';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';
import { Subject } from 'rxjs';

class dropDownItems {
  name: string;
  control: FormControl
}

@Component({
  selector: 'custom-multi-select',
  standalone: true,
  imports: [CommonModule, TuiCheckboxLabeledModule, ReactiveFormsModule, TuiInputModule, TuiTextfieldControllerModule],
  templateUrl: './custom-multi-select.component.html',
  styleUrls: ['./custom-multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomMultiSelectComponent implements OnDestroy {
  open = false;
  searchValue = new FormControl();
  destroy$ = new Subject();
  inputFieldArr: string[] = [];
  @ViewChild('customElem') customElem?: ElementRef;
  @Input() items: dropDownItems[] = [
    {name: 'Ali khan raja raunaqzai', control: new FormControl(false)},
    {name: 'Abid ahmad tarakai', control: new FormControl(false)},
    {name: 'Junaid mehmood', control: new FormControl(false)},
    {name: 'Fadi', control: new FormControl(false)},
    {name: 'Ahtasham', control: new FormControl(false)}
  ]

  @HostListener('document:click', ['$event'])
  listenToDOMClick() {
    if(!this.customElem.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  @HostListener('document:scroll', ['$event'])
  listenToDOMScroll() {
    if(!this.customElem.nativeElement.contains(event.target)) {
      const windowHeight = window.innerHeight;
      const boundingRectangle = this.customElem.nativeElement.getBoundingClientRect();
      if(boundingRectangle.bottom >= windowHeight) {
        this.open = false;
      }
    }
  }

  toggleDropDown() {
    this.open = !this.open;
  }

  selectValueAndPushToInput(user: any, event: any) {
    if(user?.control.value === true && this.inputFieldArr.includes(user?.name)) {
      this.removeItem(user.name);
    }
    if(event.target?.checked === true) {
      this.inputFieldArr.push(user?.name);
    }
  }

  removeItem(value: string) {
    const index = this.inputFieldArr.indexOf(value);
    this.inputFieldArr.splice(index, 1);
    this.items.forEach((val: dropDownItems) => {
      if(val.name === value && val.control.value === true) {
        val.control.setValue(false)
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
