import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ChartBarDataInterface } from "../../interfaces/chart-bar.interface";
import { ProposedDataInterface } from "../../interfaces/steam-generation-form.interface";
import { filter, pairwise, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { SgaApiService } from "../../services/sga-api.service";
import { SgaFormService } from "../../services/sga-form.service";
import { horizontalChart, verticalChart, verticalChartLabels } from "../../utils/proposed-setup-def-data";
import { SgaTotalSavingInterface } from "../../interfaces/sga-chart-data.Interface";
import { InputParametersTFormInterface, ProposedSetupTFormInterface, TForm } from "../../interfaces/forms.interface";

@Component({
  selector: 'app-sga-proposed-setup',
  templateUrl: './sga-proposed-setup.component.html',
  styleUrls: ['./sga-proposed-setup.component.scss']
})
export class SgaProposedSetupComponent implements OnInit {
  private readonly reverseOsmosisId = 'fb8d5710-4b05-44d9-a21e-a3d5c697d7ce';
  @Input() isEconomizerPresent: boolean;
  @Input() data: ProposedDataInterface
  @Input() currency: string;
	@Input('verticalChart') verticalChartData: ChartBarDataInterface[];
	@Input('horizontalChart') horizontalChartData: ChartBarDataInterface[];
	@Input() totalSaving: SgaTotalSavingInterface;
  @Output() generateProposed: EventEmitter<any> = new EventEmitter<{proposalInputs: ProposedDataInterface, isFinal?: boolean}>();
  @Output() resetFinalProposal = new EventEmitter<any>();
  @Input() units: { [key: number]: string };
  private ngUnsubscribe = new Subject<void>();
  verticalChartLabels: string[] = verticalChartLabels;
  form: TForm<ProposedSetupTFormInterface> = this.formService.getProposedSetupForm();
  inputParamsFg: TForm<InputParametersTFormInterface> = this.formService.getInputParamsFg();

  constructor(private apiService: SgaApiService, private formService: SgaFormService) {
    this.form.get('proposedSetup').valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      pairwise(),
      filter(v => !!v && !!v[0] && !!v[1] && JSON.stringify(v[0]) !== JSON.stringify(v[1]))
    ).subscribe((data) => this.resetFinalProposal.emit(data));

    this.form.get('proposedSetup.proposalCondensateReturnedPercentage').statusChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        if (status === 'VALID') {
          const val = this.form.get('proposedSetup.proposalCondensateReturnedPercentage').value;
          const valByOnePercent = this.form.get('proposedSetup.benchmarkCondensateReturn').value /
            this.form.get('proposedSetup.benchmarkCondensateReturnedPercentage').value;

          this.form
            .get('proposedSetup.proposalCondensateReturned')
            .setValue(Math.round((val * valByOnePercent) * 100) / 100);
        }
      });
  }

  get isTdsControlPresent(): {
    isAutoTds: boolean;
    isFlashVessel: boolean;
    isHeatExchanger: boolean;
    isWaterTreatmentPlant: boolean
  } {
    return {
      isAutoTds: this.inputParamsFg.get('benchmarkInputs.isAutoTdsControlPResent').value,
      isFlashVessel: this.inputParamsFg.get('benchmarkInputs.isFlashVesselPresent').value,
      isHeatExchanger: this.inputParamsFg.get('benchmarkInputs.isHeatExchangerPresent').value,
      isWaterTreatmentPlant: this.inputParamsFg.get('benchmarkInputs.waterTreatmentMethod').value === this.reverseOsmosisId
    }
  }

  ngOnInit() {}

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

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
        this.resetFinalProposal.emit({proposalBoilerEfficiency});
      });
  }

  changeFeature(changed?: Event) {
    this.form.get('proposedSetup').markAsUntouched();
    this.form.get('proposedSetup').markAsPristine();
    this.generateProposed.emit({proposalInputs: this.form.getRawValue(), isFinal: true});
  }
}
