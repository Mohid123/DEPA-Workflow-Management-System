import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWorkflowComponent } from './view-workflow.component';

describe('ViewWorkflowComponent', () => {
  let component: ViewWorkflowComponent;
  let fixture: ComponentFixture<ViewWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewWorkflowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
