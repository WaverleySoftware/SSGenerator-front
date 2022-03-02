import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { ProposedDataInterface, SteamGeneratorInputsInterface } from '../../interfaces/steam-generation-form.interface';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SgaApiService } from '../../services/sga-api.service';
import { SgaFormService } from '../../services/sga-form.service';
import { horizontalChart, verticalChart, verticalChartLabels } from '../../utils/proposed-setup-def-data';
import generateChartsData from '../../utils/generate-charts-data';

@Component({
  selector: 'app-sga-proposed-setup',
  templateUrl: './sga-proposed-setup.component.html',
  styleUrls: ['./sga-proposed-setup.component.scss']
})
export class SgaProposedSetupComponent {
  // Outer data
  @Input() inputData: SteamGeneratorInputsInterface;
  @Input() currency: string;
  @Input() units: { [key: number]: string };
  @Output() generateProposed: EventEmitter<{proposedSetup: any, features: any}> = new EventEmitter<{proposedSetup: any, features: any}>();
  @Output() nextTabHandle: EventEmitter<any> = new EventEmitter<any>();

  // Setter / Getter
  private proposedResults: any[];
  @Input() set results(data: any[]) {
    this.proposedResults = data;
    const { verticalChartData, horizontalChartData, total } = generateChartsData(data);
    this.verticalChartData = verticalChartData;
    this.horizontalChartData = horizontalChartData;
    this.totalSaving = {
      savingsIncludingCondensateEffluent: total.savingsIncludingCondensateEffluent,
      steamGenerationSavings: total.steamGenerationSavings
    };

    if (!data && !this.proposedFormPanel) {
      this.proposedFormPanel = true;
    }
  }
  get results() { return this.proposedResults; }
  private proposedData: ProposedDataInterface;
  @Input() set data(data: ProposedDataInterface) {
    if (data && data.proposedSetup && data.features && this.form) {
      this.form.patchValue({ proposedSetup: data.proposedSetup, features: data.features }, {emitEvent: false});
    } else if (this.proposedData && !data) {
      this.resetData();
    }

    this.proposedData = data;
  }
  get data(): ProposedDataInterface { return this.proposedData; }

  // inner data
  private ngUnsubscribe = new Subject<void>();
  public verticalChartData: ChartBarDataInterface[] = verticalChart;
  public horizontalChartData: ChartBarDataInterface[] = horizontalChart;
  public verticalChartLabels: string[] = verticalChartLabels;
  public proposedFormPanel = true;
  public form = this.formService.getProposedSetupForm();
  public totalSaving: {steamGenerationSavings: number, savingsIncludingCondensateEffluent: number};

  constructor(private apiService: SgaApiService, private formService: SgaFormService) {}

  private resetData() {
    this.verticalChartData = verticalChart;
    this.horizontalChartData = horizontalChart;
    if (this.form && this.form.setValue) { this.form.reset(); }
  }

  get isCondensateReturnDisable(): boolean {
    const fg: FormGroup = this.form.get('proposedSetup') as FormGroup;
    return fg.get('proposalCondensateReturnedPercentage').value === fg.get('benchmarkCondensateReturnedPercentage').value &&
      fg.get('benchmarkCondensateReturn').value === fg.get('proposalCondensateReturned').value;
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.proposedFormPanel = false;
    this.form.get('proposedSetup').markAsUntouched();
    this.form.get('proposedSetup').markAsPristine();
    this.generateProposed.emit(this.form.getRawValue());
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
      params.proposalBoilerEfficiency = this.data.proposedSetup.proposalBoilerEfficiency;

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
    this.generateProposed.emit(this.form.getRawValue());
  }
}
