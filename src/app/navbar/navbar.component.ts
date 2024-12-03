import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // Importar el ícono
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { faUser } from '@fortawesome/free-solid-svg-icons'; // Importar el ícono
import { trigger, group, style, animate, transition, query, animateChild,  } from '@angular/animations';
import { UserRoleColorPipe } from '../pipes/user-role-color.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, FontAwesomeModule,UserRoleColorPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
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
export class NavbarComponent {

  isLoggedIn: boolean = false;
  userEmail: string | null = null;
  userType: string | null = null;  // Almacenamos el tipo de usuario
  faSignOutAlt = faSignOutAlt; // Referencia al ícono
  faUser=faUser;
  usuario: any;
  constructor(private router: Router, private auth: Auth, private userService: UserService) {
    onAuthStateChanged(this.auth, (user) => {
      if (user?.emailVerified) {
        this.isLoggedIn = true;
        this.userEmail = user.email;
    
        // Verificar si el email no es nulo antes de obtener el userType
        if (this.userEmail) {
          console.log(this.userEmail);
          this.userService.getUserType(this.userEmail).then(userType => {
            this.userType = userType;
            console.log(this.userType );
          });
        }
        this.userService.getCurrentUser().then(user => {
          if (user?.email) {
            this.userService.getUserData(user.email).then(data => {
              if (data) {
                this.usuario = data;
                console.log(this.usuario);
              }
            });
          }
        });
    
        console.log('Usuario logueado:', user.email);
      } else {
        this.isLoggedIn = false;
        this.userEmail = null;
        this.userType = null;
        console.log('Usuario no logueado');
      }
    });
  }

  // Método que verifica si el usuario es admin
  isAdmin(): boolean {
    return this.userType === 'admin';
  }
  isEspecialista(): boolean {
    return this.userType === 'especialista';
  }
  esPaciente(): boolean {
    return this.userType === 'paciente';
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  isMenuOpen = false; // Estado del menú

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; // Cambiar el estado
  }

  logout() {
    signOut(this.auth).then(() => {
      this.isLoggedIn = false;
      this.userEmail = null;
      this.userType = null;
      this.router.navigate(['/login']);
    });
  }
}