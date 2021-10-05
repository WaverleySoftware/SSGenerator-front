import { TestBed, async,  } from '@angular/core/testing'; //'@angular/core/testing';
import { AppComponent } from './app.component';
import 'jasmine';
import 'mocha';

//declare var beforeEach: Mocha.HookFunction;
//declare var beforeEach: Mocha.HookFunction;
//declare var describe: Mocha.SuiteFunction;
//declare var it: Mocha.TestFunction;

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'ssv2'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('ssv2');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('ssv2 app is running!');
  });
});
