import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { HighlightDirective } from '../../directives/highlight.directive';
import { TranslateService } from '../../translate.service';
interface Translations {
  [key: string]: { [key: string]: string };
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HighlightDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [ 
        style({ opacity: 0, transform: 'translateY(-10%)' }), 
        animate('1200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })) 
      ]),
      transition(':leave', [ 
        animate('800s ease-in', style({ opacity: 0, transform: 'translateY(-10%)' })) 
      ])
    ])
  ]
})
export class HomeComponent {
  constructor(private router: Router,    private translateService: TranslateService
  ) {}
  private translations: Translations = {
    es: {
      SALUD_PRIORIDAD: "Tu Salud, Nuestra Prioridad",
      PRESENTACION_1: "En Trafalgar, somos mucho más que una clínica; somos un espacio dedicado a cuidarte con un enfoque integral.",
      PRESENTACION_2: "Nuestro compromiso se basa en combinar tecnología médica de última generación con un equipo de profesionales apasionados, expertos en diversas especialidades.",
      CONFIANZA: "Confía en nosotros, porque en Trafalgar, tu salud está en las mejores manos.",
      ACCEDE_CUENTA: "Accede a tu Cuenta",
      ACCEDE_DESCRIPCION: "Únete a nuestro equipo. Inicia sesión o regístrate para acceder a todos nuestros servicios médicos en línea y administrar tus consultas de manera fácil y rápida.",
      INICIAR_SESION: "Iniciar Sesión",
      REGISTRARSE: "Registrarse",
    },
    en: {
      SALUD_PRIORIDAD: "Your Health, Our Priority",
      PRESENTACION_1: "At Trafalgar, we are much more than a clinic; we are a space dedicated to taking care of your well-being with a comprehensive approach.",
      PRESENTACION_2: "Our commitment is based on combining state-of-the-art medical technology with a team of passionate professionals, experts in various specialties.",
      CONFIANZA: "Trust us, because at Trafalgar, your health is in the best hands.",
      ACCEDE_CUENTA: "Access Your Account",
      ACCEDE_DESCRIPCION: "Join our team. Log in or sign up to access all our online medical services and manage your appointments easily and quickly.",
      INICIAR_SESION: "Log In",
      REGISTRARSE: "Sign Up",
    },
    pt: {
      SALUD_PRIORIDAD: "Sua Saúde, Nossa Prioridade",
      PRESENTACION_1: "Na Trafalgar, somos muito mais do que uma clínica; somos um espaço dedicado a cuidar do seu bem-estar com uma abordagem abrangente.",
      PRESENTACION_2: "Nosso compromisso é combinar tecnologia médica de última geração com uma equipe de profissionais apaixonados, especialistas em diversas áreas.",
      CONFIANZA: "Confie em nós, porque na Trafalgar, sua saúde está em boas mãos.",
      ACCEDE_CUENTA: "Acesse sua Conta",
      ACCEDE_DESCRIPCION: "Junte-se à nossa equipe. Faça login ou registre-se para acessar todos os nossos serviços médicos online e gerenciar suas consultas de forma fácil e rápida.",
      INICIAR_SESION: "Entrar",
      REGISTRARSE: "Cadastrar-se",
    }
  };
  
  // Variable que almacena el idioma actual
  currentLanguage: 'es' | 'en' | 'pt' = 'es';
  
  ngOnInit() {
    this.translateService.currentLanguage.subscribe((language: string) => {
      if (language === 'es' || language === 'en' || language === 'pt') {
        this.currentLanguage = language;
      }
    });
  }
  
  // Método para obtener la traducción actual
  getTranslation(key: string): string {
    return this.translations[this.currentLanguage][key] || key;
  }
  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
