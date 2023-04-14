import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubmoduleComponent } from './add-submodule.component';

describe('AddSubmoduleComponent', () => {
  let component: AddSubmoduleComponent;
  let fixture: ComponentFixture<AddSubmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSubmoduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSubmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
