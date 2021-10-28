import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: 'app-boiler-scheme',
  templateUrl: './boiler-scheme.component.html',
  styleUrls: ['./boiler-scheme.component.scss']
})
export class BoilerSchemeComponent implements OnInit {
  @Input() showControls: boolean;
  @Input() feedWater: string = 'main';
  public boiler: any = 'main';
  public tdsControl: any = 'main';
  public treatment: any = 'main';
  public flashWessel: any = 'main';
  public heatExchanger = true;
  public tdsPipe = true;
  public dsi = true;
  public bdv = true;
  public economiser = true;
  public bdvCooling = true;

  constructor() { }

  ngOnInit() {

  }

}
