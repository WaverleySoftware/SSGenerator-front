import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild
} from "@angular/core";
import { BaseChartDirective } from 'ng2-charts/ng2-charts';
import { mergeDeep } from "../../utils/merge-deep";
import {
  ChartBarColorsInterface,
  ChartBarDataInterface,
  ChartBarOptionsInterface
} from "../../interfaces/chart-bar.interface";

@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartBarComponent implements AfterViewInit {
  @Input() data: ChartBarDataInterface[];
  @Input() colors: ChartBarColorsInterface[] = [
    {backgroundColor: '#EC9231'},
    {backgroundColor: '#626F9D'},
    {backgroundColor: '#BCC0D6'},
    {backgroundColor: '#6BA4B8'}
  ];
  @Input() labels: string[];
  @Input() className: string;
  @Input() style: { [p: string]: any } | null;
  @Input() legend: boolean = true;
  @Input() type: 'horizontalBar' | 'bar' = 'bar';
  // Options: START
  private _options: ChartBarOptionsInterface = {
    scaleShowVerticalLines: true,
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
      fullSize: true,
      align: 'start',
      labels: {
        fontColor: '#002D72',
        textAlign: 'left',
        padding: 20,
      }
    },
    tooltips: {
      enabled: false
    },
    hover: {
      mode: null
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    },
    scales: {
      xAxes: [{
        stacked: true,
        maxBarThickness: 96,
        gridLines: {
          display: false,
          zeroLineColor: '#002D72',
          color: '#E1EDF1',
        },
        ticks: {
          fontColor: '#002D72',
          fontSize: 12,
          beginAtZero: true,
          callback: ChartBarComponent.formatLabels
        }
      }],
      yAxes: [{
        stacked: true,
        scaleLabel: false,
        gridLines: {
          display: true,
          zeroLineColor: '#002D72',
          color: '#E1EDF1',
        },
        ticks: {
          fontColor: '#002D72',
          fontSize: 12,
          beginAtZero: true,
          callback: ChartBarComponent.formatLabels
        }
      }]
    },
  };
  get options(): ChartBarOptionsInterface {
    return this._options;
  }
  @Input() set options(val) {
    this._options = mergeDeep(this._options, val);
  };
  // Options: END
  @ViewChild('chartBarRef', { static: false }) chartRef: BaseChartDirective;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngAfterViewInit() {
    if (this.chartRef && this.chartRef.chart && this.chartRef.chart.data) {
      this.changeDetectorRef.detectChanges();
    }
  }

  public legendClick(legendItem) {
    if (this.chartRef.chart && this.chartRef.chart.data && this.chartRef.chart.data.datasets) {
      this.chartRef.chart.data.datasets[legendItem.datasetIndex].hidden
        = legendItem.hidden
        = !this.chartRef.chart.data.datasets[legendItem.datasetIndex].hidden;
      this.chartRef.chart.update();
    }
  }

  private static formatLabels(label: string | number, index: number, labels: any[]): string | number | string[] {
    if (typeof label !== 'string') return label;

    if (/\s/.test(label)) {
      return label.toUpperCase().split(" ");
    } else{
      return (label || '').toUpperCase();
    }
  }
}
