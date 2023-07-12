import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  Subject,
  Observable,
  of,
  takeUntil,
  BehaviorSubject,
  take,
  switchMap,
  Subscription,
} from 'rxjs';
import { NotificationsService } from 'src/core/core-services/notifications.service';
import {
  TuiDialogContext,
  TuiDialogService,
  TuiNotification,
} from '@taiga-ui/core';
import { TUI_ARROW } from '@taiga-ui/kit';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';

@Component({
  templateUrl: './publish-app.component.html',
  styleUrls: ['./publish-app.component.scss'],
})
export class PublishAppComponent implements OnDestroy {
  destroy$ = new Subject();
  file: any;
  base64File: any;
  localStorageApp: any;
  appNameLength: Observable<number> = of(0);
  moduleData = new BehaviorSubject<any>({});
  refreshForm = new EventEmitter();
  readonly arrow = TUI_ARROW;
 
  readonly conditions = ['OR', 'AND', 'ANY'];

  categories: Observable<any>;
  isCreatingModule = new Subject<boolean>();
  limit: number = 10;
  page: number = 0;
  workflowForm: FormGroup;
  public moduleDetailsForm: FormGroup;
  categoryDataForFormIOSelect = new BehaviorSubject<any>(null);
  isEditMode = new BehaviorSubject(false);
  storeModuleID = new BehaviorSubject<any>('');
  @ViewChild('btn') btn: ElementRef;
  currentFieldArray: any;
  activeEmailIndex: number;
  userListForEmail: any[] = [];
  private readonly search$ = new Subject<string>();
  saveDialogSubscription: Subscription[] = [];
  showError = new Subject<boolean>();
  errorIndex: number = 0;
  workFlowId: string;

  constructor(
    private fb: FormBuilder,
    private notif: NotificationsService,
    private dashboard: DashboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.initWorkflowForm();
    this.initModuleDetailsForm();
    //edit module case
    this.dashboard.moduleEditData.pipe(take(1), takeUntil(this.destroy$)).subscribe((val) => {
      if (val) {
        this.isEditMode.next(true);
        const stepsArr = val?.workFlowId?.stepIds?.map((data) => {
          return {
            id: data?.id,
            approverIds: data?.approverIds?.map((ids) => {
              return {
                name: ids?.fullName,
                id: ids?.id,
                control: new FormControl<boolean>(true)
              }
            }),
            emailNotifyTo: data?.emailNotifyToId?.notifyUsers || [],
            condition: data?.condition,
            emailNotifyToId: data?.emailNotifyToId?.id
          };
        });
        this.workFlowId = val?.workFlowId?.id;
        this.activatedRoute.queryParams
          .pipe(takeUntil(this.destroy$))
          .subscribe((val) => {
            this.storeModuleID.next(val['id']);
        });
        const editableValue = Object.assign(val, {
          workFlowId: this.workFlowId,
          steps: stepsArr
        });
        this.initModuleDetailsForm(editableValue)
        this.initWorkflowForm(editableValue)
      }
    });

    this.moduleDetailsForm?.get('moduleTitle')?.valueChanges.subscribe((value) => {
      this.moduleDetailsForm?.get('moduleCode')?.setValue(value.replace(/\s/g, '-').toLowerCase());
    });

    // searchUsers
    this.search$.pipe(
      switchMap(search =>this.dashboard.getAllUsersForListing(this.limit, this.page, search))).subscribe((res: any) => {
      if (res) {
        this.userListForEmail = res?.results?.map((data) => data?.email);
      }
    });

    // get users for email search
    this.dashboard.getAllUsersForListing(this.limit, this.page).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.userListForEmail = res?.results?.map((data) => data?.email);
      }
    });
  }

  onSearchChange(search: string) {
    this.search$.next(search);
  }

  validateEmails() {
    let emails = this.workflows.at(this.activeEmailIndex)?.get('emailNotifyTo')?.value;
    emails = emails.map(element => {
      if(!/\S+@\S+\.\S+/.test(element)) {
        return false
      }
      return true
    });
    if(emails.includes(false)) {
      this.notif.displayNotification('Please provide valid email addresses', 'Email Notify', TuiNotification.Warning)
    }
    else {
      this.saveDialogSubscription.forEach(val => val.unsubscribe())
    }
  }

  cancelEmailNotify() {
    this.workflows.at(this.activeEmailIndex)?.get('emailNotifyTo')?.setValue([]);
    this.saveDialogSubscription.forEach(val => val.unsubscribe())
  }

  initModuleDetailsForm(item?: any) {
    this.moduleDetailsForm = this.fb.group({
      moduleTitle: [item?.title || null, Validators.required],
      moduleCode: [{ value: item?.code || null, disabled: true }],
    });
  }

  initWorkflowForm(item?: any) {
    if (item?.steps) {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array(
          item?.steps?.map(
            (val: {
              condition: any;
              approverIds: any;
              emailNotifyTo: any;
              emailNotifyToId?: any;
              id?: any;
            }) => {
              return this.fb.group({
                condition: [val.condition, Validators.required],
                approverIds: [val.approverIds, Validators.required],
                emailNotifyTo: [val.emailNotifyTo || [], Validators.required],
                emailNotifyToId: [val.emailNotifyToId || undefined],
                id: [val.id || undefined],
              });
            }
          )
        ),
      });
    } else {
      this.workflowForm = this.fb.group({
        workflows: this.fb.array([
          this.fb.group({
            condition: ['', Validators.required],
            approverIds: [[], Validators.required],
            emailNotifyTo: [[], Validators.required],
          }),
        ]),
      });
    }
  }

  get f() {
    return this.moduleDetailsForm.controls;
  }

  get workflows() {
    return this.workflowForm.controls['workflows'] as FormArray;
  }

  addWorkflowStep() {
    const workflowStepForm = this.fb.group({
      condition: ['', Validators.required],
      approverIds: [[], Validators.required],
      emailNotifyTo: [[], Validators.required],
    });
    this.workflows.push(workflowStepForm);
  }

  removeWorkflowStep(index: number) {
    this.workflows.removeAt(index);
  }

  getApproverList(value: string[], index: number) {
    this.workflows.at(index)?.get('approverIds')?.setValue(value);
  }

  countUsers(value: number, index: number) {
    this.errorIndex = index
    if (value < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none');
      this.notif.displayNotification(
        'Default condition of "None" will be used if the number of approvers is less than 2',
        'Create Module',
        TuiNotification.Info
      );
      return this.showError.next(false)
    }
    if (
      value >= 2 &&
      this.workflows.at(index)?.get('condition')?.value == 'none'
    ) {
      this.showError.next(true)
      return (this.btn.nativeElement.disabled = true);
    }
    this.showError.next(false)
    return (this.btn.nativeElement.disabled = false);
  }

  validateSelection(index: number) {
    this.errorIndex = index
    if (this.workflows.at(index)?.get('approverIds')?.value?.length < 2) {
      this.workflows.at(index)?.get('condition')?.setValue('none');
      this.notif.displayNotification(
        'Default condition of "None" will be used if the number of approvers is less than 2',
        'Create Module',
        TuiNotification.Info
      );
      return this.showError.next(false)
    }
    if (
      this.workflows.at(index)?.get('approverIds')?.value?.length >= 2 &&
      this.workflows.at(index)?.get('condition')?.value == 'none'
    ) {
      this.showError.next(true)
      return (this.btn.nativeElement.disabled = true);
    }
    this.showError.next(false)
    return (this.btn.nativeElement.disabled = false);
  }

  openEmailNotifyModal(
    content: PolymorpheusContent<TuiDialogContext>,
    fieldArray: FormArray,
    index: number
  ): void {
    this.activeEmailIndex = index;
    this.currentFieldArray = fieldArray;
    this.saveDialogSubscription.push(this.dialogs
      .open(content, {
        dismissible: false,
        closeable: false,
      })
      .subscribe());
  }

  nextStep(): void {
    if (this.f['moduleTitle']?.invalid) {
      this.f['moduleTitle']?.markAsTouched()
      return this.notif.displayNotification('Please fill in all fields', 'Create Module', TuiNotification.Warning);
    }
    if (this.workflows?.length == 0) {
      return this.notif.displayNotification('Please complete the default workflow', 'Create Module', TuiNotification.Warning);
    }
    if (this.workflows.controls.map((val) => val.get('approverIds')?.value.length == 0).includes(true)) {
      return this.notif.displayNotification('Please complete the default workflow', 'Create Module', TuiNotification.Warning);
    }
    if (this.workflows.controls.map((val) => val.get('condition')?.value).includes('') === true) {
      return this.notif.displayNotification('Please complete the default workflow', 'Create Module', TuiNotification.Warning);
    }
    const moduleDetails = {
      title: this.f['moduleTitle']?.value,
      code: this.f['moduleCode']?.value,
    };
    if (this.isEditMode.value == false) {
      const defaultFlow = this.workflows?.value?.map((data) => {
        return {
          approverIds: data?.approverIds?.map((ids) =>
            ids.id ? ids.id : ids
          ),
          condition: data?.condition,
          emailNotifyTo: data?.emailNotifyTo,
        };
      });
      this.moduleData.next({
        ...moduleDetails,
        steps: defaultFlow,
      });
      this.submitNewModule()
    }
    else {
      debugger
      Object.assign(moduleDetails, {workFlowId: this.workFlowId});
      debugger
      const newSteps = this.workflows?.value?.map((data) => {
        return {
          approverIds: data?.approverIds?.map((ids) =>
            ids.id ? ids.id : ids
          ),
          condition: data?.condition,
          emailNotifyTo: data?.emailNotifyTo,
          id: data?.id ? data?.id : undefined,
          emailNotifyToId: data?.emailNotifyToId ? data?.emailNotifyToId : undefined,
        };
      });
      debugger
      this.moduleData.next({
        ...this.moduleData?.value,
        steps: newSteps,
      });
      this.submitNewModule()
    }
  }

  submitNewModule() {
    this.isCreatingModule.next(true);
    let payload = this.moduleData.value;
    console.log(payload)
    // this.dashboard.createModule(payload).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
    //   if (res) {
    //     this.dashboard.moduleEditData.next(null);
    //     this.router.navigate(['/dashboard/home']);
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
