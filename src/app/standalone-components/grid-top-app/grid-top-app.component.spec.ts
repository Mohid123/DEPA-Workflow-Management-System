import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridTopAppComponent } from './grid-top-app.component';

describe('GridTopAppComponent', () => {
  let component: GridTopAppComponent;
  let fixture: ComponentFixture<GridTopAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GridTopAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridTopAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
