import { Component, OnInit, ViewEncapsulation } from '@angular/core';
declare var $: any;
//import * as $ from "node_modules/jquery/dist/jquery.js";
//import * as pre from "../core/preloader/preloader.js";
  //"node_modules/jquery-sparkline/jquery.sparkline.js",
  //"node_modules/jquery-slimscroll/jquery.slimscroll.js",
  //"node_modules/jqcloud2/dist/jqcloud.js",
  //"node_modules/popper.js/dist/umd/popper.js",
  //"node_modules/bootstrap/dist/js/bootstrap.js",
  //"node_modules/summernote/dist/summernote.js",
  //"node_modules/moment/min/moment-with-locales.min.js",
  //"node_modules/fullcalendar/dist/fullcalendar.js"

@Component({
  selector: 'sizing-sizing-shared-lib',
  templateUrl: './sizing-shared-lib.component.html',
  styleUrls: ['./sizing-shared-lib.component.scss'],
  encapsulation: ViewEncapsulation.None //for styling inheritence - libraries
})
export class SizingSharedLibComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
