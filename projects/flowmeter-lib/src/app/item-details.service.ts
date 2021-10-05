import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MessagesService, PreferenceService, UnitsConverter, UnitsService } from 'sizing-shared-lib';
import { EnumerationService } from './enumeration.service';
import { Observable, of } from 'rxjs';
import { FlowMeterService } from './flow-meter.service';
import { RequestDeduplicationService } from './request-deduplication.service';
import { catchError, finalize, map } from 'rxjs/operators';
import { ProductTypesEnum } from './models/product-types.enum';

/**
 * Service for business logic related to item details
 * It is so huge, I don't want to trash components
 * And this is probably covered by unit tests...
 * Sometime. In the future.
 * TODO: Cover with unit tests
 */
@Injectable()
export class ItemDetailsService {
  selectedRowFormGroup: FormGroup;
  savedFormValue: {[key: string]: any};

  private TFA_DEFAULTS = {
    powerCommunications: '0',
    orientation: 'Horizontal',
    flangeRating: 'PN 40',
    bushKitCode: '',
    productCode: '',

  };

  private TVA_DEFAULTS = {
    powerCommunications: '0',
    orientation: 'Horizontal',
    productCode: '',
    pressureSensingKit: false,
    syphonAssembly: false,
  };

  private RIM20_DEFAULTS = {
    model: 'compression', // can be 'compression' or 'packing-gland'
    probeLength: 'S',
    processConnection: '150',
    enclosure: 'L',
    approvals: 'S',
    productCode: '',
    electronics: 'VT',
    pressureSensor: 'None',
    processTemperature: 'S',
    powerSupply: 'DL',
    outputSignal: '1HL',
    retractor: 'None',
  };

  private VIM20_DEFAULTS = {
    model: 'compression', // can be 'compression' or 'packing-gland'
    probeLength: 'S',
    processConnection: '150',
    enclosure: 'L',
    approvals: 'S',
    productCode: '',
    electronics: 'VT',
    pressureSensor: 'None',
    processTemperature: 'S',
    powerSupply: 'DL',
    outputSignal: '1HL',
    retractor: 'None',
  };

  private ELM_DEFAULTS = {
    connection: 'PN40',
    output: 'no-hart', // can be 'no-hart' and 'hart'
    approvals: false,
    nomenclature: '',
    productCode: '',
    liningMaterial: 'Hastelloy C4 including grounding electrode',
    electrodeMaterial: 'Hastelloy C4 including grounding electrode',
    transmitter: 'Integrated Transmitter IP67',
    inspectionMaterialCertificate: 'No',
    displayControlUnit: 'Yes',
    powerSupply: '24V DC',
    flexHoseKit: 'None'

  };

  private UTM10_DEFAULTS = {
    model: 'S',
    electricalPower: 'D',
    digitalCommunications: 'N',
    temperatureRange: '0',
    utm10Approvals: 'N',
    cableLength: '020',
    customCableLength: 0,
    submersible: 'Non Submersible',
    conduit: 'Without Conduit',
    conduitLength: '000',
    customConduitLength: 0,
    utt10Approvals: '0',
    rtd: 'N/A',
    mountingTracks: 'N/A',
    electronicsCode: '',
    transducerCode: '',
  };

  tfaForm: FormGroup;
  tvaForm: FormGroup;
  // gilfloForm: FormGroup;
  // ilvaForm: FormGroup;
  utm10Form: FormGroup;
  elmForm: FormGroup;
  vim20Form: FormGroup;
  rim20Form: FormGroup;

  private processConditions: FormGroup;
  private selectedProduct: any;

  private rim20ScopedLists = {
    probeLength: [],
    processConnection: [],
    retractor: [],
    outputSignal: [],
    enclosure: [],
    pressureSensor: [],
    processTemperature: [],
  };

  private vim20ScopedLists = {
    probeLength: [],
    processConnection: [],
    retractor: [],
    outputSignal: [],
    enclosure: [],
    pressureSensor: [],
    processTemperature: [],
  };

  private utm10ScopedLists = {
    conduitLength: [],
    rtd: [],
    digitalCommunications: [],
    temperatureRange: [],
    utm10Approvals: [],
    submersible: [],
    mountingTracks: [],
    utt10Approvals: [],
  }

  get rim20ProbeLengthFilters() {
    return this.rim20ScopedLists.probeLength;
  }

  get rim20ProcessConnectionFilters() {
    return this.rim20ScopedLists.processConnection;
  }

  get rim20OutputSignalFilters() {
    return this.rim20ScopedLists.outputSignal;
  }

  get rim20EnclosureFilters() {
    return this.rim20ScopedLists.enclosure;
  }

  get rim20PressureSensorFilters() {
    return this.rim20ScopedLists.pressureSensor;
  }

  get rim20ProcessTemperature() {
    return this.rim20ScopedLists.processTemperature;
  }

  get vim20ProbeLengthFilters() {
    return this.vim20ScopedLists.probeLength;
  }

  get vim20ProcessConnectionFilters() {
    return this.vim20ScopedLists.processConnection;
  }

  get vim20OutputSignalFilters() {
    return this.vim20ScopedLists.outputSignal;
  }

  get vim20EnclosureFilters() {
    return this.vim20ScopedLists.enclosure;
  }

  get vim20PressureSensorFilters() {
    return this.vim20ScopedLists.pressureSensor;
  }

  get vim20ProcessTemperatureFilters() {
    return this.vim20ScopedLists.processTemperature;
  }

  get utm10ConduitLengthFilters() {
    return this.utm10ScopedLists.conduitLength;
  }

  get utm10RtdFilters() {
    return this.utm10ScopedLists.rtd;
  }

  get utm10DigitalCommunicationsFilters() {
    return this.utm10ScopedLists.digitalCommunications;
  }

  get utm10TemperatureRangeFilters() {
    return this.utm10ScopedLists.temperatureRange;
  }

  get utm10Utm10ApprovalsFilters() {
    return this.utm10ScopedLists.utm10Approvals;
  }

  get utm10SubmersibleFilters() {
    return this.utm10ScopedLists.submersible;
  }

  get utm10MountingTracksFilters() {
    return this.utm10ScopedLists.mountingTracks;
  }

  get utm10Utt10ApprovalsFilters() {
    return this.utm10ScopedLists.utt10Approvals;
  }

  constructor(
    private fb: FormBuilder,
    private enumerationService: EnumerationService,
    private unitsService: UnitsService,
    private preferenceService: PreferenceService,
    private messagesService: MessagesService,
    private flowMeterService: FlowMeterService,
    private deduplicator: RequestDeduplicationService,
  ) {
    this.processConditions = fb.group({
      media: ['Dry Saturated Steam'],
      state: ['GAS'],
      inletPressure: [0],
      temperature: [32],
    });
    this.tfaForm = fb.group({
      powerCommunications: [this.TFA_DEFAULTS.powerCommunications],
      orientation: [this.TFA_DEFAULTS.orientation],
      flangeRating: [this.TFA_DEFAULTS.flangeRating],
      bushKitCode: [this.TFA_DEFAULTS.bushKitCode],
      productCode: [this.TFA_DEFAULTS.productCode],
    });
    this.initTfaFormBindings();

    this.tvaForm = fb.group({
      powerCommunications: [this.TVA_DEFAULTS.powerCommunications],
      orientation: [this.TVA_DEFAULTS.orientation],
      productCode: [this.TVA_DEFAULTS.productCode],
      pressureSensingKit: [this.TVA_DEFAULTS.pressureSensingKit],
      syphonAssembly: [this.TVA_DEFAULTS.syphonAssembly]
    });
    this.initTvaFormBindings();

    this.rim20Form = fb.group({
      model: [this.RIM20_DEFAULTS.model],
      probeLength: [this.RIM20_DEFAULTS.probeLength],
      processConnection: [this.RIM20_DEFAULTS.processConnection],
      enclosure: [this.RIM20_DEFAULTS.enclosure],
      approvals: [this.RIM20_DEFAULTS.approvals],
      productCode: [this.RIM20_DEFAULTS.productCode],
      electronics: [this.RIM20_DEFAULTS.electronics],
      pressureSensor: [this.RIM20_DEFAULTS.pressureSensor],
      processTemperature: [this.RIM20_DEFAULTS.processTemperature],
      powerSupply: [this.RIM20_DEFAULTS.powerSupply],
      outputSignal: [this.RIM20_DEFAULTS.outputSignal],
      retractor: [this.RIM20_DEFAULTS.retractor],
    });
    this.initRim20Bindings();

    this.vim20Form = fb.group({
      model: [this.VIM20_DEFAULTS.model],
      probeLength: [this.VIM20_DEFAULTS.probeLength],
      processConnection: [this.VIM20_DEFAULTS.processConnection],
      enclosure: [this.VIM20_DEFAULTS.enclosure],
      approvals: [this.VIM20_DEFAULTS.approvals],
      productCode: [this.VIM20_DEFAULTS.productCode],
      electronics: [this.VIM20_DEFAULTS.electronics],
      pressureSensor: [this.VIM20_DEFAULTS.pressureSensor],
      processTemperature: [this.VIM20_DEFAULTS.processTemperature],
      powerSupply: [this.VIM20_DEFAULTS.powerSupply],
      outputSignal: [this.VIM20_DEFAULTS.outputSignal],
      retractor: [this.VIM20_DEFAULTS.retractor],
    })
    this.initVim20Bindings();

    this.elmForm = fb.group({
      connection: [this.ELM_DEFAULTS.connection],
      output: [this.ELM_DEFAULTS.output],
      approvals: [this.ELM_DEFAULTS.approvals],
      nomenclature: [this.ELM_DEFAULTS.nomenclature],
      productCode: [this.ELM_DEFAULTS.productCode],
      liningMaterial: [this.ELM_DEFAULTS.liningMaterial],
      electrodeMaterial: [this.ELM_DEFAULTS.electrodeMaterial],
      transmitter: [this.ELM_DEFAULTS.transmitter],
      inspectionMaterialCertificate: [this.ELM_DEFAULTS.inspectionMaterialCertificate],
      displayControlUnit: [this.ELM_DEFAULTS.displayControlUnit],
      powerSupply: [this.ELM_DEFAULTS.powerSupply],
      flexHoseKit: [this.ELM_DEFAULTS.flexHoseKit],
    });
    this.initElmBindings();

    this.utm10Form = fb.group({
      model: [this.UTM10_DEFAULTS.model],
      electricalPower: [this.UTM10_DEFAULTS.electricalPower],
      digitalCommunications: [this.UTM10_DEFAULTS.digitalCommunications],
      temperatureRange: [this.UTM10_DEFAULTS.temperatureRange],
      utm10Approvals: [this.UTM10_DEFAULTS.utm10Approvals],
      cableLength: [this.UTM10_DEFAULTS.cableLength],
      customCableLength: [this.UTM10_DEFAULTS.customCableLength, Validators.required, this.validateUtm10LengthInput()],
      submersible: [this.UTM10_DEFAULTS.submersible],
      conduit: [this.UTM10_DEFAULTS.conduit],
      conduitLength: [this.UTM10_DEFAULTS.conduitLength],
      customConduitLength: [this.UTM10_DEFAULTS.customConduitLength, Validators.required, this.validateUtm10LengthInput()],
      utt10Approvals: [this.UTM10_DEFAULTS.utt10Approvals],
      rtd: [this.UTM10_DEFAULTS.rtd],
      mountingTracks: [this.UTM10_DEFAULTS.mountingTracks],
      electronicsCode: [this.UTM10_DEFAULTS.electronicsCode],
      transducerCode: [this.UTM10_DEFAULTS.transducerCode],
    });
    this.initUtm10Bindings();
  }

  changeProduct(product) {
    this.selectedProduct = product;
    switch (this.selectedProduct.type) {
      case ProductTypesEnum.TFA:
        this.tfaForm.reset(this.savedFormValue || this.TFA_DEFAULTS);
        this.createTfaAccessoryData();
        this.createTfaPartCode();
        this.createTfaBushKit();
        this.selectedRowFormGroup = this.tfaForm;
        break;
      case ProductTypesEnum.TVA:
        this.tvaForm.reset(this.savedFormValue || this.TVA_DEFAULTS);
        this.createTvaAccessoryData();
        this.createTvaPartCode();
        this.selectedRowFormGroup = this.tvaForm;
        break;
      case ProductTypesEnum.RIM20:
        this.rim20Form.reset(this.savedFormValue || this.RIM20_DEFAULTS);
        this.scopeRim20ProbeLengthList();
        this.scopeRim20RetractorList();
        this.scopeRim20PressureSensorList();
        this.scopeRim20ProcessTemperatureList();
        this.scopeRim20OutputSignalList();
        this.createRim20AccessoryData();
        this.createRim20Nomenclature();
        this.rimVimBodyMaterialNote();
        this.selectedRowFormGroup = this.rim20Form;
        break;
      case ProductTypesEnum.VIM20:
        this.vim20Form.reset(this.savedFormValue || this.VIM20_DEFAULTS);
        this.scopeVim20ProbeLengthList();
        this.scopeVim20RetractorList();
        this.scopeVim20PressureSensorList();
        this.scopeVim20ProcessTemperatureList();
        this.scopeVim20OutputSignalList();
        this.createVim20AccessoryData();
        this.createVim20Nomenclature();
        this.rimVimBodyMaterialNote();
        this.selectedRowFormGroup = this.vim20Form;
        break;
      case ProductTypesEnum.ELM:
        this.elmForm.reset(this.savedFormValue || this.ELM_DEFAULTS);
        this.createElmNomenclature();
        this.selectedRowFormGroup = this.elmForm;
        break;
      case ProductTypesEnum.UTM10:
        this.utm10Form.reset(this.savedFormValue || this.UTM10_DEFAULTS);
        this.setUtm10ModelOptions();
        this.createUtm10AccessoryData();
        this.setUtm10SubmersibleOptions();
        this.setUtm10ConduitOptions();
        this.setUtm10ApprovalsOptions();
        this.createUtm10Nomenclature();
        this.createUtt10Nomenclature();
        this.selectedRowFormGroup = this.utm10Form;
        break;
    }
  }

  changeProcessConditions(processConditions) {
    this.processConditions = processConditions;
  }

  private getUnitId(unitName): number {
    const units = this.preferenceService.sizingUnitPreferences;
    const unit = units.find(sizingUnit => sizingUnit.preference.name === unitName);

    if (!unit) {
      console.error('Trying to use sizing unit preference, that was not found');
      return 0;
    }

    const unitPreference = unit.preference;
    return parseInt(unitPreference.value ? unitPreference.value.toString() : '0', 10);
  }

  private showMessage(code: string, severity: number = 0) {
    this.messagesService.addMessage([{
      messageKey: code,
      value: 0,
      unitKey: '',
      severity: severity,
      displayValue: '',
    }])
  }

  private hideMessage(code: string) {
    this.messagesService.messages = this.messagesService.messages.filter(message => message.messageKey !== code);
  }

  private initTfaFormBindings() {
    this.tfaForm.get('powerCommunications').valueChanges.subscribe(value => this.createTfaPartCode());
    this.tfaForm.get('flangeRating').valueChanges.subscribe(value => this.createTfaBushKit());
  }

  private initTvaFormBindings() {
    this.tvaForm.get('powerCommunications').valueChanges.subscribe(value => this.createTvaPartCode());
  }

  private initRim20Bindings() {
    this.rim20Form.get('model').valueChanges.subscribe(value => {
      this.scopeRim20ProbeLengthList();
      this.scopeRim20ConnectionList();
      this.scopeRim20RetractorList();
      this.createRim20Nomenclature();
    });
    this.rim20Form.get('electronics').valueChanges.subscribe(value => {
      this.showRim20ElectronicsWarnings();
      this.createRim20AccessoryData();
      this.showRim20TemperatureSensorNote();
      // Can be removed once ATEX version of RIM20 released. KNG
      this.scopeRim20EnclosureList();
      this.scopeRim20OutputSignalList();
      this.createRim20Nomenclature();
    });
    this.rim20Form.get('pressureSensor').valueChanges.subscribe(value => this.createRim20Nomenclature());
    this.rim20Form.get('approvals').valueChanges.subscribe(value => {
      this.scopeRim20EnclosureList();
      this.scopeRim20ProcessTemperatureList();
      this.createRim20Nomenclature();
    });
    this.rim20Form.get('processTemperature').valueChanges.subscribe(value => this.createRim20Nomenclature());
    this.rim20Form.get('enclosure').valueChanges.subscribe(value => this.createRim20Nomenclature());
    this.rim20Form.get('powerSupply').valueChanges.subscribe(value => {
      this.createRim20AccessoryData();
      this.showRim20TemperatureSensorNote();
      this.createRim20Nomenclature();
    });
    this.rim20Form.get('outputSignal').valueChanges.subscribe(value => this.createRim20Nomenclature());
    this.rim20Form.get('processConnection').valueChanges.subscribe(value => {
      this.scopeRim20RetractorList();
      this.createRim20Nomenclature();
    });
    this.rim20Form.get('retractor').valueChanges.subscribe(value => {
      this.showRim20RetractorWarnings();
      this.createRim20Nomenclature();
    });
    this.rim20Form.get('probeLength').valueChanges.subscribe(value => {
      this.scopeRim20ConnectionList();
      this.scopeRim20RetractorList();
      this.createRim20Nomenclature();
    });
  }

  private initVim20Bindings() {
    this.vim20Form.get('model').valueChanges.subscribe(value => {
      this.scopeVim20ProbeLengthList();
      this.scopeVim20ConnectionList();
      this.scopeVim20RetractorList();
      this.createVim20Nomenclature();
    });
    this.vim20Form.get('electronics').valueChanges.subscribe(value => {
      this.showVim20ElectronicsWarnings();
      this.createVim20AccessoryData();
      this.showVim20TemperatureSensorNote();
      this.scopeVim20EnclosureList();
      this.scopeVim20OutputSignalList();
      this.createVim20Nomenclature();
    });
    this.vim20Form.get('pressureSensor').valueChanges.subscribe(value => this.createVim20Nomenclature());
    this.vim20Form.get('approvals').valueChanges.subscribe(value => {
      this.scopeVim20EnclosureList();
      this.scopeVim20ProcessTemperatureList();
      this.createVim20Nomenclature();
    });
    this.vim20Form.get('processTemperature').valueChanges.subscribe(value => this.createVim20Nomenclature());
    this.vim20Form.get('enclosure').valueChanges.subscribe(value => this.createVim20Nomenclature());
    this.vim20Form.get('powerSupply').valueChanges.subscribe(value => {
      this.createVim20AccessoryData();
      this.showVim20TemperatureSensorNote();
      this.createVim20Nomenclature();
    });
    this.vim20Form.get('outputSignal').valueChanges.subscribe(value => this.createVim20Nomenclature());
    this.vim20Form.get('processConnection').valueChanges.subscribe(value => {
      this.scopeVim20RetractorList();
      this.createVim20Nomenclature();
    });
    this.vim20Form.get('retractor').valueChanges.subscribe(value => {
      this.showVim20RetractorWarnings();
      this.createVim20Nomenclature();
    });
    this.vim20Form.get('probeLength').valueChanges.subscribe(value => {
      this.scopeVim20ConnectionList();
      this.scopeVim20RetractorList();
      this.createVim20Nomenclature();
    });
  }

  private initElmBindings() {
    this.elmForm.get('connection').valueChanges.subscribe(value => {
      this.createElmNomenclature();
    });
    this.elmForm.get('output').valueChanges.subscribe(value => {
      this.createElmNomenclature();
    });
    this.elmForm.get('approvals').valueChanges.subscribe(value => {
      this.createElmNomenclature();
    });
  }

  private initUtm10Bindings() {
    // this.utm10Form.get('').valueChanges.subscribe(value => {});
    this.utm10Form.get('model').valueChanges.subscribe(value => {
      this.setUtm10ModelOptions();
      this.createUtm10Nomenclature();
    });
    this.utm10Form.get('electricalPower').valueChanges.subscribe(value => {
      this.setUtm10ApprovalsOptions();
      this.createUtm10Nomenclature();
    });
    this.utm10Form.get('digitalCommunications').valueChanges.subscribe(value => {
      this.createUtm10Nomenclature();
    });
    this.utm10Form.get('temperatureRange').valueChanges.subscribe(value => {
      this.createUtm10Nomenclature();
    });
    this.utm10Form.get('utm10Approvals').valueChanges.subscribe(value => {
      this.createUtm10Nomenclature();
    });
    this.utm10Form.get('cableLength').valueChanges.subscribe(value => {
      this.setUtm10CustomCableLength();
      this.createUtt10Nomenclature();
    });
    this.utm10Form.get('customCableLength').valueChanges.subscribe(value => {
      // TODO: Implement custom length validator!!!
      this.createUtt10Nomenclature();
    });
    this.utm10Form.get('submersible').valueChanges.subscribe(value => {
      this.setUtm10ConduitOptions();
      this.createUtt10Nomenclature();
    });
    this.utm10Form.get('conduit').valueChanges.subscribe(value => {
      this.setUtm10ConduitLength();
      this.createUtt10Nomenclature();
    });
    this.utm10Form.get('conduitLength').valueChanges.subscribe(value => {
      this.setUtm10CustomConduitLength();
      this.createUtt10Nomenclature();
    });
    this.utm10Form.get('customConduitLength').valueChanges.subscribe(value => {
      // TODO: Implement custom length validator!!!
      this.createUtt10Nomenclature();
    });
    this.utm10Form.get('utt10Approvals').valueChanges.subscribe(value => {
      this.createUtt10Nomenclature();
    });
    this.utm10Form.get('rtd').valueChanges.subscribe(value => {});
    this.utm10Form.get('mountingTracks').valueChanges.subscribe(value => {});
  }

  /**
   * Create the filtered list of options for TFA meters.
   */
  private createTfaAccessoryData(): void {
    if (!this.selectedProduct) {
      return;
    }

    if (this.selectedProduct.wireless.toUpperCase() === 'NO') {
      this.tfaForm.get('powerCommunications').enable();
    }

    this.tfaForm.get('orientation').setValue(this.selectedProduct.orientation);

    this.createTfaPartCode();
  }

  /**
   * Create part code for TFA
   */
  private createTfaPartCode() {
    if (!this.selectedProduct || !this.tfaForm.get('powerCommunications').value) {
      return;
    }

    let productCode = this.selectedProduct.productCode;

    if (this.tfaForm.get('powerCommunications').value === '1' && this.selectedProduct.wireless.toUpperCase() === 'NO') {
      switch (this.selectedProduct.size) {
        case 'DN25':
          productCode = '1930295';
          break;
        case 'DN32':
          productCode = '1930395';
          break;
        case 'DN40':
          productCode = '1930495';
          break;
        case 'DN50':
          productCode = '1930595';
          break;
        default:
          // Unsupported size
          productCode = this.selectedProduct.productCode;
          if (this.tfaForm.get('powerCommunications').enabled) {
            this.tfaForm.get('powerCommunications').disable();
          }
      }
    }

    this.tfaForm.get('productCode').setValue(productCode);
  }

  private createTfaBushKit() {
    if (!this.selectedProduct) {
      return;
    }

    const flangeRatingList = this.enumerationService.getEnumerationCollection('TFAFlangeRating_FlowMeterSizing');
    const bushKitList = this.selectedProduct.bushKitList.split(',');
    const flangeRating = this.tfaForm.get('flangeRating').value;
    const flangeRatingSelected = flangeRatingList.find(i => i.value === flangeRating);

    if (flangeRating && flangeRatingSelected) {
      this.tfaForm.get('bushKitCode').setValue(bushKitList[flangeRatingSelected.sequence]);
    }
  }

  /**
   * Create the filtered list of options for TFA meters.
   */
  private createTvaAccessoryData(): void {
    if (!this.selectedProduct) {
      return;
    }

    if (this.selectedProduct.wireless.toUpperCase() === 'NO') {
      this.tvaForm.get('powerCommunications').enable();
    }

    this.tvaForm.get('orientation').setValue(this.selectedProduct.orientation);


    if (this.processConditions.get('media').value === 'Superheated Steam') {
      // select and disable the pressure sensing kit option
      this.tvaForm.get('pressureSensingKit').setValue(true);
      this.tvaForm.get('pressureSensingKit').disable();

      this.tvaForm.get('syphonAssembly').setValue(true);
      this.tvaForm.get('syphonAssembly').enable();
    } else {
      // deselect and enable the pressure sensing kit option
      this.tvaForm.get('pressureSensingKit').setValue(false);
      this.tvaForm.get('pressureSensingKit').disable();

      this.tvaForm.get('syphonAssembly').setValue(false);
      this.tvaForm.get('syphonAssembly').disable();
    }

    this.createTfaPartCode();
  }

  /**
   * Create part code for TVA
   */
  private createTvaPartCode() {
    if (!this.selectedProduct || !this.tvaForm.get('powerCommunications').value) {
      return;
    }

    let productCode = this.selectedProduct.productCode;

    if (this.tvaForm.get('powerCommunications').value === '1' && this.selectedProduct.wireless.toUpperCase() === 'NO') {
      switch (this.selectedProduct.size) {
        case 'DN50':
          productCode = '1920095'; // was '1920090';
          break;
        case 'DN80':
          productCode = '1920195'; // was '1920190';
          break;
        case 'DN100':
          productCode = '1920295'; // was  '1920290';
          break;
        default:
          // Unsupported size
          productCode = this.selectedProduct.productCode;
          if (this.tvaForm.get('powerCommunications').enabled) {
            this.tvaForm.get('powerCommunications').disable();
          }
      }
    }

    this.tvaForm.get('productCode').setValue(productCode);
  }

  private scopeRim20EnclosureList() {
    this.rim20ScopedLists.enclosure = [];
    const electronics = this.rim20Form.get('electronics').value;
    if (electronics === 'V') {
      const available = ['L', 'R25', 'A25', 'R50', 'A50'];
      this.rim20ScopedLists.enclosure = available;
    } else {
      const available = ['L', 'R25', 'R50'];
      this.rim20ScopedLists.enclosure = available;
    }
  }

  private scopeRim20ProbeLengthList() {
    // Disable compact probe ('C') if model is 'packing-gland'!
    const isPackingGland = this.rim20Form.get('model').value === 'packing-gland';
    const probeLengthList = this.enumerationService.getEnumerationCollection('RIM20ProbeLength_FlowMeterSizing');
    const availableValues = probeLengthList.filter(i => isPackingGland ? i.value !== 'C' : true).map(i => i.value);
    this.rim20ScopedLists.probeLength = availableValues;
  }

  private scopeRim20RetractorList() {
    this.rim20ScopedLists.retractor = [];

    const isPackingGland = this.rim20Form.get('model').value === 'packing-gland';
    if (!isPackingGland) {
      this.rim20Form.get('retractor').setValue('None');
      this.rim20Form.get('retractor').disable();
    } else {
      let removableIsDisabled = false;
      const selectedConnection = this.rim20Form.get('processConnection').value;

      // TODO: verify this logic! Something is strange in Silverlight code
      // Checking for ANSI 600 or PN63 because you have to have a permanent retractor (means Removable optoin not allowed).
      // And removable option not available for Male NPT if the Ansi-300 PT curves failed (ie. Ansi 300 missing then NPT can't be removable).
      // No Ansi300 means Removable optoin not allowed for PNPT.
      if (
        (selectedConnection === '600' || selectedConnection === '63') ||
        (selectedConnection === 'NPT')
      ) {
        removableIsDisabled = true;
      }

      if (removableIsDisabled) {
        this.rim20Form.get('retractor').setValue('Permanent');
        this.rim20Form.get('retractor').disable();
      } else {
        // Convert input pressure to barg
        const unitsToConvert = [{
          propertyName: 'pressure',
          initialValue: this.processConditions.get('inletPressure').value,
          initialUnitId: this.getUnitId('PressureUnit'),
          targetUnitId: 50, // Bar G
          convertedValue: null,
        }];

        const unitsConverter = {
          unitsConverter: unitsToConvert
        };

        this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
          let pressureBarG = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'pressure').convertedValue;
          // If pressue is above 3.4 barg then a removalable retractor must be used apart from for PN63
          if (
            pressureBarG > 3.4 &&
            selectedConnection !== '63'
          ) {
            this.rim20Form.get('retractor').setValue('Removable');
            this.rim20Form.get('retractor').disable();
          } else {
            this.rim20Form.get('retractor').enable();
          }
        })
      }
    }
  }

  private scopeRim20PressureSensorList() {
    this.rim20ScopedLists.pressureSensor = [];

    let electonicsNeedsPresureSensor = this.rim20Form.get('electronics').value.endsWith('P') || this.rim20Form.get('electronics').value.endsWith('PEM');

    if (electonicsNeedsPresureSensor) {
      const unitsToConvert = [{
        propertyName: 'pressure',
        initialValue: this.processConditions.get('inletPressure').value,
        initialUnitId: this.getUnitId('PressureUnit'),
        targetUnitId: 37, // Bar A
        convertedValue: null,
      }];

      const unitsConverter = {
        unitsConverter: unitsToConvert
      };

      this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
        let pressureBarA = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'pressure').convertedValue;
        let pressureSensors = this.enumerationService.getEnumerationCollection('RIM20PressureSensorList_FlowMeterSizing');

        let availableSensors = pressureSensors.filter(
          sensor => sensor.value !== 'None' && parseFloat(sensor.defaultText.substring(0, sensor.defaultText.indexOf(' '))) > pressureBarA
        ).map(
          sensor => sensor.value
        );

        this.rim20ScopedLists.pressureSensor = availableSensors;
      })
    } else {
      this.rim20Form.get('pressureSensor').disable();
      this.rim20Form.get('pressureSensor').setValue('None');
    }
  }

  private scopeRim20ProcessTemperatureList() {
    this.rim20ScopedLists.processTemperature = [];

    const approvals = this.rim20Form.get('approvals').value;
    const processTemperatureList = this.enumerationService.getEnumerationCollection('RIM20ProcessTemperatureList_FlowMeterSizing');
    
    if (approvals === 'S') {
      const available = processTemperatureList.filter(
        i => i.defaultText !== 'Standard Temperature -40 to 238C (-40 to 460F)' && i.defaultText !== 'High Temperature -40 to 454C (-40 to 850F)'
      );
      this.rim20ScopedLists.processTemperature = available;
    } else {
      const available = processTemperatureList.filter(
        i => i.defaultText !== 'Standard Temperature -55 to 238C (-67 to 460F)' && i.defaultText !== 'High Temperature -267 to 454C (-448 to 850F)'
      );
      this.rim20ScopedLists.processTemperature = available;
    }

    const unitsToConvert = [{
      propertyName: 'temperature',
      initialValue: this.processConditions.get('temperature').value,
      initialUnitId: this.getUnitId('TemperatureUnit'),
      targetUnitId: 146,
      convertedValue: null,
    }];

    const unitsConverter = {
      unitsConverter: unitsToConvert
    };

    this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
      let temperature = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'temperature').convertedValue;
      // Only hight temp option available?
      if (temperature > 238.0) {
        this.rim20Form.get('processTemperature').setValue('H');
        this.rim20Form.get('processTemperature').disable();
      } else {
        this.rim20Form.get('processTemperature').enable();
      }
    });
  }

  private scopeRim20OutputSignalList() {
    this.rim20ScopedLists.outputSignal = [];
    const powerSupply = this.rim20Form.get('powerSupply').value;
    const electronics = this.rim20Form.get('electronics').value;
    if (powerSupply === 'DL') {
      this.rim20Form.get('outputSignal').setValue('1HL')
      this.rim20Form.get('outputSignal').disable();
    } else {
      if (electronics === 'V') {
        this.rim20Form.get('outputSignal').enable();
        const available = ['1H', '1M', '1B'];
        this.rim20ScopedLists.outputSignal = available;
      } else {
        this.rim20Form.get('outputSignal').enable();
        const available = ['1H', '1M', '1B', '3H', '3M', '3B'];
        this.rim20ScopedLists.outputSignal = available;
      }
    }
  }

  private scopeRim20ConnectionList() {
    // ATTENTION
    // Seems like this logic never gets executed, because scopeRim20ProbeLengthList()
    // makes impossible to select compact probe and packing gland!
    const isPackingGland = this.rim20Form.get('model').value === 'packing-gland';
    const isCompactProbe = this.rim20Form.get('probeLength').value === 'C';
    const nonCompactConnectionList = [ '63', '40', '16' ];
    const connectionList = this.enumerationService.getEnumerationCollection('RIM20EndConnectionList_FlowMeterSizing');

    if (isPackingGland && isCompactProbe) {
      const availableValues = connectionList.filter(i => !nonCompactConnectionList.includes(i.value)).map(i => i.value);
      this.rim20ScopedLists.processConnection = availableValues;
    } else {
      this.rim20ScopedLists.processConnection = [];
    }
  }

  private showRim20TemperatureSensorNote() {
    const electronics = this.rim20Form.get('electronics').value;
    const powerSupply = this.rim20Form.get('powerSupply').value;

    if (electronics === 'VETEP' || electronics === 'VETEPEM') {
      if (powerSupply === 'DL') {
        this.showMessage('2_WIRE_TEMPERATURE_SENSOR_ONLY', 1);
      } else {
        this.showMessage('2_OR_4_WIRE_TEMPERATURE_SENSOR', 1);
      }
    } else {
      this.hideMessage('2_WIRE_TEMPERATURE_SENSOR_ONLY');
      this.hideMessage('2_OR_4_WIRE_TEMPERATURE_SENSOR');
    }
  }

  private showRim20ElectronicsWarnings() {
    const electronics = this.rim20Form.get('electronics').value;
    const media = this.processConditions.get('media').value;
    const mediaState = this.processConditions.get('state').value;

    if (
      electronics === 'V' &&
      media === 'Dry Saturated Steam'
    ) {
      this.showMessage('V_OPTION_MEASURES_VOLUMETRIC_FLOW_ONLY_VT_OPTION_IS_RECOMMENDED_FOR_DRY_SATURATED_STEAM_MESSAGE', 1);
    } else {
      this.hideMessage('V_OPTION_MEASURES_VOLUMETRIC_FLOW_ONLY_VT_OPTION_IS_RECOMMENDED_FOR_DRY_SATURATED_STEAM_MESSAGE');
    }

    if (
      electronics === 'V' &&
      media === 'Superheated Steam'
    ) {
      this.showMessage('V_OPTION_MEASURES_VOLUMETRIC_FLOW_ONLY_VTP_OPTION_IS_RECOMMENDED_FOR_SUPERHEATED_STEAM_MESSAGE', 1);
    } else {
      this.hideMessage('V_OPTION_MEASURES_VOLUMETRIC_FLOW_ONLY_VTP_OPTION_IS_RECOMMENDED_FOR_SUPERHEATED_STEAM_MESSAGE');
    }
    
    if (
      electronics === 'VT' &&
      media === 'Superheated Steam'
    ) {
      this.showMessage('VT_OPTION_MEASURES_TEMPERATURE_COMPENSATED_MASS_FLOW_VTP_OPTION_IS_RECOMMENDED_FOR_SUPERHEATED_STEAM_MESSAGE', 1);
    } else {
      this.hideMessage('VT_OPTION_MEASURES_TEMPERATURE_COMPENSATED_MASS_FLOW_VTP_OPTION_IS_RECOMMENDED_FOR_SUPERHEATED_STEAM_MESSAGE');
    }

    if (
      electronics === 'VTP' &&
      media === 'Dry Saturated Steam'
    ) {
      this.showMessage('VTP_OPTION_MEASURES_TEMPERATURE_AND_PRESSURE_COMPENSATED_MASS_FLOW_VT_OPTION_IS_RECOMMENDED_FOR_SATURATED_STEAM_MESSAGE', 1);
    } else {
      this.hideMessage('VTP_OPTION_MEASURES_TEMPERATURE_AND_PRESSURE_COMPENSATED_MASS_FLOW_VT_OPTION_IS_RECOMMENDED_FOR_SATURATED_STEAM_MESSAGE');
    }

    if (
      electronics === 'VTP' &&
      mediaState.toUpperCase() === 'LIQUID'
    ) {
      this.showMessage('VTP_OPTION_MEASURES_TEMPERATURE_AND_PRESSURE_COMPENSATED_MASS_FLOW_V_OR_VT_OPTION_IS_RECOMMENDED_FOR_LIQUIDS_MESSAGE', 1);
    } else {
      this.hideMessage('VTP_OPTION_MEASURES_TEMPERATURE_AND_PRESSURE_COMPENSATED_MASS_FLOW_V_OR_VT_OPTION_IS_RECOMMENDED_FOR_LIQUIDS_MESSAGE');
    }

    if (
      electronics === 'VTEP'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_420MA_INPUT_1_EXTERNAL_420_MA_SENSOR_MUST_BE_CONNECTED_NOT_SUPPLIED_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_420MA_INPUT_1_EXTERNAL_420_MA_SENSOR_MUST_BE_CONNECTED_NOT_SUPPLIED_MESSAGE');
    }

    if (
      electronics === 'VETEP'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_TEMPERATURE_INPUT_AND_420MA_INPUT_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_AND_1_EXTERNAL_420_MA_SENSOR_MUST_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_TEMPERATURE_INPUT_AND_420MA_INPUT_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_AND_1_EXTERNAL_420_MA_SENSOR_MUST_MESSAGE');
    }

    if (
      electronics === 'VTEM' &&
      electronics === 'VTPEM'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_MUST_BE_CONNECTED_NOT_SUPPLIED_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_MUST_BE_CONNECTED_NOT_SUPPLIED_MESSAGE');
    }

    if (
      electronics === 'VTEPEM'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_AND_420MA_INPUT_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_AND_1_EXTERNAL_420_MA_SENSO_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_AND_420MA_INPUT_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_AND_1_EXTERNAL_420_MA_SENSO_MESSAGE');
    }

    if (
      electronics === 'VETEPEM'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_AND_420MA_INPUT_2_EXTERNAL_RTD_TEMPERATURE_SENSORS_AND_1_EXTERNAL_420_MA_SENS_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_AND_420MA_INPUT_2_EXTERNAL_RTD_TEMPERATURE_SENSORS_AND_1_EXTERNAL_420_MA_SENS_MESSAGE');
    }
  }

  private showRim20RetractorWarnings() {
    const isPackingGland = this.rim20Form.get('model').value === 'packing-gland';
    const retractor = this.rim20Form.get('retractor').value;

    if (isPackingGland && retractor === 'None') {
      const unitsToConvert = [{
        propertyName: 'pressure',
        initialValue: this.processConditions.get('inletPressure').value,
        initialUnitId: this.getUnitId('PressureUnit'),
        targetUnitId: 58,
        convertedValue: null,
      }];
  
      const unitsConverter = {
        unitsConverter: unitsToConvert
      };
  
      this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
        let pressure = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'pressure').convertedValue;
        if (pressure > 50.0) {
          // Allow None but show message info, one is needed, inlet > 50.0psi (~3.45barg).   
          this.showMessage('ONE_REMOVABLE_RETRACTOR_MUST_BE_USED_IF_THE_INLET_PRESSURE_IS_GREATER_THAN_50_PSI_GAUGE_3_45_BAR_GAUGE_MESSAGE', 1);
        } else {
          this.hideMessage('ONE_REMOVABLE_RETRACTOR_MUST_BE_USED_IF_THE_INLET_PRESSURE_IS_GREATER_THAN_50_PSI_GAUGE_3_45_BAR_GAUGE_MESSAGE');
        }
      })
    }
  }

  private createRim20AccessoryData() {
    this.scopeRim20OutputSignalList();
    this.scopeRim20PressureSensorList();
  }

  private createRim20Nomenclature() {
    let productCode = '';

    // Meter Type
    productCode += 'RIM20-';

    // Electronics
    const electronics = this.rim20Form.get('electronics').value;
    if (electronics) {
      productCode += `${electronics}-`;
    }

    // Probe Length
    const probeLength = this.rim20Form.get('probeLength').value;
    if (probeLength) {
      productCode += `${probeLength}-`;
    }

    // Enclosure type for electronics
    const enclosure = this.rim20Form.get('enclosure').value;
    if (enclosure) {
      productCode += `${enclosure}`;

      // Append code 'P' depending on Electronics selected
      if (electronics) {
        if (
          (enclosure === 'A25' || enclosure === 'A50') &&
          (electronics !== 'V')
        ) {
          productCode += 'P-';
        } else {
          productCode += '-';
        }
      }
    }

    // Display
    productCode += 'D';

    // Power supply type
    const powerSupply = this.rim20Form.get('powerSupply').value;
    if (powerSupply) {
      productCode += `-${powerSupply}`;
    }

    // Output signal type
    const outputSignal = this.rim20Form.get('outputSignal').value;
    if (outputSignal) {
      productCode += `-${outputSignal}`;
    }

    // Process Temperature type Standard=S or High=H
    const processTemperature = this.rim20Form.get('processTemperature').value;
    if (processTemperature) {
      productCode += `-${processTemperature}`;
    }

    // Pressure sensor type
    const pressureSensor = this.rim20Form.get('pressureSensor').value;
    if (pressureSensor) {
      if (pressureSensor !== 'None') {
        productCode += `-P${pressureSensor}`;
      } else {
        productCode += `-P0`;
      }
    }

    // Connection
    productCode += '-';

    // RIM20Connection
    const processConnection = this.rim20Form.get('processConnection').value;
    const model = this.rim20Form.get('model').value;
    const retractor = this.rim20Form.get('retractor').value;
    if (processConnection) {
      if (model === 'compression') {
        productCode += `C${processConnection}`;
      } else {
        productCode += `P${processConnection}`;
      }
    }

    if (
      retractor &&
      retractor !== 'None' &&
      retractor !== 'Removable'
    ) {
      productCode += probeLength.toLowerCase() === 'e' ? 'R-E' : 'R';
    }

    // RIM20 Approval
    const approvals = this.rim20Form.get('approvals').value;
    if (approvals) {
      productCode += `-${approvals}`;
    }

    // Rotor
    const rotor = this.selectedProduct.rotor;
    if (rotor) {
      productCode += `-${rotor}`;
    }

    // END
    this.rim20Form.get('productCode').setValue(productCode);
  }

  private rimVimBodyMaterialNote() {
    this.showMessage('WARNING_AMBIENT_OPERATING_TEMPERATURE', 1);
  }

  private scopeVim20ProbeLengthList() {
    // Disable compact probe ('C') if model is 'packing-gland'!
    const isPackingGland = this.vim20Form.get('model').value === 'packing-gland';
    const probeLengthList = this.enumerationService.getEnumerationCollection('VIM20ProbeLength_FlowMeterSizing');
    const availableValues = probeLengthList.filter(i => isPackingGland ? i.value !== 'C' : true).map(i => i.value);
    this.vim20ScopedLists.probeLength = availableValues;
  }

  private scopeVim20RetractorList() {
    this.vim20ScopedLists.retractor = [];

    const isPackingGland = this.vim20Form.get('model').value === 'packing-gland';
    if (!isPackingGland) {
      this.vim20Form.get('retractor').setValue('None');
      this.vim20Form.get('retractor').disable();
    } else {
      let removableIsDisabled = false;
      const selectedConnection = this.vim20Form.get('processConnection').value;

      // TODO: verify this logic! Something is strange in Silverlight code
      // Checking for ANSI 600 or PN63 because you have to have a permanent retractor (means Removable optoin not allowed).
      // And removable option not available for Male NPT if the Ansi-300 PT curves failed (ie. Ansi 300 missing then NPT can't be removable).
      // No Ansi300 means Removable optoin not allowed for PNPT.
      if (
        (selectedConnection === '600' || selectedConnection === '63') ||
        (selectedConnection === 'NPT')
      ) {
        removableIsDisabled = true;
      }

      if (removableIsDisabled) {
        this.vim20Form.get('retractor').setValue('Permanent');
        this.vim20Form.get('retractor').disable();
      } else {
        // Convert input pressure to barg
        const unitsToConvert = [{
          propertyName: 'pressure',
          initialValue: this.processConditions.get('inletPressure').value,
          initialUnitId: this.getUnitId('PressureUnit'),
          targetUnitId: 50, // Bar G
          convertedValue: null,
        }];

        const unitsConverter = {
          unitsConverter: unitsToConvert
        };

        this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
          let pressureBarG = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'pressure').convertedValue;
          // If pressue is above 3.4 barg then a removalable retractor must be used apart from for PN63
          if (
            pressureBarG > 3.4 &&
            selectedConnection !== '63'
          ) {
            this.vim20Form.get('retractor').setValue('Removable');
            this.vim20Form.get('retractor').disable();
          } else {
            this.vim20Form.get('retractor').enable();
          }
        })
      }
    }
  }

  private scopeVim20PressureSensorList() {
    this.vim20ScopedLists.pressureSensor = [];

    let electonicsNeedsPresureSensor = this.vim20Form.get('electronics').value.endsWith('P') || this.vim20Form.get('electronics').value.endsWith('PEM');

    if (electonicsNeedsPresureSensor) {
      const unitsToConvert = [{
        propertyName: 'pressure',
        initialValue: this.processConditions.get('inletPressure').value,
        initialUnitId: this.getUnitId('PressureUnit'),
        targetUnitId: 37, // Bar A
        convertedValue: null,
      }];

      const unitsConverter = {
        unitsConverter: unitsToConvert
      };

      this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
        let pressureBarA = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'pressure').convertedValue;
        let pressureSensors = this.enumerationService.getEnumerationCollection('VIM20PressureSensorList_FlowMeterSizing');

        let availableSensors = pressureSensors.filter(
          sensor => sensor.value !== 'None' && parseFloat(sensor.defaultText.substring(0, sensor.defaultText.indexOf(' '))) > pressureBarA
        ).map(
          sensor => sensor.value
        );

        this.vim20ScopedLists.pressureSensor = availableSensors;
      })
    } else {
      this.vim20Form.get('pressureSensor').disable();
      this.vim20Form.get('pressureSensor').setValue('None');
    }
  }

  private scopeVim20ProcessTemperatureList() {
    this.vim20ScopedLists.processTemperature = [];

    const approvals = this.vim20Form.get('approvals').value;
    const processTemperatureList = this.enumerationService.getEnumerationCollection('VIM20ProcessTemperatureList_FlowMeterSizing');
    
    if (approvals === 'S') {
      const available = processTemperatureList.filter(
        i => i.defaultText !== 'Standard Temperature -40 to 260C (-40 to 500F)'
      );
      this.vim20ScopedLists.processTemperature = available;
    } else {
      const available = processTemperatureList.filter(
        i => i.defaultText !== 'Standard Temperature -200 to 260C (-330 to 500F)'
      );
      this.vim20ScopedLists.processTemperature = available;
    }

    const unitsToConvert = [{
      propertyName: 'temperature',
      initialValue: this.processConditions.get('temperature').value,
      initialUnitId: this.getUnitId('TemperatureUnit'),
      targetUnitId: 146,
      convertedValue: null,
    }];

    const unitsConverter = {
      unitsConverter: unitsToConvert
    };

    this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
      let temperature = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'temperature').convertedValue;
      // Only hight temp option available?
      if (temperature > 260) {
        this.vim20Form.get('processTemperature').setValue('H');
        this.vim20Form.get('processTemperature').disable();
      } else {
        this.vim20Form.get('processTemperature').enable();
      }
    });
  }

  private scopeVim20OutputSignalList() {
    this.vim20ScopedLists.outputSignal = [];

    const powerSupply = this.vim20Form.get('powerSupply').value;
    const electronics = this.vim20Form.get('electronics').value;
    if (powerSupply === 'DL') {
      this.vim20Form.get('outputSignal').setValue('1HL')
      this.vim20Form.get('outputSignal').disable();
    } else {
      if (electronics === 'V') {
        this.vim20Form.get('outputSignal').enable();
        const available = ['1H', '1M', '1B'];
        this.vim20ScopedLists.outputSignal = available;
      } else {
        this.vim20Form.get('outputSignal').enable();
        const available = ['1H', '1M', '1B', '3H', '3M', '3B'];
        this.vim20ScopedLists.outputSignal = available;
      }
    }
  }

  private scopeVim20ConnectionList() {
    // ATTENTION
    // Seems like this logic never gets executed, because scopeVim20ProbeLengthList()
    // makes impossible to select compact probe and packing gland!
    const isPackingGland = this.vim20Form.get('model').value === 'packing-gland';
    const isCompactProbe = this.vim20Form.get('probeLength').value === 'C';
    const nonCompactConnectionList = [ '63', '40', '16' ];
    const connectionList = this.enumerationService.getEnumerationCollection('VIM20EndConnectionList_FlowMeterSizing');

    if (isPackingGland && isCompactProbe) {
      const availableValues = connectionList.filter(i => !nonCompactConnectionList.includes(i.value)).map(i => i.value);
      this.vim20ScopedLists.processConnection = availableValues;
    } else {
      this.vim20ScopedLists.processConnection = [];
    }
  }

  private scopeVim20EnclosureList() {
    this.vim20ScopedLists.enclosure = [];

    const electronics = this.vim20Form.get('electronics').value;
    if (electronics === 'V') {
      const available = ['L', 'R25', 'A25', 'R50', 'A50'];
      this.vim20ScopedLists.enclosure = available;
    } else {
      const available = ['L', 'R25', 'R50'];
      this.vim20ScopedLists.enclosure = available;
    }
  }

  private showVim20TemperatureSensorNote() {
    const electronics = this.vim20Form.get('electronics').value;
    const powerSupply = this.vim20Form.get('powerSupply').value;

    if (electronics === 'VETEP' || electronics === 'VETEPEM') {
      if (powerSupply === 'DL') {
        this.showMessage('2_WIRE_TEMPERATURE_SENSOR_ONLY', 1);
      } else {
        this.showMessage('2_OR_4_WIRE_TEMPERATURE_SENSOR', 1);
      }
    } else {
      this.hideMessage('2_WIRE_TEMPERATURE_SENSOR_ONLY');
      this.hideMessage('2_OR_4_WIRE_TEMPERATURE_SENSOR');
    }
  }

  private showVim20RetractorWarnings() {
    const isPackingGland = this.vim20Form.get('model').value === 'packing-gland';
    const retractor = this.vim20Form.get('retractor').value;

    if (isPackingGland && retractor === 'None') {
      const unitsToConvert = [{
        propertyName: 'pressure',
        initialValue: this.processConditions.get('inletPressure').value,
        initialUnitId: this.getUnitId('PressureUnit'),
        targetUnitId: 58,
        convertedValue: null,
      }];
  
      const unitsConverter = {
        unitsConverter: unitsToConvert
      };
  
      this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
        let pressure = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'pressure').convertedValue;
        if (pressure > 50.0) {
          // Allow None but show message info, one is needed, inlet > 50.0psi (~3.45barg).   
          this.showMessage('ONE_REMOVABLE_RETRACTOR_MUST_BE_USED_IF_THE_INLET_PRESSURE_IS_GREATER_THAN_50_PSI_GAUGE_3_45_BAR_GAUGE_MESSAGE', 1);
        } else {
          this.hideMessage('ONE_REMOVABLE_RETRACTOR_MUST_BE_USED_IF_THE_INLET_PRESSURE_IS_GREATER_THAN_50_PSI_GAUGE_3_45_BAR_GAUGE_MESSAGE');
        }
      })
    }

  }

  private showVim20ElectronicsWarnings() {
    const electronics = this.vim20Form.get('electronics').value;
    const media = this.processConditions.get('media').value;
    const mediaState = this.processConditions.get('state').value;

    if (
      electronics === 'V' &&
      media === 'Dry Saturated Steam'
    ) {
      this.showMessage('V_OPTION_MEASURES_VOLUMETRIC_FLOW_ONLY_VT_OPTION_IS_RECOMMENDED_FOR_DRY_SATURATED_STEAM_MESSAGE', 1);
    } else {
      this.hideMessage('V_OPTION_MEASURES_VOLUMETRIC_FLOW_ONLY_VT_OPTION_IS_RECOMMENDED_FOR_DRY_SATURATED_STEAM_MESSAGE');
    }

    if (
      electronics === 'V' &&
      media === 'Superheated Steam'
    ) {
      this.showMessage('V_OPTION_MEASURES_VOLUMETRIC_FLOW_ONLY_VTP_OPTION_IS_RECOMMENDED_FOR_SUPERHEATED_STEAM_MESSAGE', 1);
    } else {
      this.hideMessage('V_OPTION_MEASURES_VOLUMETRIC_FLOW_ONLY_VTP_OPTION_IS_RECOMMENDED_FOR_SUPERHEATED_STEAM_MESSAGE');
    }
    
    if (
      electronics === 'VT' &&
      media === 'Superheated Steam'
    ) {
      this.showMessage('VT_OPTION_MEASURES_TEMPERATURE_COMPENSATED_MASS_FLOW_VTP_OPTION_IS_RECOMMENDED_FOR_SUPERHEATED_STEAM_MESSAGE', 1);
    } else {
      this.hideMessage('VT_OPTION_MEASURES_TEMPERATURE_COMPENSATED_MASS_FLOW_VTP_OPTION_IS_RECOMMENDED_FOR_SUPERHEATED_STEAM_MESSAGE');
    }

    if (
      electronics === 'VTP' &&
      media === 'Dry Saturated Steam'
    ) {
      this.showMessage('VTP_OPTION_MEASURES_TEMPERATURE_AND_PRESSURE_COMPENSATED_MASS_FLOW_VT_OPTION_IS_RECOMMENDED_FOR_SATURATED_STEAM_MESSAGE', 1);
    } else {
      this.hideMessage('VTP_OPTION_MEASURES_TEMPERATURE_AND_PRESSURE_COMPENSATED_MASS_FLOW_VT_OPTION_IS_RECOMMENDED_FOR_SATURATED_STEAM_MESSAGE');
    }

    if (
      electronics === 'VTP' &&
      mediaState.toUpperCase() === 'LIQUID'
    ) {
      this.showMessage('VTP_OPTION_MEASURES_TEMPERATURE_AND_PRESSURE_COMPENSATED_MASS_FLOW_V_OR_VT_OPTION_IS_RECOMMENDED_FOR_LIQUIDS_MESSAGE', 1);
    } else {
      this.hideMessage('VTP_OPTION_MEASURES_TEMPERATURE_AND_PRESSURE_COMPENSATED_MASS_FLOW_V_OR_VT_OPTION_IS_RECOMMENDED_FOR_LIQUIDS_MESSAGE');
    }

    if (
      electronics === 'VTEP'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_420MA_INPUT_1_EXTERNAL_420_MA_SENSOR_MUST_BE_CONNECTED_NOT_SUPPLIED_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_420MA_INPUT_1_EXTERNAL_420_MA_SENSOR_MUST_BE_CONNECTED_NOT_SUPPLIED_MESSAGE');
    }

    if (
      electronics === 'VETEP'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_TEMPERATURE_INPUT_AND_420MA_INPUT_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_AND_1_EXTERNAL_420_MA_SENSOR_MUST_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_TEMPERATURE_INPUT_AND_420MA_INPUT_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_AND_1_EXTERNAL_420_MA_SENSOR_MUST_MESSAGE');
    }

    if (
      electronics === 'VTEM' &&
      electronics === 'VTPEM'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_MUST_BE_CONNECTED_NOT_SUPPLIED_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_MUST_BE_CONNECTED_NOT_SUPPLIED_MESSAGE');
    }

    if (
      electronics === 'VTEPEM'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_AND_420MA_INPUT_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_AND_1_EXTERNAL_420_MA_SENSO_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_AND_420MA_INPUT_1_EXTERNAL_RTD_TEMPERATURE_SENSOR_AND_1_EXTERNAL_420_MA_SENSO_MESSAGE');
    }

    if (
      electronics === 'VETEPEM'
    ) {
      this.showMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_AND_420MA_INPUT_2_EXTERNAL_RTD_TEMPERATURE_SENSORS_AND_1_EXTERNAL_420_MA_SENS_MESSAGE', 0);
    } else {
      this.hideMessage('PLEASE_NOTE_TO_ENABLE_ENERGY_MONITORING_OPTION_AND_420MA_INPUT_2_EXTERNAL_RTD_TEMPERATURE_SENSORS_AND_1_EXTERNAL_420_MA_SENS_MESSAGE');
    }
  }

  private createVim20AccessoryData() {
    this.scopeVim20PressureSensorList();
    this.scopeVim20ProcessTemperatureList();
  }

  private createVim20Nomenclature() {
    let productCode = '';

    // Meter Type
    productCode += 'VIM20-';

    // Electronics
    const electronics = this.vim20Form.get('electronics').value;
    if (electronics) {
      productCode += `${electronics}-`;
    }

    // Probe Length
    const probeLength = this.vim20Form.get('probeLength').value;
    if (probeLength) {
      productCode += `${probeLength}-`;
    }

    // Enclosure type for electronics
    const enclosure = this.vim20Form.get('enclosure').value;
    if (enclosure) {
      productCode += `${enclosure}`;

      // Append code 'P' depending on Electronics selected
      if (electronics) {
        if (
          (enclosure === 'A25' || enclosure === 'A50') &&
          (electronics !== 'V')
        ) {
          productCode += 'P-';
        } else {
          productCode += '-';
        }
      }
    }

    // Display
    productCode += 'D';

    // Power supply type
    const powerSupply = this.vim20Form.get('powerSupply').value;
    if (powerSupply) {
      productCode += `-${powerSupply}`;
    }

    // Output signal type
    const outputSignal = this.vim20Form.get('outputSignal').value;
    if (outputSignal) {
      productCode += `-${outputSignal}`;
    }

    // Process Temperature type Standard=S or High=H
    const processTemperature = this.vim20Form.get('processTemperature').value;
    if (processTemperature) {
      productCode += `-${processTemperature}`;
    }

    // Pressure sensor type
    const pressureSensor = this.vim20Form.get('pressureSensor').value;
    if (pressureSensor) {
      if (pressureSensor !== 'None') {
        productCode += `-P${pressureSensor}`;
      } else {
        productCode += `-P0`;
      }
    }

    // Connection
    productCode += '-';

    // VIM20Connection
    const processConnection = this.vim20Form.get('processConnection').value;
    const model = this.vim20Form.get('model').value;
    const retractor = this.vim20Form.get('retractor').value;
    if (processConnection) {
      if (model === 'compression') {
        productCode += `C${processConnection}`;
      } else {
        productCode += `P${processConnection}`;
      }
    }

    if (
      retractor &&
      retractor !== 'None' &&
      retractor !== 'Removable'
    ) {
      productCode += probeLength.toLowerCase() === 'e' ? 'R-E' : 'R';
    }

    // VIM20 Approval
    const approvals = this.vim20Form.get('approvals').value;
    if (approvals) {
      productCode += `-${approvals}`;
    }

    // END
    this.vim20Form.get('productCode').setValue(productCode);
  }


  private createElmNomenclature() {
    let productCode = '';

    // Meter type
    productCode += 'ELM-';

    // Lining
    productCode += 'P-'

    // Connection
    const connection = this.elmForm.get('connection').value;
    const meterConnections = this.selectedProduct.connections;
    if (connection && meterConnections) {
      const legacyConnection = meterConnections.find(i => i.defaultText === connection);
      if (legacyConnection && legacyConnection.figureCode) {
        productCode += legacyConnection.figureCode;
      } else {
        productCode += 'XXXX';
      }
    } else {
      productCode += 'XXXX';
    }

    // Flange material
    productCode += '0';

    // Electrode material
    productCode += 'HH';

    // Transmitter mounting
    productCode += '1';

    // Approvals
    const approvals = this.elmForm.get('approvals').value ? 'B' : '0';
    productCode += approvals;

    // Transmitter type
    productCode += '-B';

    // Display and control unit
    productCode += '1';

    // Power supply
    productCode += '4';

    // Output
    const output = this.elmForm.get('output').value === 'hart' ? 'G' : 'F';
    productCode += output;

    // Branding
    productCode += '-0BX';

    // END
    this.elmForm.get('nomenclature').setValue(productCode);
    this.getElmFlowMeterExtraDetails();
  }

  private getElmExtraDetails(productCode): Promise<any> {
    return this.flowMeterService.getElmExtraDetails(productCode).toPromise();
  }

  private getElmFlowMeterExtraDetails() {
    const productCode = this.elmForm.get('nomenclature').value;
    // const productCode = 'ELM-P-03130HH1B-B14G-0BX';

    this.deduplicator.execute(this.getElmExtraDetails.bind(this), productCode).then(extraCode => {
      if (extraCode) {
        this.elmForm.get('productCode').setValue(extraCode);
      } else {
        this.elmForm.get('productCode').setValue('-');
      }
    });
  }

  private setUtm10CustomCableLength() {
    const cableLength = this.utm10Form.get('cableLength').value;
    const lengthUnits = this.getUnitId('LengthUnit');
    if (cableLength === 'XXX') {
      if (this.utm10Form.get('customCableLength').disabled) {
        this.utm10Form.get('customCableLength').enable();
      }
      switch (lengthUnits) {
        case 185:
        case 186:
          this.setUtm10CustomCableLengthDefaultInMeters();
          break;
        case 187:
        case 188:
          this.setUtm10CustomCableLengthDefaultInFeet();
          break;
      }
    } else {
      if (this.utm10Form.get('customCableLength').enabled) {
        this.utm10Form.get('customCableLength').disable();
      }
    }
  }

  private setUtm10CustomCableLengthDefaultInMeters() {
    const unitsToConvert = [{
      propertyName: 'length',
      initialValue: 33.0,
      initialUnitId: 3,
      targetUnitId: this.getUnitId('LengthUnit'),
      convertedValue: null,
    }];

    const unitsConverter = {
      unitsConverter: unitsToConvert
    };

    this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
      let length = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'length').convertedValue;
      if (this.utm10Form.get('customCableLength').value !== length) {
        this.utm10Form.get('customCableLength').setValue(length);
      }
    })
  }

  private setUtm10CustomCableLengthDefaultInFeet() {
    const unitsToConvert = [{
      propertyName: 'length',
      initialValue: 110.0,
      initialUnitId: 6,
      targetUnitId: this.getUnitId('LengthUnit'),
      convertedValue: null,
    }];

    const unitsConverter = {
      unitsConverter: unitsToConvert
    };

    this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
      let length = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'length').convertedValue;
      if (this.utm10Form.get('customCableLength').value !== length) {
        this.utm10Form.get('customCableLength').setValue(length);
      }
    })
  }

  private setUtm10ConduitLength() {
    const conduit = this.utm10Form.get('conduit').value;

    if (conduit === 'Without Conduit') {
      // Set the Conduit Length to None
      this.utm10ScopedLists.conduitLength = [];

      if (this.utm10Form.get('conduitLength').value !== 'None') {
        this.utm10Form.get('conduitLength').setValue('None');
      }

      if (this.utm10Form.get('conduitLength').enabled) {
        this.utm10Form.get('conduitLength').disable();
      }
    } else {
      // Set the Conduit Length to the same as the Cable Length
      const cableLength = this.utm10Form.get('cableLength').value;
      const customCableLength = this.utm10Form.get('customCableLength').value;

      if (this.utm10Form.get('conduitLength').value !== cableLength) {
        this.utm10Form.get('conduitLength').setValue(cableLength);
      }

      if (this.utm10Form.get('customConduitLength').value !== customCableLength) {
        this.utm10Form.get('customConduitLength').setValue(customCableLength);
      }

      // Remove 'None' from the list
      const conduitLengthList = this.enumerationService.getEnumerationCollection('ConduitLength_FlowMeterSizing');
      const available = conduitLengthList.filter(i => i.value !== '000');
      this.utm10ScopedLists.conduitLength = available.map(i => i.value);
    }
  }

  private setUtm10CustomConduitLength() {
    const conduitLength = this.utm10Form.get('conduitLength').value;
    const lengthUnits = this.getUnitId('LengthUnit');

    if (conduitLength === 'XXX') {
      // Pre populate the input in either feet (110) or meters (33)
      if (this.utm10Form.get('customConduitLength').disabled) {
        this.utm10Form.get('customConduitLength').enable();
      }

      switch (lengthUnits) {
        case 185:
        case 186:
          this.setUtm10CustomConduitLengthDefaultInMeters();
          break;
        case 187:
        case 188:
          this.setUtm10CustomConduitLengthDefaultInFeet();
          break;
      }
    } else {
      if (this.utm10Form.get('customConduitLength').enabled) {
        this.utm10Form.get('customConduitLength').disable();
      }
    }
  }

  private setUtm10CustomConduitLengthDefaultInMeters() {
    const unitsToConvert = [{
      propertyName: 'length',
      initialValue: 33.0,
      initialUnitId: 3,
      targetUnitId: this.getUnitId('LengthUnit'),
      convertedValue: null,
    }];

    const unitsConverter = {
      unitsConverter: unitsToConvert
    };

    this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
      let length = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'length').convertedValue;
      if (this.utm10Form.get('customConduitLength').value !== length) {
        this.utm10Form.get('customConduitLength').setValue(length);
      }
    })
  }

  private setUtm10CustomConduitLengthDefaultInFeet() {
    const unitsToConvert = [{
      propertyName: 'length',
      initialValue: 110.0,
      initialUnitId: 6,
      targetUnitId: this.getUnitId('LengthUnit'),
      convertedValue: null,
    }];

    const unitsConverter = {
      unitsConverter: unitsToConvert
    };

    this.unitsService.unitsConverter(unitsConverter).subscribe(unitsConvertedData => {
      let length = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'length').convertedValue;
      if (this.utm10Form.get('customConduitLength').value !== length) {
        this.utm10Form.get('customConduitLength').setValue(length);
      }
    })
  }

  private createUtm10Nomenclature() {
    if (!this.selectedProduct) {
      return;
    }

    let productCode = '';

    const meterType = this.selectedProduct.type;
    productCode += meterType;

    const model = this.utm10Form.get('model').value;
    if (model) {
      productCode += `-${model}`;
    }

    const electricalPower = this.utm10Form.get('electricalPower').value;
    if (electricalPower) {
      productCode += `-${electricalPower}`;
    }

    const digitalCommunications = this.utm10Form.get('digitalCommunications').value;
    if (digitalCommunications) {
      productCode += `-${digitalCommunications}`;
    }

    const temperatureRange = this.utm10Form.get('temperatureRange').value;
    if (temperatureRange) {
      productCode += `-${temperatureRange}`;
    }

    const utm10Approvals = this.utm10Form.get('utm10Approvals').value;
    if (utm10Approvals) {
      productCode += `-${utm10Approvals}`;
    }

    this.utm10Form.get('electronicsCode').setValue(productCode);
  }

  private createUtt10Nomenclature() {
    if (!this.selectedProduct) {
      return;
    }

    let productCode = '';
    const uttType: string = this.selectedProduct.uttType;

    const shouldConvertCableLength: boolean = this.utm10Form.get('cableLength').value === 'XXX';
    const shouldConvertConduitLength: boolean = this.utm10Form.get('conduitLength').value === 'XXX';

    const unitsToConvert = [{
      propertyName: 'temperature',
      initialValue: this.processConditions.get('temperature').value,
      initialUnitId: this.getUnitId('TemperatureUnit'),
      targetUnitId: 146,
      convertedValue: null,
    }];

    if (shouldConvertCableLength) {
      unitsToConvert.push({
        propertyName: 'customCableLength',
        initialValue: this.utm10Form.get('customCableLength').value,
        initialUnitId: this.getUnitId('LengthUnit'),
        targetUnitId: 6,
        convertedValue: null,
      });
    }

    if (shouldConvertConduitLength) {
      unitsToConvert.push({
        propertyName: 'customConduitLength',
        initialValue: this.utm10Form.get('customConduitLength').value,
        initialUnitId: this.getUnitId('LengthUnit'),
        targetUnitId: 6,
        convertedValue: null,
      });
    }

    const unitsConverter = {
      unitsConverter: unitsToConvert
    };

    this.deduplicator.execute(this.convertUnits.bind(this), unitsConverter).then(unitsConvertedData => {
      let temperatureC = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'temperature').convertedValue;
      let convertedCustomCableLength = 0;
      let convertedCustomConduitLength = 0;

      if (shouldConvertCableLength) {
        convertedCustomCableLength = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'customCableLength').convertedValue;
      }

      if (shouldConvertConduitLength) {
        convertedCustomConduitLength = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'customConduitLength').convertedValue;
      }


      // UTT type
      if (temperatureC > 121.3) {
        const u = uttType.split('-');
        if (!u[0] || !u[2]) {
          console.error('Product UTT type is malformed. Contact support.');
          // debugger;
        } else {
          productCode += `${u[0]}-050H-${u[2]}`;
          this.selectedProduct.uttType = productCode;
          this.setUtm10SubmersibleOptions();
        }
      } else {
        productCode += uttType;
      }


      // Cable length
      if (shouldConvertCableLength) {
        let cableLength = Math.round(convertedCustomCableLength);

        if ((cableLength % 10) != 0) {
          let roundup = 10 - (cableLength % 10);
          cableLength = cableLength + roundup;
        }

        productCode += `-${cableLength}`;
      } else {
        productCode += `-${this.utm10Form.get('cableLength').value}`;
      }


      // Submersible & Conduit
      const submersible = this.utm10Form.get('submersible').value;
      const conduit = this.utm10Form.get('conduitLength').value;
      if (submersible === 'Submersible') {
        if (conduit === 'Without Conduit') {
          // Check if it is a UTT10-050S or UTT10-050L
          productCode += `-${this.selectedProduct.uttType.includes('UTT10-050S') ? 'S' : 'T'}`;
        } else if (conduit === 'With Conduit') {
          productCode += '-V';
        }
      } else {
        // Non Submersible
        productCode += `-${conduit === 'Without Conduit' ? 'N': 'A'}`;
      }


      // Conduit length
      if (shouldConvertConduitLength) {
        let conduitLength = Math.round(convertedCustomConduitLength);

        if ((conduitLength % 10) != 0) {
          let roundup = 10 - (conduitLength % 10);
          conduitLength = conduitLength + roundup;
        }

        productCode += `-${conduitLength}`;
      } else {
        productCode += `-${this.utm10Form.get('conduitLength').value}`;
      }


      // UTT10 Approvals
      const utt10Approvals = this.utm10Form.get('utt10Approvals').value;
      if (utt10Approvals) {
        productCode += `-${utt10Approvals}`;
      }


      // END
      this.utm10Form.get('transducerCode').setValue(productCode);
    }).catch(console.error);
  }

  private createUtm10AccessoryData() {
    if (!this.selectedProduct) {
      return;
    }

    let mountingTracksList = this.enumerationService.getEnumerationCollection('MountingTrack_FlowMeterSizing');
    let submersibleList = this.enumerationService.getEnumerationCollection('Submersible_FlowMeterSizing');
    let utt10ApprovalsList = this.enumerationService.getEnumerationCollection('Approvals_FlowMeterSizing');

    const model: string = this.utm10Form.get('model').value;

    if (model.includes('UTT10-050S')) {
      // ID 795 is missing in DB, so we don't filter
      this.utm10Form.get('mountingTracks').enable();
      this.utm10Form.get('utt10Approvals').enable();
    } else if (model.includes('UTT10-050L')) {
      mountingTracksList = mountingTracksList.filter(i =>
        i.value !== 'UTMT-10' &&
        i.value !== 'UTMT-16'
      );
      this.utm10Form.get('mountingTracks').disable();

      utt10ApprovalsList = utt10ApprovalsList.filter(i => i.value !== 'F');
      this.utm10Form.get('utt10Approvals').disable();
    } else {
      mountingTracksList = mountingTracksList.filter(i =>
        i.value !== 'UTMT-10' &&
        i.value !== 'UTMT-16'
      );
      this.utm10Form.get('mountingTracks').disable();

      utt10ApprovalsList = utt10ApprovalsList.filter(i => i.value !== 'F');
      this.utm10Form.get('utt10Approvals').disable();
    }

    this.utm10ScopedLists.mountingTracks = mountingTracksList.map(i => i.value);
    this.utm10ScopedLists.submersible = submersibleList.map(i => i.value);
    this.utm10ScopedLists.utt10Approvals = utt10ApprovalsList.map(i => i.value);
  }

  private convertUnits(data: UnitsConverter): Promise<any> {
    return this.unitsService.unitsConverter(data).toPromise();
  }

  private setUtm10ModelOptions() {
    let temperatureRangeList = this.enumerationService.getEnumerationCollection('TemperatureRange_FlowMeterSizing');
    let rtdList = this.enumerationService.getEnumerationCollection('RTDKit_FlowMeterSizing');
    let digitalCommunicationsList = this.enumerationService.getEnumerationCollection('DigitalCommunications1_FlowMeterSizing');

    const model = this.utm10Form.get('model').value;
    if (model === 'S') {
      // Velocity Meter
      this.utm10Form.get('temperatureRange').disable();

      rtdList = rtdList.filter(i =>
        i.value !== 'URTD-C-20' &&
        i.value !== 'URTD-C-50' &&
        i.value !== 'URTD-C-100'
      );
      this.utm10Form.get('rtd').disable();

      digitalCommunicationsList = digitalCommunicationsList.filter(i => i.value !== 'P');

      this.utm10ScopedLists.temperatureRange = temperatureRangeList.map(i => i.value);
    } else {
      // Energy Meter
      temperatureRangeList = temperatureRangeList.filter(i => i.value !== '0');
      this.utm10Form.get('temperatureRange').enable();

      rtdList = rtdList.filter(i => i.value !== 'N/A');
      this.utm10Form.get('rtd').enable();

      // Convert and check t1 and filter the temperature range if needed
      const unitsToConvert = [{
        propertyName: 'temperature',
        initialValue: this.processConditions.get('temperature').value,
        initialUnitId: this.getUnitId('TemperatureUnit'),
        targetUnitId: 147,
        convertedValue: null,
      }];

      const unitsConverter = {
        unitsConverter: unitsToConvert
      };

      this.deduplicator.execute(this.convertUnits.bind(this), unitsConverter).then(unitsConvertedData => {
        let temperatureF = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'temperature').convertedValue;

        // Lower temperature checks - these will never be hit at the moment as validation on the client side prohibits temperatures less than 32F
        // However that may change so I'm leaving these checks in
        if (temperatureF < 32) {
          temperatureRangeList = temperatureRangeList.filter(i =>
            i.value !== '1' &&
            i.value !== '2'
          );
        }

        if (temperatureF < -40) {
          temperatureRangeList = temperatureRangeList.filter(i => i.value !== '3');
        }

        // upper temperature checks
        if (temperatureF > 122) {
          temperatureRangeList = temperatureRangeList.filter(i => i.value !== '1');
        }

        if (temperatureF > 212) {
          temperatureRangeList = temperatureRangeList.filter(i => i.value !== '2');
        }

        if (temperatureF > 350) {
          temperatureRangeList = temperatureRangeList.filter(i => i.value !== '3');
        }

        if (!temperatureRangeList.length) {
          // Disable temperature range select if no available options left
          this.utm10Form.get('temperatureRange').disable();
        }

        this.utm10ScopedLists.temperatureRange = temperatureRangeList.map(i => i.value);
      });
    }

    this.utm10ScopedLists.rtd = rtdList.map(i => i.value);
    this.utm10ScopedLists.digitalCommunications = digitalCommunicationsList.map(i => i.value);
  }

  private setUtm10SubmersibleOptions() {
    let submersibleList = this.enumerationService.getEnumerationCollection('Submersible_FlowMeterSizing');

    const uttType = this.selectedProduct.uttType;
    if (uttType && uttType.includes('050H')) {
      submersibleList = submersibleList.filter(i => i.value !== 'Submersible');
      this.utm10ScopedLists.submersible = submersibleList.map(i => i.value);
      if (this.utm10Form.get('submersible').enabled) {
        this.utm10Form.get('submersible').disable();
      }
      return;
    } else {
      if (this.utm10Form.get('submersible').disabled) {
        this.utm10Form.get('submersible').enable();
      }
    }

    let pipeSizeStr = '0';
    let pipeSize = 0;

    const meterPipeSize: string = this.selectedProduct.pipeSize;
    if (meterPipeSize.startsWith('DN')) {
      pipeSizeStr = meterPipeSize.substring(2, meterPipeSize.indexOf(' ') - 2);
    } else {
      pipeSizeStr = meterPipeSize.substring(
        meterPipeSize.indexOf('DN'),
        meterPipeSize.indexOf(')') - meterPipeSize.indexOf('DN')
      );
      pipeSizeStr = pipeSizeStr.substring(2);
    }

    try {
      pipeSize = parseInt(pipeSizeStr, 10);
    } catch (e) {
      // String was not an integer number!
      pipeSize = 0;
      debugger;
      if (this.utm10Form.get('submersible').disabled) {
        this.utm10Form.get('submersible').enable();
      }
    }

    if (isNaN(pipeSize)) {
      // String was not an integer number!
      pipeSize = 0;
      debugger;
      if (this.utm10Form.get('submersible').disabled) {
        this.utm10Form.get('submersible').enable();
      }
    }

    if (pipeSize < 50) {
      if (!uttType.includes('050S') && !uttType.includes('050L')) {
        submersibleList = submersibleList.filter(i => i.value !== 'Submersible');
        this.utm10ScopedLists.submersible = submersibleList.map(i => i.value);

        if (this.utm10Form.get('submersible').enabled) {
          this.utm10Form.get('submersible').disable();
        }

        return;
      } else {
        if (this.utm10Form.get('submersible').disabled) {
          this.utm10Form.get('submersible').enable();
        }
      }
    } else {
      if (this.utm10Form.get('submersible').disabled) {
        this.utm10Form.get('submersible').enable();
      }
    }
  }

  private setUtm10ConduitOptions() {
    const conduitList = this.enumerationService.getEnumerationCollection('Conduit_FlowMeterSizing');

    if (conduitList.length > 1) {
      if (this.utm10Form.get('conduit').disabled) {
        this.utm10Form.get('conduit').enable();
      }
    } else {
      if (this.utm10Form.get('conduit').enabled) {
        this.utm10Form.get('conduit').disable();
      }
    }
  }

  private setUtm10ApprovalsOptions() {
    let approvalsList = this.enumerationService.getEnumerationCollection('UTM10Approvals_FlowMeterSizing');
    const electricalPower = this.utm10Form.get('electricalPower').value;

    if (electricalPower === 'C') {
      approvalsList = approvalsList.filter(i => i.value !== 'F')
    }

    this.utm10ScopedLists.utm10Approvals = approvalsList.map(i => i.value);

    if (approvalsList.length > 1) {
      if (this.utm10Form.get('utm10Approvals').disabled) {
        this.utm10Form.get('utm10Approvals').enable();
      }
    } else {
      if (this.utm10Form.get('utm10Approvals').enabled) {
        this.utm10Form.get('utm10Approvals').disable();
      }
    }
  }

  private validateUtm10LengthInput(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      const length = +control.value;

      if (isNaN(length)) {
        return of({
          notANumber: 'UNEXPECTED ERROR (UTM10 custom length)'
        });
      }

      const payload = {
        length: length,
        lengthUnit: this.getUnitId('LengthUnit')
      };

      return this.flowMeterService.validateUtm10Length(payload).pipe(
        map(response => {
          // If status is OK, that means no validation errors from server
          // So just mark validator as OK:
          // Return nothing if no errors encountered
          return null;
        }),
        catchError((response) => {
          console.log('ERR', response);

          if (response.error && response.error.errors) {
            return of(response.error.errors);
          }

          // At this point, something strange happened, probably the server is down.
          console.error('UNEXPECTED ERROR (UTM10 custom length)', response);
          return of(null);
        })
      );
    }
  }
}
