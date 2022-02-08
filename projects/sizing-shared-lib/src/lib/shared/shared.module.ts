import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToasterModule } from 'angular2-toaster/angular2-toaster';

import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { RatingModule } from 'ngx-bootstrap/rating';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BlockUIModule } from 'ng-block-ui';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SparklineDirective } from './directives/sparkline/sparkline.directive';
import { ColorsService } from './colors/colors.service';
import { CheckallDirective } from './directives/checkall/checkall.directive';
import { NowDirective } from './directives/now/now.directive';
import { ScrollableDirective } from './directives/scrollable/scrollable.directive';
import { JqcloudDirective } from './directives/jqcloud/jqcloud.directive';
import { NumberOnlyDirective } from './directives/numberOnly/numberonly.directive';
import { TwoDigitDecimalNumberDirective } from './directives/twodigitdecimalnumber/twodigitdecimalnumber.directive';

import { AlertsModule } from './alerts/alerts.module';
import { SizingSuiteModalModule } from './sizing-suite-modal/sizing-suite-modal.module';
import { TranslationModule } from './translation/translation.module';
import { EnumerationModule } from "./enumeration/enumeration.module";
import { EnumerationPickerModule } from "./enumeration-picker/enumeration-picker.module";
import { PreferenceModule } from "./preference/preference.module";
import { UnitsModule } from "./units/units.module";
import { ModuleRibbonComponent } from './module-ribbon/module-ribbon.component';
import { ProductSelectorModule } from "./product-selector/product-selector.module";
import { SaveLoadModule } from "./sizing-module-saveload/saveload.modal.module";

import { CalculationsService } from "./calculations/calculations.service";
import { SharedService } from "./shared.service";
import { UserValidator } from "./validators/user.validator";
import { ModulePreferenceService } from './module-preference/module-preference.service';
import { SpiraxInputDirective } from './directives/spirax-input/spirax-input.directive';

// https://angular.io/styleguide#!#04-10
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    CarouselModule.forRoot(),
    CollapseModule.forRoot(),
    DatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    ProgressbarModule.forRoot(),
    RatingModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    TypeaheadModule.forRoot(),
    BlockUIModule,
    ToasterModule,
    AlertsModule,
    SizingSuiteModalModule,
    TranslationModule,
    EnumerationModule,
    EnumerationPickerModule,
    PreferenceModule,
    ProductSelectorModule,
    UnitsModule,
    SaveLoadModule,
    NgxDatatableModule
  ],
  providers: [
    ColorsService,
    CalculationsService,
    SharedService,
    UserValidator
  ],
  declarations: [
    SparklineDirective,
    CheckallDirective,
    NowDirective,
    ScrollableDirective,
    JqcloudDirective,
    NumberOnlyDirective,
    TwoDigitDecimalNumberDirective,
    ModuleRibbonComponent,
    SpiraxInputDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AccordionModule,
    AlertModule,
    ButtonsModule,
    CarouselModule,
    CollapseModule,
    DatepickerModule,
    BsDropdownModule,
    ModalModule,
    PaginationModule,
    ProgressbarModule,
    RatingModule,
    TabsModule,
    TimepickerModule,
    TooltipModule,
    PopoverModule,
    TypeaheadModule,
    ToasterModule,
    AlertsModule,
    SizingSuiteModalModule,
    SparklineDirective,
    CheckallDirective,
    NowDirective,
    ScrollableDirective,
    JqcloudDirective,
    NumberOnlyDirective,
    TwoDigitDecimalNumberDirective,
    TranslationModule,
    EnumerationModule,
    EnumerationPickerModule,
    PreferenceModule,
    ProductSelectorModule,
    ModuleRibbonComponent,
    NgxDatatableModule,
    SpiraxInputDirective
  ]
})

export class SharedModule {
}
