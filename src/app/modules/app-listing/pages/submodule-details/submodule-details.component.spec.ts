import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmoduleDetailsComponent } from './submodule-details.component';

describe('SubmoduleDetailsComponent', () => {
  let component: SubmoduleDetailsComponent;
  let fixture: ComponentFixture<SubmoduleDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmoduleDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmoduleDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
