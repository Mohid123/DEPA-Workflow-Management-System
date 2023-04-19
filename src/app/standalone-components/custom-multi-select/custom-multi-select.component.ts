import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCheckboxLabeledModule, TuiInputModule } from '@taiga-ui/kit';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
 

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
  @Input() items: any[] = [
    {name: 'Ali khan raja raunaqzai', control: new FormControl(false)},
    {name: 'Abid ahmad tarakai', control: new FormControl(false)},
    {name: 'Junaid mehmood', control: new FormControl(false)},
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

  @HostListener('document:scroll', ['$event'])
  listenToDOMScroll() {
    if(!this.customElem.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  toggleDropDown() {
    this.open = !this.open;
  }

  selectValueAndPushToInput(index: number, event: any) {
    if(event.target?.checked === true) {
      this.inputFieldArr.push(this.items[index]?.name)
    }
    else {
      this.inputFieldArr.splice(index, 1);
    }
  }

  removeItem(index: number) {
    this.inputFieldArr.splice(index, 1);
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
