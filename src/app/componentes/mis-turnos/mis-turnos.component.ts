import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { UserService } from '../../user.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltrosTurnosPipe } from '../../pipes/filtros-turnos.pipe';
import { EstadoClasePipe } from '../../pipes/estado-clase.pipe';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,FiltrosTurnosPipe,EstadoClasePipe],
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.scss']
  ,
  animations: [
    trigger('zoomFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate(
          '1000ms ease-out',
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ]),
      transition(':leave', [
        animate(
          '1000ms ease-in',
          style({ opacity: 0, transform: 'scale(0.5)' })
        )
      ])
    ])
  ]
})
export class MisTurnosComponent implements OnInit {
  turnos: any[] = [];
  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';
  filtroPaciente: string = '';
  filtroGeneral: string = '';

valorCheck!:string;
  usuario: any;
  nombre!: string;
  rol!: string;


  constructor(
    private turnosService: TurnosService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().then(user => {
      if (user?.email) {
        this.userService.getUserData(user.email).then(data => {
          if (data) {
            this.usuario = data;
            this.nombre = this.usuario.nombre;
            this.rol = this.usuario.userType;
            console.log("viene aca es",this.rol);

            if (this.rol === "especialista") {
              console.log("viene aca es");

              console.log(this.usuario.nombre);

              this.obtenerTurnosEspecialista(); 
              
            } else if (this.rol==="paciente") {
              console.log("viene aca");
              
              this.obtenerTurnos(); 

            }else{
              console.log("no paso por ninguno...");
              
            }
          }
        });
      }
    });
  }


  abrirFormularioHistoria(turnoId: string): void {
    let dinamicos: { clave: string; valor: string }[] = [];
  
    Swal.fire({
      title: 'Cargar Historia Clínica',
      html: `
        <div class="container">
          <div class="mb-3">
            <label for="altura" class="form-label">Altura (cm):</label>
            <input id="altura" type="number" class="form-control" placeholder="Ingrese la altura">
          </div>
          
          <div class="mb-3">
            <label for="peso" class="form-label">Peso (kg):</label>
            <input id="peso" type="number" class="form-control" placeholder="Ingrese el peso">
          </div>
          
          <div class="mb-3">
            <label for="temperatura" class="form-label">Temperatura (°C):</label>
            <input id="temperatura" type="number" class="form-control" placeholder="Ingrese la temperatura">
          </div>
          
          <div class="mb-3">
            <label for="presion" class="form-label">Presión (mmHg):</label>
            <input id="presion" type="text" class="form-control" placeholder="Ingrese la presión">
          </div>
          

      
                        <div id="campos-dinamicos" class="mt-3"></div>

          <button type="button" id="add-campo-dinamico" class="btn btn-secondary mt-3">
            Añadir Campo Dinámico
          </button>

        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Historia',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
      didOpen: () => {
        const addCampoDinamicoButton = document.getElementById('add-campo-dinamico') as HTMLButtonElement;

        addCampoDinamicoButton.addEventListener('click', () => {
          const index = dinamicos.length + 1;
          const container = document.getElementById('campos-dinamicos');
          
          // Limite de campos simples
          if (dinamicos.length < 3) {
            const newFieldHTML = `
              <div id="campo-dinamico-${index}" class="d-flex align-items-center gap-3 mb-2">
                <input type="text" id="clave-${index}" placeholder="Valor" class="form-control w-50" />
                <input type="text" id="valor-${index}" placeholder="Clave" class="form-control w-50" />
                <button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('campo-dinamico-${index}').remove();">
                  X
                </button>
              </div>
            `;
            container!.insertAdjacentHTML('beforeend', newFieldHTML);
            dinamicos.push({ clave: '', valor: '' });
          }
          // Campos avanzados
          else if (dinamicos.length < 6) {
            const newFieldHTML = `
            <!-- Campo de pregunta personalizada -->
            <div class="mb-3 d-flex align-items-center" id="campo-dinamico-range-">
              <div class="w-100">
                <input type="text" id="preguntaDolor-" placeholder="campo (0-100)" class="form-control mb-2" />
                <input id="nivelDolor-" type="range" min="0" max="100" value="50" class="form-range">
                <span id="valorNivelDolor-" class="form-text">50</span>
              </div>
              <button type="button" class="btn btn-danger btn-sm ms-2" onclick="document.getElementById('campo-dinamico-range-').remove();">X</button>
            </div>
          
            <!-- Campo de pregunta para la frecuencia cardiaca -->
            <div class="mb-3 d-flex align-items-center" id="campo-dinamico-number-">
              <div class="w-100">
                <input type="text" id="preguntaFrecuencia-" placeholder="campo Number" class="form-control mb-2" />
                <input id="frecuenciaCardiaca-" type="number" class="form-control" placeholder="Valor campo number">
              </div>
              <button type="button" class="btn btn-danger btn-sm ms-2" onclick="document.getElementById('campo-dinamico-number-').remove();">X</button>
            </div>
          
            <!-- Campo de pregunta para fumadores -->
            <div class="mb-3 d-flex align-items-center" id="campo-dinamico-check-">
              <div class="w-100">
                <input type="text" id="preguntaFumador-" placeholder="campo SI/NO" class="form-control mb-2" />
                <div class="form-check form-switch">
                  <input id="esFumador-" class="form-check-input" type="checkbox">
                </div>
              </div>
              <button type="button" class="btn btn-danger btn-sm ms-2" onclick="document.getElementById('campo-dinamico-check-').remove();">X</button>
            </div>
          `;
          
            container!.insertAdjacentHTML('beforeend', newFieldHTML);
        
            dinamicos.push({ clave: `campo-avanzado-`, valor: '' });
        
            // Actualizar el valor del control de rango dinámicamente
            const nivelDolorInput = document.getElementById(`nivelDolor-`) as HTMLInputElement;
            const nivelDolorValue = document.getElementById(`valorNivelDolor-`) as HTMLElement;
            nivelDolorInput.addEventListener('input', () => {
              nivelDolorValue.textContent = nivelDolorInput.value;
            });
          }
        });
        
        

      },
      preConfirm: () => {
        const altura = (document.getElementById('altura') as HTMLInputElement).value;
        const peso = (document.getElementById('peso') as HTMLInputElement).value;
        const temperatura = (document.getElementById('temperatura') as HTMLInputElement).value;
        const presion = (document.getElementById('presion') as HTMLInputElement).value;
        const camposDinamicos = Array.from(document.querySelectorAll('[id^="campo-dinamico-"]'));
        // Obtener el valor del campo de dolor (rango)
        const preguntaDolor = (document.getElementById('preguntaDolor-')as HTMLInputElement)?.value ;
const nivelDolor = (document.getElementById('nivelDolor-')as HTMLInputElement)?.value ; // Valor por defecto 50
const valorNivelDolor = document.getElementById('valorNivelDolor-')?.textContent ; // Valor por defecto 50

// Obtener el valor del campo de frecuencia cardiaca
const preguntaFrecuencia = (document.getElementById('preguntaFrecuencia-')as HTMLInputElement)?.value ;
const frecuenciaCardiaca = (document.getElementById('frecuenciaCardiaca-')as HTMLInputElement)?.value ;

// Obtener el valor del campo de fumador
const preguntaFumador = (document.getElementById('preguntaFumador-')as HTMLInputElement)?.value;
const esFumador = (document.getElementById('esFumador-') as HTMLInputElement)?.checked; // Valor por defecto false
        if (!altura || !peso || !temperatura || !presion) {
          Swal.showValidationMessage('Todos los datos fijos son obligatorios');
          return null;
        }


// Convertir el valor booleano en "Sí" o "No"
const resultado = esFumador ? 'Sí' : 'No';

console.log("resultado ",resultado); // Imprime "Sí" o "No" dependiendo del valor de esFumador

// Mostrar los valores en consola o usarlos según sea necesario
console.log('Pregunta Dolor:', preguntaDolor, 'Nivel Dolor:', nivelDolor, 'Valor Nivel Dolor:', valorNivelDolor);
console.log('Pregunta Frecuencia:', preguntaFrecuencia, 'Frecuencia Cardiaca:', frecuenciaCardiaca);
console.log('Pregunta Fumador:', preguntaFumador, 'Es Fumador:', esFumador);

        dinamicos = camposDinamicos.map((campo) => {
          const clave = (campo.querySelector(`#${campo.id} [id^="clave"]`) as HTMLInputElement)?.value;
          const valor = (campo.querySelector(`#${campo.id} [id^="valor"]`) as HTMLInputElement)?.value;
          
          return { clave, valor };
          
        });
  
        if (!altura || !peso || !temperatura || !presion) {
          Swal.showValidationMessage('Todos los datos fijos son obligatorios');
          return null;
        }
 
        return {
          altura: parseFloat(altura),
          peso: parseFloat(peso),
          temperatura: parseFloat(temperatura),
          presion,
          dinamicos: [
            ...dinamicos.filter(d => d.clave && d.valor),  // campos dinámicos generales
            // Solo agregar la clave/valor si el valor no es undefined o null
            valorNivelDolor !== undefined ? { clave: preguntaDolor, valor: valorNivelDolor } : null,
            frecuenciaCardiaca !== undefined ? { clave: preguntaFrecuencia, valor: frecuenciaCardiaca } : null,
            esFumador !== undefined ? { clave: preguntaFumador, valor: resultado } : null,
        ].filter(Boolean) // Filtrar los elementos nulos o undefined
    };
  },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const historia = result.value;
        this.turnosService.cargarHistoriaClinica(turnoId, historia)
          .then(() => {
            Swal.fire('Éxito', 'La historia clínica ha sido guardada.', 'success');
          })
          .catch((error) => {
            Swal.fire('Error', 'No se pudo guardar la historia clínica.', 'error');
            console.error(error);
          });
      }
    });

    
  }
  
  












  obtenerTurnos(): void {
    this.turnosService.getTurnos().subscribe({
      next: (data) => {
        this.turnos = data.filter(turno => turno.paciente === this.nombre);
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

  
  obtenerTurnosEspecialista(): void {
    this.turnosService.getTurnos().subscribe({
      next: (data) => {
        this.turnos = data.filter(turno => turno.especialista === this.nombre);
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
  

  cancelarTurno(turnoId: string): void {
    const turno = this.turnos.find(t => t.id === turnoId);
    if (turno && turno.estado !== 'Realizado') {
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
          this.turnosService.cancelarTurno(turnoId, comentario).then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Turno Cancelado',
              text: 'El turno ha sido cancelado correctamente.'
            });
            if (this.rol === "especialista") {
              console.log("viene aca es");

              console.log(this.usuario.nombre);

              this.obtenerTurnosEspecialista(); 
              
            } else if (this.rol==="paciente") {
              console.log("viene aca");
              
              this.obtenerTurnos(); 

            }else{
              console.log("no paso por ninguno...");
              
            }
           // Actualizar la lista de turnos
          }).catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cancelar el turno.'
            });
            console.error('Error al cancelar el turno:', error);
          });
        }
      });
    }
  }

  rechazarTurno(turnoId: string): void {
    const turno = this.turnos.find(t => t.id === turnoId);
    if (turno && turno.estado !== 'Realizado' && turno.estado !== 'Cancelado') {
      Swal.fire({
        title: '¿Está seguro?',
        text: 'Ingrese el motivo del rechazo:',
        input: 'text',
        inputPlaceholder: 'Escribe el motivo aquí...',
        showCancelButton: true,
        confirmButtonText: 'Rechazar Turno',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const comentario = result.value;
          this.turnosService.rechazarTurno(turnoId, comentario).then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Turno Rechazado',
              text: 'El turno ha sido rechazado correctamente.'
            });
                        if (this.rol === "especialista") {
              console.log("viene aca es");

              console.log(this.usuario.nombre);

              this.obtenerTurnosEspecialista(); 
              
            } else if (this.rol==="paciente") {
              console.log("viene aca");
              
              this.obtenerTurnos(); 

            }else{
              console.log("no paso por ninguno...");
              
            } // Actualizar la lista de turnos
          }).catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo rechazar el turno.'
            });
            console.error('Error al rechazar el turno:', error);
          });
        }
      });
    }
  }

  aceptarTurno(turnoId: string): void {
    this.turnosService.aceptarTurno(turnoId).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Turno Aceptado',
        text: 'El turno ha sido aceptado correctamente.'
      });
      if (this.rol === "especialista") {
        console.log("viene aca es");

        console.log(this.usuario.nombre);

        this.obtenerTurnosEspecialista(); 
        
      } else if (this.rol==="paciente") {
        console.log("viene aca");
        
        this.obtenerTurnos(); 

      }else{
        console.log("no paso por ninguno...");
        
      } // Actualizar la lista de turnos
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo aceptar el turno.'
      });
      console.error('Error al aceptar el turno:', error);
    });
  }

 
  // Función para finalizar un turno
  finalizarTurno(turnoId: string): void {
    const turno = this.turnos.find(t => t.id === turnoId);
    if (turno && turno.estado === 'Aceptado') {
      // Solicitar reseña al finalizar turno
      Swal.fire({
        title: '¿Está seguro?',
        text: 'Ingrese su comentario o diagnóstico:',
        input: 'textarea',
        inputPlaceholder: 'Escribe tu comentario aquí...',
        showCancelButton: true,
        confirmButtonText: 'Finalizar Turno',
        cancelButtonText: 'Cancelar',
        inputAttributes: {
          'aria-label': 'Escribe el comentario sobre el turno'
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const comentario = result.value;
          
          // Llamar al servicio para finalizar el turno con el comentario
          this.turnosService.finalizarTurno(turnoId, comentario).then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Turno Finalizado',
              text: 'El turno ha sido finalizado correctamente.'
            });
  
            // Actualizar la lista de turnos según el rol
            if (this.rol === "especialista") {
              this.obtenerTurnosEspecialista(); // Actualizar turnos de especialista
            } else if (this.rol === "paciente") {
              this.obtenerTurnos(); // Actualizar turnos de paciente
            }
          }).catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo finalizar el turno.'
            });
            console.error('Error al finalizar el turno:', error);
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El turno no se encuentra en estado "Aceptado" para finalizar.'
      });
    }
  }


  verResena(turnoId: string): void {
    const turno = this.turnos.find(t => t.id === turnoId);
    if (turno) {
      Swal.fire({
        title: 'Reseña del Turno',
        text: turno.ComentarioFinalizado,
        confirmButtonText: 'Cerrar'
      });
    }
  }











  calificarAtencion(turnoId: string): void {
    Swal.fire({
      title: 'Calificar Atención',
      html: `
        <div class="mb-3">
          <label for="calificacion" class="form-label">¿Cómo calificaría la atención recibida?</label>
          <select id="calificacion" class="form-control">
            <option value="" disabled selected>Seleccione una calificación</option>
            <option value="5">5 - Excelente</option>
            <option value="4">4 - Muy buena</option>
            <option value="3">3 - Buena</option>
            <option value="2">2 - Regular</option>
            <option value="1">1 - Mala</option>
          </select>
        </div>
        
        <div class="mb-3">
          <label for="comentario" class="form-label">Comentario sobre la atención del especialista:</label>
          <textarea id="comentario" class="form-control" placeholder="Escriba un comentario..." rows="3"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Calificar Atención',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary',
      },
      buttonsStyling: false,
      preConfirm: () => {
        const calificacion = (document.getElementById('calificacion') as HTMLSelectElement).value;
        const comentario = (document.getElementById('comentario') as HTMLTextAreaElement).value;
  
        if (!calificacion) {
          Swal.showValidationMessage('Debe seleccionar una calificación.');
          return null;
        }
  
        return { calificacion: parseInt(calificacion, 10), comentario };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const calificacion = result.value;
        this.turnosService.calificarAtencion(turnoId, calificacion)
          .then(() => {
            Swal.fire('Éxito', 'La calificación ha sido enviada.', 'success');
          })
          .catch((error) => {
            Swal.fire('Error', 'No se pudo enviar la calificación.', 'error');
            console.error(error);
          });
      }
    });
  }
  



  completarEncuesta(turnoId: string): void {
    Swal.fire({
      title: 'Completar Encuesta',
      html: `
        <div class="mb-3">
          <label for="puntualidad" class="form-label">Puntualidad del especialista:</label>
          <select id="puntualidad" class="form-control">
            <option value="" disabled selected>Seleccione una opción</option>
            <option value="Muy satisfecho">Muy satisfecho</option>
            <option value="Satisfecho">Satisfecho</option>
            <option value="Insatisfecho">Insatisfecho</option>
          </select>
        </div>
  
        <div class="mb-3">
          <label for="atencion" class="form-label">Atención recibida en la clinica:</label>
          <select id="atencion" class="form-control">
            <option value="" disabled selected>Seleccione una opción</option>
            <option value="Muy satisfecho">Muy satisfecho</option>
            <option value="Satisfecho">Satisfecho</option>
            <option value="Insatisfecho">Insatisfecho</option>
          </select>
        </div>
  
        <div class="mb-3">
          <label for="ambiente" class="form-label">Ambiente y comodidad:</label>
          <select id="ambiente" class="form-control">
            <option value="" disabled selected>Seleccione una opción</option>
            <option value="Muy satisfecho">Muy satisfecho</option>
            <option value="Satisfecho">Satisfecho</option>
            <option value="Insatisfecho">Insatisfecho</option>
          </select>
        </div>
  
      
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar Encuesta',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary',
      },
      buttonsStyling: false,
      preConfirm: () => {
        const puntualidad = (document.getElementById('puntualidad') as HTMLSelectElement).value;
        const atencion = (document.getElementById('atencion') as HTMLSelectElement).value;
        const ambiente = (document.getElementById('ambiente') as HTMLSelectElement).value;
  
        if (!puntualidad || !atencion || !ambiente) {
          Swal.showValidationMessage('Debe responder todas las preguntas obligatorias.');
          return null;
        }
  
        return { puntualidad, atencion, ambiente };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const encuesta = result.value;
        this.turnosService.completarEncuesta(turnoId, encuesta)
          .then(() => {
            Swal.fire('Éxito', 'La encuesta ha sido enviada.', 'success');
          })
          .catch((error) => {
            Swal.fire('Error', 'No se pudo enviar la encuesta.', 'error');
            console.error(error);
          });
      }
    });
  }
  
  









}
