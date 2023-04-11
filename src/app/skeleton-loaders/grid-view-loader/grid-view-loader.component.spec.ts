import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridViewLoaderComponent } from './grid-view-loader.component';

describe('GridViewLoaderComponent', () => {
  let component: GridViewLoaderComponent;
  let fixture: ComponentFixture<GridViewLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridViewLoaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridViewLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
