import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactlistwrapperComponent } from './contactlistwrapper.component';

describe('ContactlistwrapperComponent', () => {
  let component: ContactlistwrapperComponent;
  let fixture: ComponentFixture<ContactlistwrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactlistwrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactlistwrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
