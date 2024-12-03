import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userRoleColor',
  standalone: true
})
export class UserRoleColorPipe implements PipeTransform {

  transform(rol: string): string {
    switch (rol.toLowerCase()) {
      case 'admin':
        return 'text-danger'; // Color rojo para admin
      case 'especialista':
        return 'text-primary'; // Color verde para especialista
      case 'paciente':
        return 'text-warning'; // Color azul para paciente
      default:
        return 'text-secondary'; // Color por defecto
    }
  }
}


