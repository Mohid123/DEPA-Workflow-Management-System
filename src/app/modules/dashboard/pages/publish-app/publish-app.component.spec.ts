import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishAppComponent } from './publish-app.component';

describe('PublishAppComponent', () => {
  let component: PublishAppComponent;
  let fixture: ComponentFixture<PublishAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublishAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
