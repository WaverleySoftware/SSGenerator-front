export interface ChartBarColorsInterface {
  backgroundColor?: string;
  color?: string;
  fontColor?: string;
}

export interface ChartBarDataInterface {
  data: Array<number>;
  label?: string;
  stack?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
}

export interface ChartBarOptionsInterface {
  scaleShowVerticalLines?: boolean;
  maintainAspectRatio?: boolean;
  responsive?: boolean;
  legend?: {
    display?: boolean,
    fullSize?: boolean,
    align?: 'start' | 'end' | 'center',
    labels?: {
      fontColor?: string;
      textAlign?: 'left' | 'right' | 'center';
      padding?: number;
      generateLabels?: (chart: any) => void;
    }
  },
  tooltips?: {
    enabled?: boolean;
    usePointStyle?: boolean;
    callbacks?: {
      title?: (tooltipItem: any, data: any) => any,
      label?: (tooltipItem: any, data: any) => any,
      labelColor?: (context: any) => any;
      labelTextColor?: (context: any) => any;
    }
  },
  hover?: {
    mode?: null | string;
    intersect?: boolean;
  },
  layout?: {
    padding?: number | {
      left: number;
      right: number;
      top: number;
      bottom:number;
    }
  },
  scales?: {
    xAxes?: {
      position?: 'left' | 'right' | 'center',
      stacked?: boolean;
      display?: boolean;
      maxBarThickness?: number;
      scaleLabel?: boolean;
      ticks?: {
        showLabelBackdrop?: boolean;
        fontColor?: string;
        beginAtZero?: boolean;
        max?: number;
        min?: number;
        stepSize?: number;
        fontSize?: number;
        callback?: (label: string | number, index: number, labels: any[]) => string | number | string[];
      },
      gridLines?: {
        display?: boolean;
        drawBorder?: boolean;
        offsetGridLines?: boolean;
        zeroLineColor?: string;
        color?: string;
      },
    }[],
    yAxes?: {
      position?: 'left' | 'right' | 'center',
      stacked?: boolean;
      display?: boolean;
      maxBarThickness?: number;
      scaleLabel?: boolean;
      ticks?: {
        showLabelBackdrop?: boolean;
        fontColor?: string;
        beginAtZero?: boolean;
        max?: number;
        min?: number;
        stepSize?: number;
        fontSize?: number;
        callback?: (label: string | number, index: number, labels: any[]) => string | number | string[];
      },
      gridLines?: {
        display?: boolean;
        drawBorder?: boolean;
        offsetGridLines?: boolean;
        zeroLineColor?: string;
        color?: string;
      },
    }[]
  }
}
