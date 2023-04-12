import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyWorkflowComponent } from './dummy-workflow.component';

describe('DummyWorkflowComponent', () => {
  let component: DummyWorkflowComponent;
  let fixture: ComponentFixture<DummyWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DummyWorkflowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DummyWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
