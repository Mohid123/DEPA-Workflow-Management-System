import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTrim]',
  standalone: true
})
export class TrimDirective {

  isSpace: boolean;
  constructor(public el: ElementRef, public renderer: Renderer2) {}

  ngOnInit():void {
    this.format(this.el.nativeElement.value); // format any initial values
  }

  @HostListener('input', ['$event.target.value']) onInput(e: string):void {
    this.format(e);
  }

  // @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent):void {
  //   event.preventDefault();
  //   this.format(event.clipboardData.getData('text/plain'));
  // }

  @HostListener('focus', ['$event.target.value']) onFocus(target: string):void {
    if (this.isSpace) {
      this.format(target + ' ');
    }
  }

  @HostListener('blur', ['$event.target.value']) onBlur(target: string):void {
    this.isSpace = target.endsWith(' ');
    this.format(target.trim());
  }

  format(val: string):void {
    this.renderer.setProperty(
      this.el.nativeElement,
      'value',
      val?.replace(/  +/g, ' ').trimLeft()
    );
  }

}
