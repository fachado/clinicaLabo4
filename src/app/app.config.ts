import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core'; // Importar el módulo de fecha nativa
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Función para cargar los archivos de traducción
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() => initializeApp({
      "projectId": "fbst-8c19a",
      "appId": "1:552161137797:web:b5458227427b525d8505ec",
      "storageBucket": "fbst-8c19a.appspot.com",
      "apiKey": "AIzaSyB67dt-tKq5o96n871EAP8BulvGdlF8J1w",
      "authDomain": "fbst-8c19a.firebaseapp.com",
      "messagingSenderId": "552161137797"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(),
    provideStorage(() => getStorage()), 
    provideAnimations(),
    provideNativeDateAdapter(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }).providers!,
  ]
};
