import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalsearchwrapperComponent } from './globalsearchwrapper.component';

describe('GlobalsearchwrapperComponent', () => {
  let component: GlobalsearchwrapperComponent;
  let fixture: ComponentFixture<GlobalsearchwrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalsearchwrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalsearchwrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
