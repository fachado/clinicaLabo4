import { Component, HOST_TAG_NAME, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TurnosService } from '../../services/turnos.service';
import { trigger, group, style, animate, transition, query, animateChild,  } from '@angular/animations';

interface Horario {
  nombre: string;
  diasSeleccionados: { [key: string]: boolean }; // Mapeo de días a booleanos
  horaInicio: string; // Ejemplo: "08:00"
  horaFin: string; // Ejemplo: "17:00"
  tiempoTurno: number; // Ejemplo: 30 (minutos)
}

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }), 
        animate('800ms ease-out', style({ transform: 'translateX(0)' })) 
      ]),
      transition(':leave', [
        animate('800ms ease-in', style({ transform: 'translateX(-100%)' })) 
      ])
    ])
  ]
  
})
export class SolicitarTurnoComponent implements OnInit {
  solicitarTurnoForm: FormGroup;
  especialidades: any[] = []; // Lista de especialidades disponibles (con imágenes)
  especialistas: any[] = []; // Especialistas filtrados por especialidad seleccionada
  horariosDisponibles: any[] = []; // Días y horarios filtrados según el especialista
  fechasDisponibles: string[] = []; // Fechas disponibles para selección
  usuario: any = null;
  especialidadSeleccionada: any;
  especialistaSeleccionado: any;
  turnos: any[] = [];

  esAdministrador: boolean = false; // Variable para diferenciar roles
  pacientes: any[] = []; // Lista de pacientes (para administrador)
  horarioSeleccionado: { horaInicio: string, horaFin: string } | null = null; // Variable para almacenar el horario seleccionado
  fecha: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService ,
    private turnosService: TurnosService // Servicio para consultar datos
    // Servicio para consultar datos
  ) {
    this.solicitarTurnoForm = this.fb.group({
      especialidad: ['', Validators.required],
      especialista: ['', Validators.required],
      dia: ['', Validators.required],
      horario: [{ value: '', disabled: true }, Validators.required], // Horarios deshabilitados inicialmente
      paciente: [null], // Solo necesario para el administrador
      
    });
    this.obtenerTurnos();
  }





  obtenerTurnos(): void {
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
  estaOcupado(fecha: string, especialidad: string, horaini: string,horafin:String,especialista:String): boolean {
    
    if (!this.turnos || this.turnos.length === 0) {
      console.log("ocupado ",fecha,especialidad,horaini,horafin);

      return false; // Si no hay turnos cargados, asumimos que no está ocupado.
    }
    console.log(this.turnos);
    console.log("ocupado ",fecha,especialidad,horaini,horafin,especialista);

  
    return this.turnos.some(turno => 
      turno.dia === fecha && 
      turno.especialidad === especialidad && 
      turno.horario.horaInicio === horaini &&
      turno.horario.horaFin === horafin &&
      turno.especialista === especialista

    );
  }









  ngOnInit(): void {
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
    this.cargarEspecialidades();
  }

  // Cargar especialidades disponibles (con imagen)
  private cargarEspecialidades(): void {
    this.userService.getEspecialidades().then(especialidades => {
      this.especialidades = especialidades;
    });
  }

    // Aquí puedes hacer lo que necesites con el valor de especialidad

  // Filtrar especialistas según especialidad seleccionada
  onEspecialidadChange(especialidad: any): void {
    this.especialidadSeleccionada = especialidad;
    console.log("esp",this.especialidadSeleccionada);
    
    this.userService.getEspecialistasByEspecialidad(this.especialidadSeleccionada).then(especialistas => {
      this.especialistas = especialistas.map((especialista: any) => ({
        ...especialista,
        imagen: especialista.imagenes , // Imagen por defecto si no tiene
      }));
      console.log("hola",this.especialistas);
      
    });
  }

  // Este es el método que se llama cuando se hace clic en un botón
   

  onEspecialistaChange(especialista: any): void {
    this.especialistaSeleccionado = especialista

    if (this.especialistaSeleccionado) {
      console.log('Especialista seleccionado:', this.especialistaSeleccionado);
      const especialistaEmail = this.especialistaSeleccionado.email;

      this.userService.obtenerDisponibilidad(especialistaEmail).then(disponibilidad => {
        console.log("disp", disponibilidad);
        this.filtrarFechasDisponibles(disponibilidad, this.especialidadSeleccionada);
      });
    } else {
      console.error('No se seleccionó un especialista válido.');
    }
  }

  // Filtrar fechas disponibles para los próximos 15 días
  private filtrarFechasDisponibles(disponibilidadObj: { disponibilidad: Horario[] }, especialidad: string): void {
    if (!disponibilidadObj || !disponibilidadObj.disponibilidad || !Array.isArray(disponibilidadObj.disponibilidad)) {
      console.error('La disponibilidad es inválida:', disponibilidadObj);
      return;
    }

    const disponibilidad = disponibilidadObj.disponibilidad;
    const hoy = new Date();
    console.log("DIA DE HOY: ",hoy);
    
    // Crear array de los próximos 15 días
    const proximos15Dias = Array.from({ length: 15 }, (_, i) => {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      return fecha;
    });

    // Filtrar los días en los que el especialista trabaja
    const fechasUnicas: string[] = [];

    proximos15Dias.forEach(fecha => {
      const diaSemana = this.getDiaDeLaSemana(fecha); // Convertir fecha a día (ej. "Lunes")
      console.log("dia:", diaSemana);

      // Filtrar las fechas que corresponden a días que trabaja el especialista
      const fechasDia = disponibilidad.filter((horario: Horario) =>
        horario.diasSeleccionados[diaSemana] && horario.nombre === especialidad
      );
      console.log("fechasdsa:", fechasDia);

      if (fechasDia.length > 0) {
        // Si el especialista tiene turnos ese día, agregar la fecha
        fechasUnicas.push(`${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`);
      }
    });

    this.fechasDisponibles = fechasUnicas;
    console.log('Fechas disponibles:', this.fechasDisponibles);
  }

  // Cargar horarios para una fecha seleccionada
  onFechaChange(fecha: string): void {
    console.log("por aca vamos", fecha, "hola?", this.especialistaSeleccionado, "hola2", this.especialidadSeleccionada);
    this.fecha = fecha
    if (fecha && this.especialistaSeleccionado) {
      this.userService.obtenerDisponibilidad(this.especialistaSeleccionado.email).then(disponibilidad => {
        this.filtrarHorariosDisponibles(disponibilidad, this.especialidadSeleccionada, fecha);
      });
    }
  }

  // Filtrar horarios disponibles según la fecha seleccionada
  private filtrarHorariosDisponibles(disponibilidadObj: { disponibilidad: Horario[] }, especialidad: string, fechaSeleccionada: string): void {
    if (!disponibilidadObj || !disponibilidadObj.disponibilidad || !Array.isArray(disponibilidadObj.disponibilidad)) {
      console.error('La disponibilidad es inválida:', disponibilidadObj);
      return;
    }
    const fechaSeleccionada2 = "2024-12-02"; // Ejemplo de fecha seleccionada

    const disponibilidad = disponibilidadObj.disponibilidad;
    console.log("fecha select",fechaSeleccionada);

    const horariosUnicos: any[] = [];
    const ahora = new Date();
// Crear una fecha en la zona horaria de Argentina manualmente
const [day, month, year] = fechaSeleccionada.split('-').map(Number); // Formato "DD-MM-YYYY"
const fecha = new Date(year, month - 1, day, ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), ahora.getMilliseconds());
console.log(fecha);

    // Formatear la fecha para Argentina
    const fechaFormateada = fecha.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    console.log(fechaFormateada);

    // Obtener el día de la semana
    const diaSemana = this.getDiaDeLaSemana(fecha);
    console.log(diaSemana);

    // Filtrar los horarios para el día seleccionado y la especialidad
    const horariosDia = disponibilidad.filter((horario: Horario) =>
      horario.diasSeleccionados[diaSemana] && horario.nombre === especialidad,
    );
    console.log("horarios", horariosDia);

    // Generar los turnos para ese día
    horariosDia.forEach((horario: Horario) => {
      const inicio = this.convertirHoraAFecha(horario.horaInicio, fecha);
      const fin = this.convertirHoraAFecha(horario.horaFin, fecha);
      let actual = new Date(inicio);

      // Generar los turnos por intervalos
      while (actual < fin) {
        const siguienteHora = new Date(actual.getTime() + horario.tiempoTurno * 60000);
        if (siguienteHora <= fin) {
          const turno = {
            fecha: fechaSeleccionada,
            horaInicio: actual.toTimeString().slice(0, 5),
            horaFin: siguienteHora.toTimeString().slice(0, 5),
          };

          // Verificar si ya existe ese turno
          const turnoExistente = horariosUnicos.some((t: any) => t.fecha === turno.fecha && t.horaInicio === turno.horaInicio && t.horaFin === turno.horaFin);
          if (!turnoExistente) {
            horariosUnicos.push(turno);
          }
        }
        actual = siguienteHora;
      }
    });

    this.horariosDisponibles = horariosUnicos;
    console.log('Horarios disponibles:', this.horariosDisponibles);
  }

  // Convertir una hora (en formato "HH:MM") a una fecha con hora en el día seleccionado
  private convertirHoraAFecha(hora: string, fecha: Date): Date {
    const [horas, minutos] = hora.split(':').map(Number);
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setHours(horas, minutos, 0, 0);
    return nuevaFecha;
  }

  // Función para obtener el nombre del día de la semana (Ejemplo: "Lunes")
  private getDiaDeLaSemana(fecha: Date): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[fecha.getDay()];
  }

  // Método para enviar el formulario
  onSubmit(): void {
    if (this.solicitarTurnoForm.valid) {
      console.log('Formulario enviado:', this.solicitarTurnoForm.value);
    }
  }

  onHorarioSeleccionado(horario: { horaInicio: string, horaFin: string }): void {
    console.log("entra aca?",horario);
    
    this.horarioSeleccionado = horario;
    console.log(this.horarioSeleccionado);

    console.log('Horario seleccionado:', this.horarioSeleccionado);
  }

  solicitarTurno(): void {

    const formData = this.solicitarTurnoForm.value;
    console.log('Formulario:', formData);
    console.log(this.horarioSeleccionado);
    
    // Crear objeto de turno con la fecha, los datos del formulario y el horario seleccionado
    const turno = {
      especialidad: this.especialidadSeleccionada,
      especialista: this.especialistaSeleccionado.nombre,
      dia: this.fecha,
      horario: this.horarioSeleccionado, // Incluir el horario seleccionado
      paciente: this.usuario.nombre,
      fechaSolicitud: new Date().toISOString().split('T')[0],  // Fecha de solicitud del turno
      estado: "pendiente" , // Fecha de solicitud del turno


    };
  
    // Guardar el turno en Firestore
    this.userService.guardarTurno(turno)
      .then(() => {
        Swal.fire({
          title: "Turno solicitado correctamente",
          text: `Día: ${this.fecha}, Horario: ${this.horarioSeleccionado?.horaInicio} - Especialista: ${this.especialistaSeleccionado.nombre}`,
          icon: "success",
          confirmButtonText: "Aceptar"
        });
        
        console.log('Turno guardado:', turno);
        this.solicitarTurnoForm.reset(); // Resetear el formulario
        this.horarioSeleccionado = null; // Resetear el horario seleccionado
      })
      .catch((error) => {
        Swal.fire({
          title: "Error al solicitar el turno",
          text: "Hubo un problema al guardar el turno. Por favor, intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Cerrar"
        });
        console.error("Error al guardar turno:", error);
      });
  }
}  
