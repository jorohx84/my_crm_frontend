import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglecustomerComponent } from './singlecustomer.component';

describe('SinglecustomerComponent', () => {
  let component: SinglecustomerComponent;
  let fixture: ComponentFixture<SinglecustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinglecustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SinglecustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
