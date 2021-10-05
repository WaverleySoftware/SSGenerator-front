import { Component, OnInit } from '@angular/core';
import { AdminService } from "../admin.service";

import { Currency } from "./currency.model";
import { TranslatePipe } from "../../../shared/translation/translate.pipe";

@Component({
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit {
  pageTitle: string = 'Currency Information';
  errorMessage: string = '';

  currencyList: Currency[] = [];

  constructor(private adminService: AdminService, public translatePipe: TranslatePipe) { }

  ngOnInit() {
    this.adminService.getCurrencyData()
      .subscribe(data => {
        this.currencyList = data;
      });
  }
}

