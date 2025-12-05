import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealwrapperComponent } from './dealwrapper.component';

describe('DealwrapperComponent', () => {
  let component: DealwrapperComponent;
  let fixture: ComponentFixture<DealwrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealwrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealwrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
