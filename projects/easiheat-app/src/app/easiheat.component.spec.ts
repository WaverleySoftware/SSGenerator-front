import { TestBed, async } from '@angular/core/testing';
import { EasiHeatComponent } from './easiHeat.component';

describe('EasiHeatComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EasiHeatComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(EasiHeatComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'easiheat-app'`, () => {
    const fixture = TestBed.createComponent(EasiHeatComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('easiHeat-app');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(EasiHeatComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('easiHeat-app app is running!');
  });
});
