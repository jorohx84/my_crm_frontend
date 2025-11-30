import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskinfobarComponent } from './taskinfobar.component';

describe('TaskinfobarComponent', () => {
  let component: TaskinfobarComponent;
  let fixture: ComponentFixture<TaskinfobarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskinfobarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskinfobarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
