import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {

  @Input() defaultColor: string = 'red'; // Color por defecto
  @Input('appHighlight') highlightColor: string = 'red'; // Color personalizado

  constructor(private el: ElementRef) {}

  // Resaltar el elemento al pasar el mouse
  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor || this.defaultColor);
  }

  // Quitar el resaltado al salir el mouse
  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}