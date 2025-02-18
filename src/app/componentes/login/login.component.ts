import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Auth, signInWithEmailAndPassword, sendEmailVerification, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../usuarios.service';
import { map, Observable } from 'rxjs';
import { collection, addDoc, updateDoc, getDocs, query, where } from '@angular/fire/firestore';
import { UserService } from '../../user.service';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateService } from '../../translate.service';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [ 
        style({ opacity: 0, transform: 'translateX(-10%)' }), 
        animate('1000ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })) 
      ]),
      transition(':leave', [ 
        animate('1000ms ease-in', style({ opacity: 0, transform: 'translateX(-10%)' })) 
      ])
    ])
  ]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;  // Variable para controlar el estado de carga
  rolSeleccionado: string='especialista';
  usuarios$: Observable<any[]> | undefined;
  language: 'es' | 'en' | 'pt' = 'es'; // Idioma por defecto
  ngOnInit() {
    this.translateService.currentLanguage.subscribe((language: string) => {
      if (language === 'es' || language === 'en' || language === 'pt') {
        this.language = language;
      }
    });
  }
  translations = {
    es: {
      loginTitle: "Iniciar sesión",
      email: "Correo electrónico",
      password: "Contraseña",
      loginButton: "Iniciar sesión",
      loading: "Cargando..."
    },
    en: {
      loginTitle: "Log In",
      email: "Email",
      password: "Password",
      loginButton: "Log In",
      loading: "Loading..."
    },
    pt: {
      loginTitle: "Entrar",
      email: "E-mail",
      password: "Senha",
      loginButton: "Entrar",
      loading: "Carregando..."
    }
  };

  get t() {
    console.log(this.language);

    return this.translations[this.language];
    
  }

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore:Firestore,
    private userService:UserService,
    private translateService: TranslateService
  ) {   
  }

  changeLanguage(language: string) {
    this.translateService.changeLanguage(language);
  }

  rellenarCuentaAdmin(){
    this.email="ignaciofachado13@gmail.com";
    this.password="imposible";


    
  }
  
  especialista1(){
    this.email="biles60020@merotx.com";
    this.password="123456";

  }
  
  especialista2(){
    this.email="vejajey550@merotx.com";
    this.password="123456";

  }
  paciente1(){
    this.email="mohoc52676@merotx.com";
    this.password="123456";

  }
  paciente2(){
    this.email="damebop920@luxyss.com";
    this.password="123456";


    
  }
  paciente3(){
    this.email="berixav694@merotx.com";
    this.password="123456";


    
  }



  async onLogin() {
    if (this.email && this.password) {
      this.isLoading = true;  // Mostrar el spinner cuando comienza el login
      
      try {
        const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
        const user = userCredential.user;
        
        if (user.email) {  // Verificar que el email no es null
          // Obtener los datos del usuario desde Firestore usando el servicio
          const userData = await this.userService.getUserData(user.email);
          
          // Verificar si el correo está verificado
          if (user.emailVerified) {
            // Verificar si el usuario es especialista y está desaprobado
            if (userData && userData.userType === 'especialista' && userData.estado === 'inhabilitado') {
              // Si el usuario es especialista y está desaprobado, cerrar sesión
              Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'Tu cuenta esta inhabilitado. No puedes iniciar sesión por ahora.',
              });
  
              await signOut(this.auth);
              this.router.navigate(['/login']); 
              return;
            }
            this.userService.guardarLogs();
            // Si el correo está verificado y no está desaprobado
            Swal.fire({
              icon: 'success',
              title: '¡Bienvenido!',
              text: `Has iniciado sesión como ${user.email}`,
            });
  
            this.router.navigate(['/']); // Redirigir a la página de inicio
          } else {
            // Si el correo no está verificado
            Swal.fire({
              icon: 'warning',
              title: 'Correo no verificado',
              text: 'Por favor, verifica tu correo antes de iniciar sesión.',
              confirmButtonText: 'Reenviar correo de verificación'
            }).then(async (result) => {
              if (result.isConfirmed) {
                // Reenviar el correo de verificación
                await sendEmailVerification(user);
                Swal.fire(
                  'Correo enviado',
                  'Revisa tu bandeja de entrada para verificar tu correo.',
                  'info'
                );
              }
            });
  
            // Cerrar sesión inmediatamente si el correo no está verificado
            await signOut(this.auth);
            this.router.navigate(['/login']); // Redirigir a la página de login
          }
        }
      } catch (error: unknown) {
        // Manejo de error en caso de fallo de login
        if (error instanceof Error) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Ocurrió un error desconocido.';
        }
  
        console.error('Error de login:', error);
  
        // Mostrar SweetAlert en caso de error
        Swal.fire({
          icon: 'error',
          title: 'Error de login',
          text: this.errorMessage || 'Por favor, verifica tus credenciales.',
        });
      } finally {
        this.isLoading = false;  // Ocultar el spinner cuando termine el login
      }
    } else {
      this.errorMessage = 'Por favor, ingresa un email y contraseña válidos.';
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: this.errorMessage,
      });
    }
  }
  
}