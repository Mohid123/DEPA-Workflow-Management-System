import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubmoduleComponent } from './edit-submodule.component';

describe('EditSubmoduleComponent', () => {
  let component: EditSubmoduleComponent;
  let fixture: ComponentFixture<EditSubmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSubmoduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSubmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
