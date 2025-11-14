import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglecontactComponent } from './singlecontact.component';

describe('SinglecontactComponent', () => {
  let component: SinglecontactComponent;
  let fixture: ComponentFixture<SinglecontactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinglecontactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SinglecontactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
