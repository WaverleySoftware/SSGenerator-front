import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { BenchmarkResBenchmarkInterface } from "../../interfaces/calc-benchmark-res.interface";
import { SelectedUnitsInterface } from "../../interfaces/selectedUnits.interface";

@Component({
  selector: 'app-final-proposal-summary-sub-tab',
  templateUrl: './final-proposal-summary-sub-tab.component.html',
  styleUrls: ['./final-proposal-summary-sub-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinalProposalSummarySubTabComponent implements OnInit {
  @Input() current: BenchmarkResBenchmarkInterface;
  @Input() originalCurrent: BenchmarkResBenchmarkInterface;
  @Input() potential: BenchmarkResBenchmarkInterface;
  @Input() originalPotential: BenchmarkResBenchmarkInterface;
  @Input() units: { [key: number]: string };
  @Input() currency: string;
  @Input() fuelTypeList: { [key: string]: string };
  @Input() selectedUnits: SelectedUnitsInterface;

  constructor() { }

  ngOnInit() {
  }

	get massFlowUnit(): string {
		if (
			!this.units ||
			!this.selectedUnits ||
			!this.selectedUnits.massFlowUnitSelected ||
			!this.units[this.selectedUnits.massFlowUnitSelected]
		) return '-';

		return this.units[this.selectedUnits.massFlowUnitSelected].replace('/yr', '')
	}

	get fuelEnergyData(): {current: number; potential: number; unit: string } {
		if (this.units && this.selectedUnits && this.selectedUnits.energyUnitSelected === 244) { // 244 = MMbtu
			return {
				unit: this.units[this.selectedUnits.energyUnitSelected] || '-',
				current: this.current && this.current.qfuel || 0,
				potential: this.potential && this.potential.qfuel || 0
			}
		}

		if (this.units && this.selectedUnits && this.selectedUnits.energyUnitSelected === 243) { // 243 = Mbtu
			return {
				unit: this.units[244] || '-',
				current: this.current && this.current.qfuel * 1000 || 0,
				potential: this.potential && this.potential.qfuel * 1000 || 0
			}
		}

		return {
			unit: 'GJ',
			current: this.originalCurrent && this.originalCurrent.qfuel * 0.0036 || 0,
			potential: this.originalPotential && this.originalPotential.qfuel * 0.0036 || 0
		}
	}
}
