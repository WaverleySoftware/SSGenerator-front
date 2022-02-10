import { Component, Input, OnInit } from "@angular/core";
import { ChartBarDataInterface, ChartBarOptionsInterface } from "../../interfaces/chart-bar.interface";

@Component({
  selector: 'app-sga-final-proposal',
  templateUrl: './sga-final-proposal.component.html',
  styleUrls: ['./sga-final-proposal.component.scss']
})
export class SgaFinalProposalComponent implements OnInit {
  @Input() chartData: ChartBarDataInterface[] = [
    { data: [272, 152, 80, 81, 56, 55, 0], label: 'Fuel' },
    { data: [0, 84, 40, 19, 86, 27, 0], label: 'Water and Chemicals' },
    { data: [0, 52, 41, 10, 80, 20, 0], label: 'Effluent' },
    { data: [46, 18, 41, 10, 80, 20, 0], label: 'Carbont tax' },
  ];
  public chartLabels: string[] = [
    'Increase boiler effiency',
    'Increase condensate return',
    'water treatment plant (RO)',
    'auto tds control',
    'auto TDS and Flash Heat Recovery',
    'Auto tds flash recovery + heat exchanger',
    'Direct steam injection feedtank'
  ];
  public costSteamGenerationChart: ChartBarDataInterface[] = [
    { data: [152, 153], label: 'Fuel' },
    { data: [84, 70], label: 'Water and Chemicals' },
    { data: [52, 45], label: 'Effluent' },
    { data: [18, 10], label: 'Carbont tax' },
  ];
  public costSteamGenerationChartLabels: string[] = ['POTENTIAL', 'CURRENT'];
  public costSteamGenerationChartOptions: ChartBarOptionsInterface = {
    layout: {
      padding: 0,
    },
    scales: {
      xAxes: [{
        stacked: true,
        maxBarThickness: 58,
        display: false,
        gridLines: {
          display: false,
        },
      }],
      yAxes: [{
        stacked: true,
        maxBarThickness: 58,
        display: true,
        gridLines: {
          display: false,
        },
        ticks: {
          fontColor: '#002D72',
          beginAtZero: true,
        }
      }]
    }
  }
  constructor() { }

  ngOnInit() {
  }

}
