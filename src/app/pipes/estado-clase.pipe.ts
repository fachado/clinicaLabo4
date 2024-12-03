import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoClase',
  standalone: true
})
export class EstadoClasePipe implements PipeTransform {

  transform(estado: string): string {
    switch (estado) {
      case 'Aceptado':
        return 'bg-success';
      case 'Finalizado':
        return 'bg-info';
      case 'Rechazado':
      case 'Cancelado':
        return 'bg-danger';
      case 'pendiente':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary'; // por defecto
    }
  }

}
