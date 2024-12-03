import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HighlightDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [ // Animación de entrada
        style({ opacity: 0, transform: 'translateY(-10%)' }), // Estado inicial
        animate('1200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })) // Estado final
      ]),
      transition(':leave', [ // Animación de salida
        animate('800s ease-in', style({ opacity: 0, transform: 'translateY(-10%)' })) // Estado final
      ])
    ])
  ]
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
