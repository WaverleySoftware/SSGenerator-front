import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ChartBarDataInterface } from "../../interfaces/chart-bar.interface";
import { ProposedDataInterface } from "../../interfaces/steam-generation-form.interface";
import { filter, pairwise, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { SgaApiService } from "../../services/sga-api.service";
import { SgaFormService } from "../../services/sga-form.service";
import { horizontalChart, verticalChart, verticalChartLabels } from "../../utils/proposed-setup-def-data";
import { SgaTotalSavingInterface } from "../../interfaces/sga-chart-data.Interface";
import { ProposedSetupTFormInterface, TForm } from "../../interfaces/forms.interface";
import { loadSgaUnits } from "../../utils/load-sga-units";
import { UnitsService } from "sizing-shared-lib";

@Component({
  selector: 'app-sga-proposed-setup',
  templateUrl: './sga-proposed-setup.component.html',
  styleUrls: ['./sga-proposed-setup.component.scss']
})
export class SgaProposedSetupComponent implements OnInit {
  @Input() isEconomizerPresent: boolean;
  @Input() set data(v ) {
    this.data_ = v;
    if (!v || (!v.proposedSetup && !v.features && !this.proposedFormPanel)) {
      this.proposedFormPanel = true;

      if (this.initialTdsControls) {
        this.initialTdsControls = null;
      }
    }

    if (!this.initialTdsControls && v && v.features) {
      this.initialTdsControls = {
        addAutoTdsControls: v.features.addAutoTdsControls,
        addAutoTdsAndFlashRecovery: v.features.addAutoTdsAndFlashRecovery,
        addAutoTdsAndFlashRecoveryPlusHearExchanger: v.features.addAutoTdsAndFlashRecoveryPlusHearExchanger,
        addWaterTreatmentPlant: !v.features.addWaterTreatmentPlant
      }
    }
  };
  private data_: ProposedDataInterface
  get data(): ProposedDataInterface { return this.data_; }
  @Input() currency: string;
	@Input('verticalChart') verticalChartData: ChartBarDataInterface[];
	@Input('horizontalChart') horizontalChartData: ChartBarDataInterface[];
	@Input() totalSaving: SgaTotalSavingInterface;
  @Output() generateProposed: EventEmitter<any> = new EventEmitter<{proposalInputs: ProposedDataInterface, isFinal?: boolean}>();
  @Output() resetFinalProposal = new EventEmitter<any>();
  private ngUnsubscribe = new Subject<void>();
  units: { [key: number]: string };
  verticalChartLabels: string[] = verticalChartLabels;
  proposedFormPanel = true;
  form: TForm<ProposedSetupTFormInterface> = this.formService.getProposedSetupForm();
  initialTdsControls: {[key: string]: boolean};

  constructor(
    private apiService: SgaApiService,
    private formService: SgaFormService,
    private unitsService: UnitsService
  ) {
    this.form.get('proposedSetup').valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      pairwise(),
      filter(v => !!v && !!v[0] && !!v[1] && JSON.stringify(v[0]) !== JSON.stringify(v[1]))
    ).subscribe((data) => this.resetFinalProposal.emit(data));
  }

  get isCondensateReturnDisable(): boolean {
    const fg: FormGroup = this.form.get('proposedSetup') as FormGroup;
    return fg.get('proposalCondensateReturnedPercentage').value === fg.get('benchmarkCondensateReturnedPercentage').value &&
      fg.get('benchmarkCondensateReturn').value === fg.get('proposalCondensateReturned').value;
  }

  ngOnInit() {
    loadSgaUnits(this.unitsService).then(units => this.units = units);
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.proposedFormPanel = false;
    this.form.get('proposedSetup').markAsUntouched();
    this.form.get('proposedSetup').markAsPristine();
    this.generateProposed.emit({proposalInputs: this.form.getRawValue()});
  }

  economizerChange(economiserRequired) {
    const proposal = this.form.get('proposedSetup.proposalBoilerEfficiency');
    const current = this.form.get('proposedSetup.benchmarkBoilerEfficiency');
    const params = {
      economiserRequired,
      benchmarkBoilerEfficiency: current.value || 0,
      proposalBoilerEfficiency: proposal.value || 0,
    };

    if (proposal.invalid) {
      params.proposalBoilerEfficiency = this.data
        && this.data.proposedSetup
        && this.data.proposedSetup.proposalBoilerEfficiency;

      if (!economiserRequired) {
        proposal.markAsUntouched();
        proposal.markAsPristine();
        proposal.patchValue(params.proposalBoilerEfficiency, {emitEvent: false});
        return;
      }
    }

    this.apiService.calculateProposedBoilerEfficiency(params)
      .pipe(takeUntil(this.ngUnsubscribe), filter((res) => !!res && !!res.proposalBoilerEfficiency))
      .subscribe(({proposalBoilerEfficiency}) => {
        proposal.markAsUntouched();
        proposal.markAsPristine();
        proposal.patchValue(proposalBoilerEfficiency, {emitEvent: false});
      });
  }

  changeFeature(changed?: Event) {
    this.form.get('proposedSetup').markAsUntouched();
    this.form.get('proposedSetup').markAsPristine();
    this.generateProposed.emit({proposalInputs: this.form.getRawValue(), isFinal: true});
  }
}
