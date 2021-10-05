import { OnInit, Directive, Input, ElementRef } from '@angular/core';
declare var $: any;

@Directive({
  selector: 'scrollable'
})
export class ScrollableDirective implements OnInit {

  @Input() height: number;
  defaultHeight = 250;

  @Input() width: number;
  defaultWidth = '100%';

  constructor(public element: ElementRef) { }

  ngOnInit() {
    //$(this.element.nativeElement).slimScroll({
    //  height: (this.height || this.defaultHeight),
    //  width: (this.width || this.defaultWidth)
    //});
  }

}
