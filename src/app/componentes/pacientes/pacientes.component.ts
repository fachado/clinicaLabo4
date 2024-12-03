import { Component } from '@angular/core';
import { UsuariosService } from '../../usuarios.service';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from '../../user.service';
import { map } from 'rxjs';
import Swal from 'sweetalert2';
import { UsuarioestiloDirective } from '../../directives/usuarioestilo.directive';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,UsuarioestiloDirective],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
  ,
  animations: [
    trigger('slideFade', [
      transition(':enter', [
        animate(
          '800ms ease-out',
          keyframes([
            style({ opacity: 0, transform: 'translateY(100%)', offset: 0 }),
            style({ opacity: 0.5, transform: 'translateY(50%)', offset: 0.5 }),
            style({ opacity: 1, transform: 'translateY(0)', offset: 1 }),
          ])
        )
      ]),
      transition(':leave', [
        animate(
          '600ms ease-in',
          keyframes([
            style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
            style({ opacity: 0.5, transform: 'translateY(50%)', offset: 0.5 }),
            style({ opacity: 0, transform: 'translateY(100%)', offset: 1 }),
          ])
        )
      ])
    ])
  ]
})
export class PacientesComponent {
  usuarios$: Observable<any[]> | undefined;
  usuario: any;
  pacientesConTurnos: any[] = [];  // Lista para guardar pacientes con turnos

  constructor(
    private usuariosService: UsuariosService, 
    private turnosService: TurnosService, 
    private userService: UserService
  ) {
    this. obtenerUsuarios()
  }
  tieneTurnosFinalizados(pacienteConTurnos: any): boolean {
    return pacienteConTurnos.turnos.some((turno: any) => turno.estado === 'Finalizado');
  }
  ngOnInit(): void {
    console.log('ngOnInit - Component initialized');
    this.obtenerUsuarios();
    this.userService.getCurrentUser().then(user => {
      if (user?.email) {
        this.userService.getUserData(user.email).then(data => {
          if (data) {
            this.usuario = data;
            console.log('Usuario logueado:', this.usuario);
            this.obtenerPacientesConTurnos();
          }
        });
      }
    });
  }

















  obtenerUsuarios(): void {
    console.log('obtenerUsuarios - rolSeleccionado:', );
    
    // Intentamos obtener y filtrar los usuarios por rol
    this.usuarios$ = this.usuariosService.getResultados().pipe(
      map((usuarios) => {
        console.log('obtenerUsuarios - Usuarios obtenidos desde el servicio:', usuarios);
        const usuariosFiltrados = usuarios.filter((usuario) => usuario.userType === "paciente");
        console.log('obtenerUsuarios - Usuarios filtrados:', usuariosFiltrados);
        return usuariosFiltrados;
      })
    );
  }

  verResena(turnoId: string): void {
    // Buscar el turno en los turnos de todos los pacientes
    const turno = this.pacientesConTurnos.flatMap(p => p.turnos).find(t => t.id === turnoId);

    if (turno) {
      Swal.fire({
        title: 'Reseña del Turno',
        text: turno.ComentarioFinalizado || 'No hay reseña disponible.',
        confirmButtonText: 'Cerrar'
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se encontró la reseña del turno.',
        icon: 'error',
        confirmButtonText: 'Cerrar'
      });
    }
  }



  verHistoriaClinica(turnoId: string): void {
    // Buscar el turno específico por ID en la lista de pacientes con turnos
    const turno = this.pacientesConTurnos
      .flatMap(p => p.turnos)
      .find(t => t.id === turnoId);
  
    if (!turno || !turno.HistoriaClinica) {
      Swal.fire({
        title: 'Error',
        text: 'No hay historia clinica cargada.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
      return;
    }
  
    // Generar contenido dinámico si existe información en la Historia Clínica
    const dinamicosContenido = turno.HistoriaClinica?.dinamicos
      ?.map(
        (dinamico: { clave: string; valor: string }) =>
          `<div class="row mb-2"><p><strong>${dinamico.clave}:</strong> ${dinamico.valor}</p></div>`
      )
      .join('') || '<p>Sin datos adicionales.</p>';
  
    // Crear el contenido HTML para el Swal
    const contenido = `
      <div class="card mb-3" style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px;">
        <div class="card-header" style="background-color: #f1f1f1; font-weight: bold;">
          <p><strong>Especialista:</strong> ${turno.especialista}</p>
          <p><strong>Especialidad:</strong> ${turno.especialidad}</p>
        </div>
        <div class="card-body" style="background-color: #fff;">
          <p><strong>Paciente:</strong> ${turno.paciente}</p>
          <p><strong>Fecha:</strong> ${turno.horario.fecha}</p>
          <p><strong>Hora:</strong> ${turno.horario.horaInicio} - ${turno.horario.horaFin}</p>
          <hr />
          <p><strong>Altura:</strong> ${turno.HistoriaClinica?.altura || 'No disponible'} cm</p>
          <p><strong>Peso:</strong> ${turno.HistoriaClinica?.peso || 'No disponible'} kg</p>
          <p><strong>Presión:</strong> ${turno.HistoriaClinica?.presion || 'No disponible'}</p>
          <p><strong>Temperatura:</strong> ${turno.HistoriaClinica?.temperatura || 'No disponible'} °C</p>
          <hr />
          <p><strong>Datos dinámicos:</strong></p>
          ${dinamicosContenido}
        </div>
      </div>
    `;
  
    // Mostrar el Swal con la información de la historia clínica
    Swal.fire({
      title: `Historia Clínica de ${turno.paciente}`,
      html: contenido,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Cerrar',
    });
  }
  
  

  // Obtener los pacientes que tienen turnos con el especialista
  obtenerPacientesConTurnos(): void {
    this.usuarios$?.subscribe(usuarios => {
      usuarios.forEach(paciente => {
        this.turnosService.obtenerTurnosPacienteByEspecialista(paciente.nombre, this.usuario.nombre).then(turnos => {
          if (turnos.length > 0) {

            this.pacientesConTurnos.push({
              paciente,
              turnos
            });
            console.log("pacient turno",this.pacientesConTurnos);
            
          }
        });
      });
    });
  }
  toggleTurnos(pacienteConTurnos: any): void {
    pacienteConTurnos.mostrarTurnos = !pacienteConTurnos.mostrarTurnos;
    if (pacienteConTurnos.mostrarTurnos && pacienteConTurnos.turnos.length === 0) {
      this.turnosService.obtenerTurnosPaciente(pacienteConTurnos.paciente.nombre).then(turnos => {
        pacienteConTurnos.turnos = turnos;
      });
    }
  }
}
