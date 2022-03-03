import { ChartBarOptionsInterface } from '../interfaces/chart-bar.interface';

export default {
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
} as ChartBarOptionsInterface;
