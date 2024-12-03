import { Component } from '@angular/core';
import { trigger, group, style, animate, transition, query, animateChild,  } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }), // Comienza fuera de la pantalla (derecha)
        animate('300ms ease-out', style({ transform: 'translateX(0)' })) // Se desliza hacia la posición original
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' })) // Se desliza fuera de la pantalla (derecha)
      ])
    ])
  ]
})
export class FooterComponent {

}
