import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userRoleColor',
  standalone: true
})
export class UserRoleColorPipe implements PipeTransform {

  transform(rol: string): string {
    switch (rol.toLowerCase()) {
      case 'admin':
        return 'text-danger'; 
      case 'especialista':
        return 'text-primary'; 
      case 'paciente':
        return 'text-warning'; 
      default:
        return 'text-secondary'; 
    }
  }
}


