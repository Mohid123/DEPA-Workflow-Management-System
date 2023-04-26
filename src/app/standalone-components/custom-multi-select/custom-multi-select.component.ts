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

/**
 * Multi-Select component (Uses Custom styling and event handling on a HTML Select Element)
 */
@Component({
  selector: 'custom-multi-select',
  standalone: true,
  imports: [CommonModule, TuiCheckboxLabeledModule, ReactiveFormsModule, TuiInputModule, TuiTextfieldControllerModule],
  templateUrl: './custom-multi-select.component.html',
  styleUrls: ['./custom-multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomMultiSelectComponent implements OnDestroy {
  /**
   * @ignore
   */
  open = false;

  /**
   * @ignore
   */
  searchValue = new FormControl();

  /**
   * @ignore
   */
  destroy$ = new Subject();

  /**
   * @ignore
   */
  inputFieldArr: string[] = [];

  /**
   * @ignore
   */
  @ViewChild('customElem') customElem?: ElementRef;

  /**
   * Dropdown user list
   */
  @Input() items: dropDownItems[] = [
    {name: 'Ali khan raja raunaqzai', control: new FormControl(false)},
    {name: 'Abid ahmad tarakai', control: new FormControl(false)},
    {name: 'Junaid mehmood', control: new FormControl(false)},
    {name: 'Fadi', control: new FormControl(false)},
    {name: 'Ahtasham', control: new FormControl(false)}
  ]

  /**
   * Click Event Listener on the document to close dropdown. Excludes the dropdown element from event listener
   * @event click
   */
  @HostListener('document:click', ['$event'])
  listenToDOMClick() {
    if(!this.customElem.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

    /**
   * Scroll Event Listener on the document to close dropdown. Excludes the dropdown element from event listener.
   * If the element is no longer inside the current viewport, the dropdown will be closed
   * @event scroll
   */
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

  /**
   * @ignore
   */
  toggleDropDown() {
    this.open = !this.open;
  }

  /**
   * Adds value in option list to show inside the input select field
   * @param {dropDownItems} user The user selected from the dropdown
   * @param {any} event 
   */
  selectValueAndPushToInput(user: any, event: any) {
    if(user?.control.value === true && this.inputFieldArr.includes(user?.name)) {
      this.removeItem(user.name);
    }
    if(event.target?.checked === true) {
      this.inputFieldArr.push(user?.name);
    }
  }

  /**
   * Removes value from option list and DOM
   * @param {string} value The name of the user
   */
  removeItem(value: string) {
    const index = this.inputFieldArr.indexOf(value);
    this.inputFieldArr.splice(index, 1);
    this.items.forEach((val: dropDownItems) => {
      if(val.name === value && val.control.value === true) {
        val.control.setValue(false)
      }
    })
  }
  
  /**
   * Built in Angular Lifecycle method that is run when component or page is destroyed or removed from DOM
   */
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
