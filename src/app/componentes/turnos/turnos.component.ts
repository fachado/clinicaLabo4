import { Component } from '@angular/core';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { faCheck, faTimes, faEdit, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltrosTurnosPipe } from '../../pipes/filtros-turnos.pipe';
import { UserService } from '../../user.service';
import { EstadoClasePipe } from '../../pipes/estado-clase.pipe';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, FormsModule, FiltrosTurnosPipe, EstadoClasePipe],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.scss'],
  animations: [
    trigger('zoomFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate(
          '600ms ease-out',
          keyframes([
            style({ opacity: 0.3, transform: 'scale(0.7)', offset: 0.5 }),
            style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
          ])
        )
      ]),
      transition(':leave', [
        animate(
          '400ms ease-in',
          style({ opacity: 0, transform: 'scale(0.5)' })
        )
      ])
    ])
  ]
})
export class TurnosComponent implements OnInit {
  turnos: any[] = []; // Cambia 'any' por un modelo de datos si tienes uno definido.
  faCheck = faCheck;
  faTimes = faTimes;
  faEdit = faEdit;
  faBan = faBan;
  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';
  filtroPaciente: string = '';
  filtroGeneral: string = '';

usuario:any;
  constructor(private turnosService: TurnosService, private userService:UserService) {

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
  }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  /**
   * Cargar los turnos desde el servicio
   */
  cargarTurnos(): void {
    this.turnosService.getTurnos().subscribe({
      next: (data) => {
        this.turnos = data;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los turnos.'
        });
        console.error('Error al cargar los turnos:', err);
      }
    });
  }

  /**
   * Obtener los turnos filtrados por especialidad y especialista
   */

  get turnosFiltrados() {
    return this.turnos.filter(turno => {
      const textoFiltro = this.filtroGeneral ? this.filtroGeneral.toLowerCase() : '';
      const filtrarGeneral = textoFiltro
        ? Object.values(turno)
            .some(valor =>
              valor && valor.toString().toLowerCase().includes(textoFiltro)
            )
        : true;
  
      const filtrarPorEspecialidad = this.filtroEspecialidad
        ? turno.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase())
        : true;
  
      const filtrarPorPaciente = this.filtroPaciente
        ? turno.paciente?.toLowerCase().includes(this.filtroPaciente.toLowerCase())
        : true;
  
      const filtrarPorEspecialista = this.filtroEspecialista
        ? turno.especialista?.toLowerCase().includes(this.filtroEspecialista.toLowerCase())
        : true;
  
      return filtrarGeneral && filtrarPorEspecialidad && filtrarPorPaciente && filtrarPorEspecialista;
    });
  }

  /**
   * Actualizar el estado de un turno
   * @param id - ID del turno
   * @param nuevoEstado - Estado a actualizar
   */
  actualizarEstadoTurno(id: string, nuevoEstado: string): void {
    this.turnosService
      .actualizarTurno(id, { estado: nuevoEstado })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          text: `El turno ha sido marcado como ${nuevoEstado}.`
        });
        this.cargarTurnos(); // Actualiza la lista después del cambio
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado del turno.'
        });
        console.error('Error al actualizar turno:', error);
      });
  }

  /**
   * Editar un turno
   * @param id - ID del turno
   */
  editarTurno(id: string): void {
    Swal.fire({
      icon: 'info',
      title: 'Editar Turno',
      text: `Funcionalidad de edición para el turno con ID ${id} aún no implementada.`
    });
  }

  /**
   * Cancelar un turno
   * @param id - ID del turno
   */
  cancelarTurno(id: string): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Ingrese el motivo de la cancelación:',
      input: 'text',
      inputPlaceholder: 'Escribe el motivo aquí...',
      showCancelButton: true,
      confirmButtonText: 'Cancelar Turno',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const comentario = result.value;
        this.turnosService
          .actualizarTurno(id, { estado: 'Cancelado', comentario })
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Turno Cancelado',
              text: 'El turno ha sido cancelado correctamente.'
            });
            this.cargarTurnos(); // Refresca la lista después de la cancelación
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cancelar el turno.'
            });
            console.error('Error al cancelar turno:', error);
          });
      } else if (result.isDismissed) {
        Swal.fire({
          icon: 'info',
          title: 'Cancelación Anulada',
          text: 'El turno no ha sido cancelado.'
        });
      }
    });
  }
}
