import { Component, ComponentRef, Input, Type, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { retry } from 'rxjs/operators';

@Component({
  selector: 'sizing-suite-modal',
  exportAs: 'sizing-suite-modal',
  templateUrl: './sizing-suite-modal.component.html',
  styleUrls: ['./sizing-suite-modal.component.scss']
})
export class SizingSuiteModalComponent implements OnInit {

  @Input("modal-title") modalTitle: string = "";
  @Input("loaded-child-component-onOpen") loadedchildcomponentOpen: string = null;
  @Input("loaded-child-component-submit-callback") loadedchildcomponentSubmitCallback: string = null;

  @Input("modal-ok-text") modalOkText: string = "OK";
  @Input("modal-ok-icon") modalOkIcon: string = "'fa fa-check'"; // default icon

  @Input("modal-cancel-text") modalCancelText: string = "Cancel";
  @Input("modal-cancel-icon") modalCancelIcon: string = "'fa fa-times'"; // default icon

  @Output("on-container-click") onContainerClick: EventEmitter<any> = new EventEmitter();
  @Output("modal-cancel") modalCancel: EventEmitter<any> = new EventEmitter();
  @Output("modal-ok") modalOk: EventEmitter<any> = new EventEmitter<any>();
  @Output("loaded-child-component-submit-is-disabled-function") loadedchildcomponentSubmitIsDisabledFunction: EventEmitter<any> = new EventEmitter<any>();

  @Input("close-on-submit") closeOnSubmit: boolean = true;


  @ViewChild("componentLoaderPlaceholder", { read: ViewContainerRef, static: false }) placeholderContainer: ViewContainerRef;

  errorList: string[] = [];

  successCallback: Function;
  errorCallback: Function;

  public visible = false;
  public visibleAnimate = false;

  public submitIsDisabled = false;
  public componentRef: ComponentRef<any>;
  private init = false;

  constructor(private resolver: ComponentFactoryResolver) {
    this.successCallback = () => { console.info("OK has been called and closed!"); this.hideModal(100); };
    this.errorCallback = this.errorCallbackImplementation;  
  }

  ngOnInit() {
    
  }

  open(): void {
    // Set all fields
    this.visible = true;
    this.errorList = [];

    console.info("Open has been called!");

    // Load a dynamic component, if it is specified
    if (!!this.loadedchildcomponentOpen) {
        this.loadDynamicComponent();
    }

    setTimeout(() => this.visibleAnimate = true, 100);
  }

  public onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains("modal")) {
      this.onContainerClick.emit();
    }
  }

  public error(errors: string[]): void {
    this.errorCallbackImplementation(errors);
  }

  public close(): void {
    console.info("Close has been called!");

    // Call the bespoke callback
    this.modalCancel.emit();

    this.hideModal(300);
  }

  public ok(): void {
    console.info("OK has been called!");

    // Call the bespoke callback if no dynamic component is loaded
    if (!!this.componentRef) {
      // To use a component reference, a callback function can be specified.
      if (typeof this.componentRef.instance[this.loadedchildcomponentSubmitCallback] !== "undefined") {
        const responseObj = this.componentRef.instance[this.loadedchildcomponentSubmitCallback]();

        // If the function return something (anything), then return it to the subsequent function.
        this.modalOk.emit(responseObj);
      }
    } else {
      // Callback for the parent node
      this.modalOk.emit();
    }

    if (!!this.closeOnSubmit) {
      this.hideModal(300);
    }
}


  public isSubmitDisabledByChildComponent(): boolean {
    if (!!this.componentRef) {
      // To use a component reference, a callback function can be specified.
      if (typeof this.componentRef.instance['checkIfSubmitIsDisabled'] !== "undefined") {
        const responseObj = this.componentRef.instance['checkIfSubmitIsDisabled']();

        // If the function return something (anything), then return it to the subsequent function.
        this.loadedchildcomponentSubmitIsDisabledFunction.emit(responseObj);
        if (!!responseObj) {
          this.submitIsDisabled = responseObj;
        }
        else {
          // Default to enable the submit button on the Modal container component
          this.submitIsDisabled = false;
        }
      }
      else {
        // Default to enable the submit button on the Modal container component
        this.submitIsDisabled = false;
      }
    }
    else {
      // Default to enable the submit button on the Modal container component
      this.submitIsDisabled = false;
    }
    return this.submitIsDisabled;
  }


  private destroyComponentReference() {
    // Destroy any dynamic components that have been loaded
    if (!!this.componentRef) {
      console.info(`Destroying component reference: ${this.componentRef.instance.constructor.name}`);
      this.componentRef.destroy();
      this.componentRef = null;
      this.init = false;
    }
  }

  private hideModal(timeout: number): void {
    this.visibleAnimate = false;

    if (timeout > 0) {
      let interval = setTimeout(() => {
        this.visible = false;
        
        // Destroy any dynamically loaded components
        this.destroyComponentReference();

        clearTimeout(interval);
      }, timeout);
    }
    else {
      this.visible = false;

      // Destroy any dynamically loaded components
      this.destroyComponentReference();
    }
  }

  private errorCallbackImplementation(errors: string[]) {
    console.info("OK has been called with errors and not closed!");
    
    this.errorList = errors;
  }

  private loadDynamicComponent(): void {
    if (!this.loadedchildcomponentOpen || this.init) return;

    var factories = Array.from(this.resolver['_factories'].keys());
    let factoryClass = <Type<any>>factories.find((x: any) => x.name === this.loadedchildcomponentOpen);
    const factory = this.resolver.resolveComponentFactory(factoryClass);
    const compRef = this.placeholderContainer.createComponent(factory);
    
    if (this.componentRef) {
        this.componentRef.destroy();
    }

    this.componentRef = compRef;
    this.init = true;
  }
}
