import { Directive, Input, ElementRef, Renderer2, HostListener } from '@angular/core';

/**
 * Standalone directive for Manual Sort on tables. (For Test only)
 */
@Directive({
  selector: '[appSort]',
  standalone: true
})
export class SortDirective {

  /**
   * Array of data to sort
   */
  @Input() appSort: Array<any>;

  constructor(private renderer: Renderer2, private targetElem: ElementRef) { }

  /**
   * Host Listener method that listens to changes on DOM via a specified event (click in this case) and performs an action
   */
  @HostListener("click")
  sortData() {
    const sort = {}; // new Sort();
    const elem = this.targetElem.nativeElement;
    const order = elem.getAttribute("data-order");
    const type = elem.getAttribute("data-type");
    const property = elem.getAttribute("data-name");
    if (order === "desc") {
      elem.setAttribute("data-order", "asc");
    }
    else {
      elem.setAttribute("data-order", "desc");
    }
  }
}