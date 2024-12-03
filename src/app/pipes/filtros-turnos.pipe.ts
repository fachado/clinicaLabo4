import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrosTurnos',
  standalone: true,
  
})
export class FiltrosTurnosPipe implements PipeTransform {
  transform(turnos: any[], filtroGeneral: string = '', filtroEspecialidad: string = '', filtroPaciente: string = '', filtroEspecialista: string = ''): any[] {
    if (!turnos || turnos.length === 0) return [];

    return turnos.filter(turno => {
      const textoFiltro = filtroGeneral ? filtroGeneral.toLowerCase() : '';
      const filtrarGeneral = textoFiltro
        ? Object.values(turno)
            .some(valor =>
              valor && valor.toString().toLowerCase().includes(textoFiltro)
            )
        : true;

      const filtrarPorEspecialidad = filtroEspecialidad
        ? turno.especialidad?.toLowerCase().includes(filtroEspecialidad.toLowerCase())
        : true;

      const filtrarPorPaciente = filtroPaciente
        ? turno.paciente?.toLowerCase().includes(filtroPaciente.toLowerCase())
        : true;

      const filtrarPorEspecialista = filtroEspecialista
        ? turno.especialista?.toLowerCase().includes(filtroEspecialista.toLowerCase())
        : true;

      return filtrarGeneral && filtrarPorEspecialidad && filtrarPorPaciente && filtrarPorEspecialista;
    });
  }
}