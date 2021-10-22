import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { BaseSizingModule, JobSizing, Project } from "sizing-shared-lib";
import { FormGroup } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnInit {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  moduleId = 2;
  productName = 'Steam Generation Assessment';
  sizingModuleForm: FormGroup;
  @ViewChild('chartRef', { static: true }) chartRef: ElementRef;
  public barChartColors = [
    {backgroundColor: '#EC9231'},
    {backgroundColor: '#626F9D'},
    {backgroundColor: '#BCC0D6'},
    {backgroundColor: '#6BA4B8'}
  ];
  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
      position: 'top',
      align: 'start',
    },
    tooltips: {
      enabled: false
    },
    scales: {
      xAxes: [{
        display: false,
        gridLines: {
          zeroLineColor: 'red',
          drawBorder: false,
        },
        ticks: {
          beginAtZero: true,
        }
      }],
      yAxes: [{
        gridLines: {
          zeroLineColor: '#002D72',
          color: '#E1EDF1',
        },
        ticks: {
          fontColor: '#002D72',
          beginAtZero: true
        }
      }],
    }
  };
  public barChartData = [
    { data: [272], label: 'Fuel', stack: 'a', backgroundColor: '#EC9231' },
    { data: [38], label: 'Effluent', stack: 'a', backgroundColor: '#626F9D' },
    { data: [17], label: 'Water and Chemicals', stack: 'a', backgroundColor: '#BCC0D6' },
    { data: [46], label: 'Carbont tax', stack: 'a', backgroundColor: '#6BA4B8' },
  ];

  constructor(private sanitized: DomSanitizer) {
    super();
  }

  ngOnInit() {}

  public generateChartLegend(data: Array<{ label: string, backgroundColor: string }>, legendRef?: ElementRef): SafeHtml {
    let legend: string = '<ul class="sgaChartLegend">'

    if (data.length) {
      data.forEach(({ label, backgroundColor }) => {
        legend += `<li class="sgaChartLegend_item">
            <span class="sgaChartLegend_item__color" style="background-color: ${backgroundColor}"></span>
            <span class="sgaChartLegend_item__text">${label}</span>
        </li>`
      })
    }

    legend += '</ul>';

    console.log(legend)

    if (legendRef && legendRef.nativeElement) {
      legendRef.nativeElement.innerHTML = legend;
    }

    return this.sanitized.bypassSecurityTrustHtml(legend);
  }

  onCalculateSizing(formGroup: FormGroup): any {
    return true;
  }

  onEnterHeaderDetailsForm(): any {
    return true;
  }

  onExcelSubmit(): any {
    return true;
  }

  onGetTiSheet(): any {
    return true;
  }

  onNewSizingForm(): any {
    return true;
  }

  onPdfSubmit(): any {
    return true;
  }

  onResetModuleForm(): any {
    return true;
  }

  onSave(savedProjectDetails: Project): JobSizing {
    return undefined;
  }

  onSaveJob(): any {
    return true;
  }

  onUnitsChanged(): any {
    return true;
  }

  repackageSizing(): any {
    return true;
  }

}
