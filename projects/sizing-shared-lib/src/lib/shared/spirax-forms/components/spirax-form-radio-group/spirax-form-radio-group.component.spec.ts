import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiraxFormRadioGroupComponent } from './spirax-form-radio-group.component';

describe('SpiraxFormRadioGroupComponent', () => {
  let component: SpiraxFormRadioGroupComponent;
  let fixture: ComponentFixture<SpiraxFormRadioGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpiraxFormRadioGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpiraxFormRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
