import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appUsuarioestilo]',
  standalone: true
})
export class UsuarioestiloDirective  {
  @Input() set appUsuarioestilo(especialidad: string) {
    this.setColor(especialidad);
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  private setColor(especialidad: string) {
    let color = '';

    switch (especialidad) {
      case 'Cardiología':
        color = 'lightblue';
        break;
      case 'Dermatología':
        color = 'lightgreen';
        break;
      case 'Neurología':
        color = 'lightpink';
        break;
        case 'traumatologia':
          color = 'mediumpurple';
          break;
          case 'oculista':
            color = 'yellowgreen';
            break;
      default:
        color = 'lightgray';
    }

    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }
}