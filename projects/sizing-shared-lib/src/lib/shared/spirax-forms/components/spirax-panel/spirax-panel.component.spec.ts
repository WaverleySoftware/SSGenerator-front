import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiraxPanelComponent } from './spirax-panel.component';

describe('SpiraxPanelComponent', () => {
  let component: SpiraxPanelComponent;
  let fixture: ComponentFixture<SpiraxPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpiraxPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpiraxPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
