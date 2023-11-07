import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTrim]',
  standalone: true
})
export class TrimDirective {
  /**
   * Boolean for checking if a space exists in the input field
   */
  isSpace: boolean;

  constructor(public el: ElementRef, public renderer: Renderer2) {}

  /**
   * Angular's Lifecycle hook called once the component is initialized
   */
  ngOnInit():void {
    this.format(this.el.nativeElement.value); // format any initial values
  }

  /**
   * Host Listener method for listening to input events on a field
   * @param e Event
   */
  @HostListener('input', ['$event.target.value']) onInput(e: string):void {
    this.format(e);
  }

  // @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent):void {
  //   event.preventDefault();
  //   this.format(event.clipboardData.getData('text/plain'));
  // }

  /**
   * Host Listener method for listening to focus event on a field
   * @param target The target value in the input field
   */
  @HostListener('focus', ['$event.target.value']) onFocus(target: string):void {
    if (this.isSpace) {
      this.format(target + ' ');
    }
  }

  /**
   * Host Listener method for listening to blur event on a field
   * @param target The target value in the input field
   */
  @HostListener('blur', ['$event.target.value']) onBlur(target: string):void {
    this.isSpace = target.endsWith(' ');
    this.format(target.trim());
  }

  /**
   * Method to format string so as to prevent extra whitespaces
   * @param val string value in the input field to format
   */
  format(val: string):void {
    this.renderer.setProperty(
      this.el.nativeElement,
      'value',
      val?.replace(/  +/g, ' ').trimLeft()
    );
  }

}
