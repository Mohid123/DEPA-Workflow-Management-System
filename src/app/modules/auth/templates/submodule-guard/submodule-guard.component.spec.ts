import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmoduleGuardComponent } from './submodule-guard.component';

describe('SubmoduleGuardComponent', () => {
  let component: SubmoduleGuardComponent;
  let fixture: ComponentFixture<SubmoduleGuardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmoduleGuardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmoduleGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
