import { Component } from '@angular/core';
import { UserService } from '../../user.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';  // Ya lo tienes importado
import { UsuariosService } from '../../usuarios.service';
import { map } from 'rxjs/operators';
import { RegisterComponent } from '../register/register.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { trigger, group, style, animate, transition, query, animateChild,  } from '@angular/animations';

import { TurnosService } from '../../services/turnos.service';
import { ZoomImagenDirective } from '../../directives/zoom-imagen.directive';
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule,RegisterComponent,FormsModule,ZoomImagenDirective],  // Ya lo tienes importado
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],  // Asegúrate de que el nombre del archivo sea correcto
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }), // Comienza fuera de la pantalla (derecha)
        animate('300ms ease-out', style({ transform: 'translateX(0)' })) // Se desliza hacia la posición original
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' })) // Se desliza fuera de la pantalla (derecha)
      ])
    ])
  ]
})
export class UsuariosComponent {
  usuarios$: Observable<any[]> | undefined;
  rolSeleccionado: string = 'paciente'; // Rol predeterminado
  formVisible: boolean = false; // Control de visibilidad del formulario
  turnos: any[] = []; // Cambia 'any' por un modelo de datos si tienes uno definido.
  historiaClinicaVisible:boolean  = false;
mostrarComponente: boolean  = true;
  constructor(private usuariosService: UsuariosService, private turnosService:TurnosService) {}

  ngOnInit(): void {
    console.log('ngOnInit - Component initialized');
    this.obtenerUsuarios();
    this.cargarTurnos();
  }



  descargarTurnos(usuario: any): void {
    // Filtrar los turnos del usuario
    const turnosUsuario = this.turnos.filter(turno => turno.paciente === usuario.nombre);
    
    // Crear datos para el Excel
    const datosExcel = turnosUsuario.map(turno => ({
      Especialista: turno.especialista,
      Especialidad: turno.especialidad,
      Paciente: turno.paciente,
      Fecha: turno.horario.fecha,
      HoraInicio: turno.horario.horaInicio,
      HoraFin: turno.horario.HoraFin,
      Altura: turno.HistoriaClinica?.altura || 'N/A',
      Peso: turno.HistoriaClinica?.peso || 'N/A',
      Presión: turno.HistoriaClinica?.presion || 'N/A',
      Temperatura: turno.HistoriaClinica?.temperatura || 'N/A',
      DatosDinamicos: turno.HistoriaClinica?.dinamicos?.map((d: { clave: any; valor: any; }) => `${d.clave}: ${d.valor}`).join(', ') || 'N/A',
    }));
  
    // Convertir a hoja de cálculo
    const hoja = XLSX.utils.json_to_sheet(datosExcel);
  
    // Crear el libro
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Turnos');
  
    // Guardar el archivo
    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Turnos_${usuario.nombre}.xlsx`);
  }
  
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

  verHistoriaClinica(usuario: any): void {
    const turnosPaciente = this.turnos.filter(turno => turno.paciente === usuario.nombre && turno.HistoriaClinica);
    console.log("turnos", turnosPaciente);
  
    // Generamos el contenido para mostrar en el Swal
    const contenido = turnosPaciente.map(turno => {
      // Creamos los datos dinámicos si existen
      const dinamicosContenido = turno.HistoriaClinica.dinamicos.map((dinamico: { clave: any; valor: any; }) => `
        <div class="row mb-2">
          <p><strong></strong> ${dinamico.clave}: ${dinamico.valor} </p>
        </div>
      `).join('');
  
      // Generamos la tarjeta con los datos estáticos y dinámicos
      return `
        <div class="card mb-3" style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div class="card-header" style="font-weight: bold; background-color: #f1f1f1; border-bottom: 2px solid #ddd;">
            <span><strong>Especialista:</strong> ${turno.especialista}</span><br>
            <span><strong>Especialidad:</strong> ${turno.especialidad}</span>
          </div>
          <div class="card-body" style="background-color: #fff; padding: 15px;">
            <p><strong>Paciente:</strong> ${turno.paciente}</p>
            <p><strong>Fecha:</strong> ${turno.horario.fecha}</p>
            <p><strong>Hora:</strong> ${turno.horario.horaInicio} - ${turno.horario.horaFin}</p>
            
            <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px;">
              <p><strong>Altura:</strong> ${turno.HistoriaClinica.altura} cm</p>
              <p><strong>Peso:</strong> ${turno.HistoriaClinica.peso} kg</p>
              <p><strong>Presión:</strong> ${turno.HistoriaClinica.presion}</p>
              <p><strong>Temperatura:</strong> ${turno.HistoriaClinica.temperatura} °C</p>

                        <div class="card-header" style="font-weight: bold; background-color: #f1f1f1; border-bottom: 2px solid #ddd;">
  <p><strong>Datos dinamicos: </strong> </p>

              ${dinamicosContenido}
          </div>
              

            </div>
  
            <!-- Aquí mostramos los datos dinámicos -->
          </div>
        </div>
      `;
    }).join('');
  
    console.log("contenido", contenido);
  
    // Mostramos la historia clínica en un Swal
    Swal.fire({
      title: `Historia Clínica de ${usuario.nombre}`,
      html: contenido,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Cerrar',
      customClass: {
        popup: 'swal-popup', // Personaliza el popup si es necesario
      },
    });
  }
  
  

  obtenerUsuarios(): void {
    console.log('obtenerUsuarios - rolSeleccionado:', this.rolSeleccionado);
    
    // Intentamos obtener y filtrar los usuarios por rol
    this.usuarios$ = this.usuariosService.getResultados().pipe(
      map((usuarios) => {
        console.log('obtenerUsuarios - Usuarios obtenidos desde el servicio:', usuarios);
        const usuariosFiltrados = usuarios.filter((usuario) => usuario.userType === this.rolSeleccionado);
        console.log('obtenerUsuarios - Usuarios filtrados:', usuariosFiltrados);
        return usuariosFiltrados;
      })
    );
  }

  seleccionarRol(rol: string): void {
    this.rolSeleccionado = rol;
    console.log('seleccionarRol - Nuevo rol seleccionado:', this.rolSeleccionado);
    this.obtenerUsuarios(); // Actualiza los resultados con el nuevo rol
  }

   // Método para mostrar el formulario de creación de usuario
   mostrarFormulario() {
    this.formVisible = !this.formVisible; // Alternar la visibilidad del formulario
  }

// Método para aprobar o desaprobar usuarios especialistas
cambiarEstado(usuario: any, nuevoEstado: string) {
  usuario.estado = nuevoEstado;
  this.usuariosService.actualizarEstadoUsuario(usuario.id, nuevoEstado)
    .then(() => {
      console.log(`Estado de ${usuario.name} actualizado a ${nuevoEstado}`);
    })
    .catch((error) => {
      console.error('Error al actualizar el estado:', error);
    });
}
}
  