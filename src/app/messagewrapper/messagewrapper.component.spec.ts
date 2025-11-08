import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagewrapperComponent } from './messagewrapper.component';

describe('MessagewrapperComponent', () => {
  let component: MessagewrapperComponent;
  let fixture: ComponentFixture<MessagewrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagewrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagewrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
