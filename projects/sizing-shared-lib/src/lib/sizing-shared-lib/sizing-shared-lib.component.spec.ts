import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SizingSharedLibComponent } from './sizing-shared-lib.component';

describe('SizingSharedLibComponent', () => {
  let component: SizingSharedLibComponent;
  let fixture: ComponentFixture<SizingSharedLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SizingSharedLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SizingSharedLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
