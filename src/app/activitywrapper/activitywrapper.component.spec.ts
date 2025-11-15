import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitywrapperComponent } from './activitywrapper.component';

describe('ActivitywrapperComponent', () => {
  let component: ActivitywrapperComponent;
  let fixture: ComponentFixture<ActivitywrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitywrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitywrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
