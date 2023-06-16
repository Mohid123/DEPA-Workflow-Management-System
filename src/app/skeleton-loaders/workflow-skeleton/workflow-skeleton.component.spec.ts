import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowSkeletonComponent } from './workflow-skeleton.component';

describe('WorkflowSkeletonComponent', () => {
  let component: WorkflowSkeletonComponent;
  let fixture: ComponentFixture<WorkflowSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ WorkflowSkeletonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
