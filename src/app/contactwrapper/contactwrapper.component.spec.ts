import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactwrapperComponent } from './contactwrapper.component';

describe('ContactwrapperComponent', () => {
  let component: ContactwrapperComponent;
  let fixture: ComponentFixture<ContactwrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactwrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactwrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
