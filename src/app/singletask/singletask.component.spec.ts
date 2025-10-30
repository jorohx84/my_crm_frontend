import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingletaskComponent } from './singletask.component';

describe('SingletaskComponent', () => {
  let component: SingletaskComponent;
  let fixture: ComponentFixture<SingletaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingletaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingletaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
