import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appChangeColor]', 
  standalone: true 
})
export class ChangeColorDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {

    this.changeColor('purple');
  }

  private changeColor(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'color', color);
  }
}
