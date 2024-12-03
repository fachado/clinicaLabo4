import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { RegisterComponent } from "./componentes/register/register.component";
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { HomeComponent } from "./componentes/home/home.component";
import { FooterComponent } from './footer/footer.component';
import { UsuariosComponent } from "./componentes/usuarios/usuarios.component";
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, HomeComponent, FooterComponent, UsuariosComponent,UsuariosComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('slideFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate(
          '1000ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate(
          '1000ms ease-in',
          style({ opacity: 0, transform: 'translateY(50px)' })
        )
      ])
    ])
  ]
})
export class AppComponent {
  title = 'Clinica';
  getAnimationState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
