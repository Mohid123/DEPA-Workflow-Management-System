import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridSideAppComponent } from './grid-side-app.component';

describe('GridSideAppComponent', () => {
  let component: GridSideAppComponent;
  let fixture: ComponentFixture<GridSideAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GridSideAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridSideAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
