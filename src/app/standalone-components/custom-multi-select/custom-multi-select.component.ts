import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCheckboxLabeledModule, TuiInputModule } from '@taiga-ui/kit';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';
import { Subject } from 'rxjs';

export class dropDownItems {
  name: string;
  control: FormControl
}

/**
 * Multi-Select component (Uses Custom styling and event handling on a HTML Select Element).
 * 
 * The component acts as Custom Form Control using Angular's Control Value Accessor. For more
 * @see [CustomFormControls]{@link https://blog.angular-university.io/angular-custom-form-controls/}
 * 
 * Example:
 * 
 * ```typescript
 * <custom-multi-select
 *  formControlName="approvers"
 *  [users]="userList"
 *  (approverList)="getApproverList($event, i)"
 * >
 * </custom-multi-select>
 * ```
 */
@Component({
  selector: 'custom-multi-select',
  standalone: true,
  imports: [CommonModule, TuiCheckboxLabeledModule, ReactiveFormsModule, TuiInputModule, TuiTextfieldControllerModule],
  templateUrl: './custom-multi-select.component.html',
  styleUrls: ['./custom-multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomMultiSelectComponent),
      multi: true
    }
  ]
})
export class CustomMultiSelectComponent implements ControlValueAccessor, OnDestroy {
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
  @Input() users: dropDownItems[];

  /**
   * List of approvers that will be sent to server as part of workflow 
   */
  @Output() approverList = new EventEmitter();

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
   * Method for updating component after changes occur
   * @param {any} onchanges 
   */
  onChange: any = (onchanges:any) => {};

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
      this.approverList.emit(this.inputFieldArr);
      this.onChange(this.inputFieldArr);
    }
    if(event.target?.checked === true) {
      this.inputFieldArr.push(user?.name);
      this.approverList.emit(this.inputFieldArr);
      this.onChange(this.inputFieldArr);
    }
  }

  /**
   * Removes value from option list and DOM
   * @param {string} value The name of the user
   */
  removeItem(value: string) {
    const index = this.inputFieldArr.indexOf(value);
    this.inputFieldArr.splice(index, 1);
    this.users.forEach((val: dropDownItems) => {
      if(val.name === value && val.control.value === true) {
        val.control.setValue(false)
      }
    })
  }

  /**
   * Register changes that occur on the FormControl
   * @param {Function} fn 
   */
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  /**
   * Writes the provided formControlName value to the component
   * @param {any} value It can be any data type that is provided in the formControlName in the selector of this component
   */
  writeValue(value: any) {
    this.inputFieldArr = value;
    value.forEach(str => {
      this.users.map(val => {
        if(val.name == str) {
          val.control.setValue(true)
        }
        return val
      })
    })
  }

  /**
   * @ignore
   */
  registerOnTouched(){}
  
  /**
   * Built in Angular Lifecycle method that is run when component or page is destroyed or removed from DOM
   */
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
