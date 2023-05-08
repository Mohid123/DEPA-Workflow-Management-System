import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleGuardComponent } from './module-guard.component';

describe('ModuleGuardComponent', () => {
  let component: ModuleGuardComponent;
  let fixture: ComponentFixture<ModuleGuardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuleGuardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
