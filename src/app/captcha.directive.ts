import { Directive, ElementRef, Renderer2, Output, EventEmitter, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
@Directive({
  selector: '[appCaptcha]',
  standalone: true,
})
export class CaptchaDirective implements OnInit {
  @Input() captchaDisabled: boolean = false; // Input para deshabilitar el CAPTCHA
  @Output() captchaValid = new EventEmitter<boolean>(); // Output para emitir la validez del CAPTCHA
  private captchaValue: string = ''; // Valor del CAPTCHA generado

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (!this.captchaDisabled) {
      this.renderCaptcha();
    } else {
      this.clearCaptcha();
    }
  }

  // Método para generar el CAPTCHA y renderizarlo
  private renderCaptcha() {
    this.captchaValue = this.generateCaptchaValue(); // Generar el valor del CAPTCHA

    // Crear el contenido HTML del CAPTCHA
    const el = this.el.nativeElement;
    el.innerHTML = `
      <div class="captcha-container">
        <canvas class="captcha-canvas"></canvas>
        <input type="text" placeholder="Ingrese el texto del CAPTCHA" class="captcha-input">
        <button type="button" class="captcha-validate-btn">Validar CAPTCHA</button>
        <button type="button" class="captcha-refresh-btn">Cambiar CAPTCHA</button>
      </div>
    `;

    this.drawCaptcha(); // Dibujar el CAPTCHA en el canvas

    // Añadir eventos a los botones
    const validateBtn = el.querySelector('.captcha-validate-btn');
    const refreshBtn = el.querySelector('.captcha-refresh-btn');

    if (validateBtn) {
      this.renderer.listen(validateBtn, 'click', () => this.validateCaptcha());
    }
    if (refreshBtn) {
      this.renderer.listen(refreshBtn, 'click', () => this.refreshCaptcha());
    }
  }

  // Generar el valor del CAPTCHA
  private generateCaptchaValue(): string {
    return Math.random().toString(36).substring(2, 8); // Genera una cadena aleatoria de 6 caracteres
  }

  // Dibujar el CAPTCHA en el canvas con caracteres tachados
  private drawCaptcha() {
    const canvas = this.el.nativeElement.querySelector('.captcha-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 200;
        canvas.height = 50;

        // Estilo de fondo
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Estilo del texto
        ctx.font = '30px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dibujar caracteres tachados
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        ctx.fillText(this.captchaValue, x, y);
        for (let i = 0; i < this.captchaValue.length; i++) {
          const charWidth = ctx.measureText(this.captchaValue[i]).width;
          const charX = x - (this.captchaValue.length / 2) * charWidth + i * charWidth;
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(charX - 5, y - 10);
          ctx.lineTo(charX + charWidth - 5, y + 10);
          ctx.stroke();
        }
      }
    }
  }

  // Validar el CAPTCHA
  private validateCaptcha() {
    const input = this.el.nativeElement.querySelector('.captcha-input') as HTMLInputElement;
    if (input) {
      if (input.value === this.captchaValue) {
        this.captchaValid.emit(true);
        Swal.fire('Hecho!', '¡CAPTCHA válido!',"success");

      } else {
        this.captchaValid.emit(false);
         Swal.fire('Error', 'CAPTCHA Incorrecto, intente nuevamente.', 'error');
      }
    }
  }

  // Refrescar el CAPTCHA
  private refreshCaptcha() {
    this.captchaValue = this.generateCaptchaValue();
    this.drawCaptcha();
  }

  // Limpiar el CAPTCHA si está deshabilitado
  private clearCaptcha() {
    const el = this.el.nativeElement;
    el.innerHTML = '<div>CAPTCHA deshabilitado</div>';
  }
}
