import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowChartComponent } from './workflow-chart.component';

describe('WorkflowChartComponent', () => {
  let component: WorkflowChartComponent;
  let fixture: ComponentFixture<WorkflowChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ WorkflowChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
