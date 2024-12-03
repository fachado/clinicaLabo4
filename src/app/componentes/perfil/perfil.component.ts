import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';
import { TurnosService } from '../../services/turnos.service';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { UsuarioestiloDirective } from '../../directives/usuarioestilo.directive';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,UsuarioestiloDirective],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  animations: [
    trigger('bounceIn', [
      transition(':enter', [
        animate('1s', keyframes([
          style({ transform: 'translateY(-100%)', offset: 0 }),
          style({ transform: 'translateY(30px)', offset: 0.5 }),
          style({ transform: 'translateY(-10px)', offset: 0.7 }),
          style({ transform: 'translateY(0)', offset: 1 }),
        ]))
      ])
    ])
  ]
})
export class PerfilComponent implements OnInit {
[x: string]: any;
  usuario: any = null;
  userImageUrl: string | null = null;
  horariosForm: FormGroup;
  turnos: any[] = [];
  nombre!: string;
  historiasClinicas: any[] = []; // Turnos con historia clínica
  logoUrl = "";  // Ruta del logo
  especialistas: string[] =[];
  diasDeLaSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  especialistaSeleccionado: string = 'todos';  // Variable para el filtro
  historiasFiltradas: any[] = []; // Array para las historias filtradas

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private turnosService:TurnosService,
  ) {
    this.horariosForm = this.fb.group({
      horarios: this.fb.array([]),
    });
  }


  // Método para aplicar el filtro basado en el especialista seleccionado
  applyFilter(): void {

    if (this.especialistaSeleccionado === 'todos') {
      console.log("entre primero");
      
      this.historiasFiltradas = this.historiasClinicas; // Mostrar todas si se selecciona "todos"
      console.log(this.historiasFiltradas);
      
    } else {
      this.historiasFiltradas = this.historiasClinicas.filter(historia => historia.especialista === this.especialistaSeleccionado);
    }
  }
  
 
  async ngOnInit() {

    try {
      // Obtener los especialistas
      const especialistasData = await this.userService.getEspecialistas();
      this.especialistas = especialistasData.map(e => e.nombre); // Ajusta según los datos
      // Filtrar las historias clínicas al cargar el componente
      console.log("sali primero");

    } catch (error) {
      console.error('Error al obtener especialistas', error);
    }
    this.userService.getCurrentUser().then(user => {
      if (user?.email) {
        this.userService.getUserData(user.email).then(data => {
          if (data) {
            this.usuario = data;
            this.userImageUrl = this.usuario.imagenes || null;
            this.nombre = this.usuario.nombre;
            this.obtenerTurnos();
            this.applyFilter();
            this.cargarHorariosGuardados(this.usuario.email);
          }
        });
      }
    });
    try {
      // Llamamos al servicio para obtener los especialistas
      const especialistasData = await this.userService.getEspecialistas();
      // Si solo necesitas los nombres de los especialistas:
      this.especialistas = especialistasData.map(e => e.nombre); // O la propiedad que necesites
      console.log("esp", this.especialistas);
      
    } catch (error) {
      console.error('Error al obtener especialistas', error);
    }
  }


  obtenerTurnos(): void {
    this.turnosService.getTurnos().subscribe({
      next: (data) => {
        // Filtramos los turnos por paciente
        this.turnos = data.filter(turno => turno.paciente === this.nombre);
        // Filtramos aquellos turnos que tienen historia clínica
        this.historiasClinicas = this.turnos.filter(turno => turno.HistoriaClinica);
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

  generatePDF(historiaList: any[]) {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
  
    // Logo de la clínica y nombre
    const imageUrl = "https://res.cloudinary.com/duzk2vrqy/image/upload/v1733190640/pngwing.com_unfodu.png";
    doc.addImage(imageUrl, 'png', 5, 5, 20, 20);  // Ajusta el logo en la parte superior izquierda
    
    // Barra de encabezado
    doc.setFillColor(0, 51, 102);  // Azul oscuro
    doc.rect(0, 30, doc.internal.pageSize.width, 20, 'F');  // Barra de encabezado
  
    // Nombre de la clínica al lado del logo
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);  // Blanco
    doc.text('Clínica Trafalgar', doc.internal.pageSize.width / 2, 15, { align: 'center' });  // Alinea el texto al lado del logo
    
    // Título del documento centrado
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);  // Azul oscuro
    doc.text('Historia Clínica:', doc.internal.pageSize.width / 2 - 60, 24, { align: 'center' });
  
    // Fecha de emisión
    const fechaEmision = new Date().toLocaleDateString();  // Formato de fecha "dd/mm/yyyy"
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);  // Color negro
    doc.text(`Fecha de emisión: ${fechaEmision}`, 10, 40);
    // Filtrar las historias clínicas según el especialista seleccionado
    let historiasFiltradas = historiaList;
  
    if (this.especialistaSeleccionado !== 'todos') {
      historiasFiltradas = historiaList.filter(historia => historia.especialista === this.especialistaSeleccionado);
    }
  
    if (historiasFiltradas.length === 0) {
      doc.text('No se encontraron historias clínicas para el especialista seleccionado.', 10, 50);
    } else {
      // Recorrer cada historia clínica filtrada
      historiasFiltradas.forEach((historia, index) => {
        const cardWidth = 180;  // Ancho de la tarjeta
        const cardHeight = 200;  // Alto de la tarjeta
        const marginLeft = 10;  // Margen izquierdo
        const marginTop = 60;  // Espaciado entre tarjetas (evitar que se sobrepongan)
  
        // Fondo de la tarjeta (color de fondo)
        doc.setFillColor(240, 240, 240);  // Color gris claro para el fondo
        doc.rect(marginLeft, marginTop, cardWidth, cardHeight, 'F');  // Dibuja el fondo de la tarjeta
  
        // Información de la historia clínica
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);  // Color azul oscuro
        doc.text(`Historia Clínica ${index + 1}`, marginLeft + 10, marginTop + 15);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);  // Color negro
        doc.text(`Paciente: ${this.usuario.nombre} ${this.usuario.apellido}`, marginLeft + 10, marginTop + 30);
        doc.text(`Especialidad: ${historia.especialidad}`, marginLeft + 10, marginTop + 40);
        doc.text(`Especialista: ${historia.especialista}`, marginLeft + 10, marginTop + 50);
        doc.text(`Fecha de solicitud: ${historia.dia}`, marginLeft + 10, marginTop + 60);
        doc.text(`Hora: ${historia.horario.horaInicio}`, marginLeft + 10, marginTop + 70);
        doc.text(`Estado: ${historia.estado}`, marginLeft + 10, marginTop + 80);
  
        // Detalles de la historia clínica
        doc.text(`Presión: ${historia.HistoriaClinica.presion}`, marginLeft + 10, marginTop + 90);
        doc.text(`Peso: ${historia.HistoriaClinica.peso} kg`, marginLeft + 10, marginTop + 100);
        doc.text(`Temperatura: ${historia.HistoriaClinica.temperatura}°C`, marginLeft + 10, marginTop + 110);
        doc.text(`Altura: ${historia.HistoriaClinica.altura} cm`, marginLeft + 10, marginTop + 120);
  
        // Comentarios finales (en cursiva y gris)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(102, 102, 102);  // Color gris
        doc.text(`Comentario: ${historia.ComentarioFinalizado}`, marginLeft + 10, marginTop + 130);
  
        // Datos dinámicos (si existen)
        if (historia.HistoriaClinica.dinamicos && historia.HistoriaClinica.dinamicos.length > 0) {
          let yOffset = marginTop + 140;
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 51, 102);  // Color azul
          doc.text('Datos Dinámicos:', marginLeft + 10, yOffset);
  
          historia.HistoriaClinica.dinamicos.forEach((dato: { clave: any; valor: any; }) => {
            yOffset += 10;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);  // Color negro
            doc.text(`${dato.clave}: ${dato.valor}`, marginLeft + 10, yOffset);
          });
        }
  
        // Agregar un salto de página si no es la última historia
        if (index < historiasFiltradas.length - 1) {
          doc.addPage();
        }
      });
    }
  
    // Guardar el PDF
    doc.save(`${this.usuario.nombre}-historias-clinicas.pdf`);
  }
  

  verResena(): void {
    // Buscamos todos los turnos que correspondan al paciente (si hay más de uno)
    const turnosDelPaciente = this.turnos.filter(t => t.paciente === this.nombre);
    console.log(this.turnos);
    console.log(turnosDelPaciente);
    console.log(this.nombre);
  
    // Si encontramos turnos para el paciente
    if (turnosDelPaciente.length > 0) {
      // Aquí puedes elegir cómo mostrar las historias clínicas, por ejemplo, la primera historia clínica
      const turnoConHistoria = turnosDelPaciente.find(t => t.HistoriaClinica); // Busca el primer turno con historia clínica
      if (turnoConHistoria) {
        // Si el turno tiene historia clínica, mostramos una alerta con la historia clínica
        Swal.fire({
          title: 'Historia Clínica',
          text: turnoConHistoria.HistoriaClinica,
          confirmButtonText: 'Cerrar'
        });
      } else {
        // Si no hay historia clínica en el turno, mostrar mensaje adecuado
        Swal.fire({
          title: 'Sin Historia Clínica',
          text: 'Este turno no tiene historia clínica disponible.',
          confirmButtonText: 'Cerrar'
        });
      }
    } else {
      // Si no se encuentran turnos para el paciente
      Swal.fire({
        title: 'No se encontraron turnos',
        text: 'No tienes turnos disponibles o no se encuentran turnos asociados a tu nombre.',
        confirmButtonText: 'Cerrar'
      });
    }
  }
  






  // Cargar horarios guardados desde Firebase
 // Cargar horarios guardados desde Firebase
 cargarHorariosGuardados(email: string): void {
  this.userService.obtenerDisponibilidad(email).then(data => {
    const disponibilidad = data?.disponibilidad || [];
    if (disponibilidad.length > 0) {
      const horariosArray = disponibilidad.map((item: any, index: number) => {
        // Asignar la especialidad correspondiente según el índice
        const especialidad = this.usuario?.especialidad[index] || '';
        console.log("guarda esta especilidad",especialidad);
        
        return this.fb.group({
          nombre: [especialidad],  // Guarda solo la especialidad correspondiente
          // Usa la especialidad correspondiente del usuario
          diasSeleccionados: this.fb.group({
            Lunes: [item.diasSeleccionados?.Lunes || false],
            Martes: [item.diasSeleccionados?.Martes || false],
            Miércoles: [item.diasSeleccionados?.Miércoles || false],
            Jueves: [item.diasSeleccionados?.Jueves || false],
            Viernes: [item.diasSeleccionados?.Viernes || false],
            Sábado: [item.diasSeleccionados?.Sábado || false],
          }),
          horaInicio: [item.horaInicio || '', Validators.required],
          horaFin: [item.horaFin || '', [Validators.required, this.horaFinValidator]],
          tiempoTurno: [item.tiempoTurno || 30, [Validators.required, Validators.min(1)]],
        });
      });

      this.horariosForm.setControl('horarios', this.fb.array(horariosArray));
    } else {
      this.initHorarios(); // Inicializa con valores predeterminados si no hay disponibilidad
    }
  }).catch(error => {
    console.error('Error al cargar horarios:', error);
    alert('No se pudieron cargar los horarios guardados.');
  });
}


// C// Crear un nuevo grupo de horario con especialidad específica
createHorario(especialidad: string): FormGroup {
  return this.fb.group({
    nombre: [especialidad],  // Guarda solo la especialidad correspondiente
    diasSeleccionados: this.fb.group({
      Lunes: [false],
      Martes: [false],
      Miércoles: [false],
      Jueves: [false],
      Viernes: [false],
      Sábado: [false],
    }),
    horaInicio: ['', Validators.required],
    horaFin: ['', [Validators.required, this.horaFinValidator]],
    tiempoTurno: [30, [Validators.required, Validators.min(1)]],
  });
}

// Inicializa los horarios
initHorarios(): void {
  const especialidades = this.usuario?.especialidad || [];  // Lista de especialidades
  const horariosArray = especialidades.map((especialidad: string) => {
    return this.createHorario(especialidad); 
  });
  this.horariosForm.setControl('horarios', this.fb.array(horariosArray));
}


  

  // Validación de que la hora de fin no sea menor que la de inicio
  horaFinValidator(control: any): { [key: string]: boolean } | null {
    const horaInicio = control.parent?.get('horaInicio')?.value;
    const horaFin = control.parent?.get('horaFin')?.value;

    if (horaFin <= horaInicio) {
      return { horaFinInvalida: true };
    }
    return null;
  }

  // Obtener el array de horarios desde el formulario
  get horarios(): FormArray {
    return this.horariosForm.get('horarios') as FormArray;
  }


  // Eliminar un horario
  removeHorario(index: number): void {
    this.horarios.removeAt(index);
  }

  // Guardar los horarios en Firebase
  guardarHorarios(): void {
    
    if (this.horariosForm.valid) {
      const horarios = this.horariosForm.value.horarios;
      this.userService.guardarHorarios(this.usuario.email, horarios)
        .then(() =>Swal.fire('Éxito', 'Los horarios han sido guardados.', 'success')
      )
        .catch(error => Swal.fire('Éxito', 'Los horarios no han sido guardados.', 'error'))}
  }
}
