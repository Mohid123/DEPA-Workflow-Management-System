import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCheckboxLabeledModule, TuiInputModule } from '@taiga-ui/kit';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject, debounceTime, filter, map, switchMap, takeUntil } from 'rxjs';
import { DashboardService } from 'src/app/modules/dashboard/dashboard.service';
import { ApiResponse } from 'src/core/models/api-response.model';
import { User } from 'src/core/models/user.model';

/**
 * @ignore
 */
export class dropDownItems {
  id: string;
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
  inputFieldArr: any[] = [];

  /**
   * @ignore
   */
  @ViewChild('customElem') customElem?: ElementRef;

  /**
   * Dropdown user list
   */
  @Input() users: BehaviorSubject<any> = new BehaviorSubject([]);

  limit: number = 10;
  page: number = 1;

  /**
   * List of approvers that will be sent to server as part of workflow 
   */
  @Output() approverList = new EventEmitter();

  constructor(private dashboard: DashboardService) {
    this.getUserData(this.limit, this.page)

    this.searchValue.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      map(val => val.trim()),
      switchMap(searchStr => searchStr == '' ? this.dashboard.getAllUsers(this.limit, this.page, undefined) : this.dashboard.getAllUsers(this.limit, this.page, searchStr))
    ).subscribe(users => {
      this.users.next(users);
    })
  }

  getUserData(limit: number, page: number) {
    this.dashboard.getAllUsers(limit, page)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      this.users.next(res);
    });
  }

  /**
   * Click Event Listener on the document to close dropdown. Excludes the dropdown element from event listener
   * @event click
   */
  @HostListener('document:click', ['$event'])
  listenToDOMClick() {
    if(!this.customElem?.nativeElement?.contains(event.target)) {
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
    if(user?.control.value === true && this.inputFieldArr.includes(user)) {
      this.removeItem(user.name);
      this.approverList.emit(this.inputFieldArr);
    }
    if(event.target?.checked === true) {
      this.inputFieldArr.push(user);
      this.approverList.emit(this.inputFieldArr);
    }
  }

  /**
   * Writes the provided formControlName value to the component
   * @param {any} value It can be any data type that is provided in the formControlName in the selector of this component
   */
  writeValue(approverIds: any) {
    this.users?.pipe(takeUntil(this.destroy$)).subscribe(user => {
      user = user?.filter((val) => {
        if(approverIds?.includes(val.id)) {
          val.control.setValue(true);
          return val
        }
        else if(approverIds.map(user => user?.id).includes(val.id)) {
          val.control.setValue(true);
          return val
        }
      });
      this.inputFieldArr = user
    });
  }

  /**
   * Removes value from option list and DOM
   * @param {any} value The user object
   */
  removeItem(value: any) {
    const index = this.inputFieldArr.indexOf(value);
    this.inputFieldArr.splice(index, 1);
    this.users.forEach((val: dropDownItems[]) => {
      val.forEach(user => {
        if(user === value && user.control.value === true) {
          user.control.setValue(false)
        }
      })
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
