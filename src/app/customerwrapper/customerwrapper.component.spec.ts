import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerwrapperComponent } from './customerwrapper.component';

describe('CustomerwrapperComponent', () => {
  let component: CustomerwrapperComponent;
  let fixture: ComponentFixture<CustomerwrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerwrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerwrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
