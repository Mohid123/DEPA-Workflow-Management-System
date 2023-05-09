import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFormsComponent } from './view-forms.component';

describe('ViewFormsComponent', () => {
  let component: ViewFormsComponent;
  let fixture: ComponentFixture<ViewFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewFormsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
