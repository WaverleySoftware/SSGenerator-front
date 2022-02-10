import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiraxToggleComponent } from './spirax-toggle.component';

describe('SpiraxToggleComponent', () => {
  let component: SpiraxToggleComponent;
  let fixture: ComponentFixture<SpiraxToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpiraxToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpiraxToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
