import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  private languageSource = new BehaviorSubject<string>('es'); // idioma por defecto
  currentLanguage = this.languageSource.asObservable();

  constructor() {}

  changeLanguage(language: string) {
    this.languageSource.next(language);
  }
}
