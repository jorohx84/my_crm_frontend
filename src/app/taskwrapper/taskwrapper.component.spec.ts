import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskwrapperComponent } from './taskwrapper.component';

describe('TaskwrapperComponent', () => {
  let component: TaskwrapperComponent;
  let fixture: ComponentFixture<TaskwrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskwrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskwrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
