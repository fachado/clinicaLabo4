import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EstadisticasService } from '../estadisticas.service';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [CommonModule], // <-- Agrégalo aquí
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.scss'
})
export class GraficosComponent implements OnInit {
  chartVisitas!: any;
  chartPacientes!: any;
  chartMedicos!: any;
  chartSatisfaccion!: any;
  chartRecomendaciones: any;
  chartestrellas: any;

  chartAspectos!: any;
  encuestas: any[] = [];
  activeTab: string = 'estadisticas'; // La pestaña por defecto

  turnos: any[] = [];
  constructor(private estadisticasService: EstadisticasService) {}
  pacientes: any[] = [];
  pacienteSeleccionado: string = '';
  
  ngOnInit() {
    this.cargarPacientes();
    console.log("pacientes cargados",this.pacientes);
    
    

  }
 /** 📊 Escuchar encuestas en tiempo real */
 escucharEncuestas() {
  this.estadisticasService.getEncuestas().subscribe((encuestas) => {
    this.encuestas = encuestas;
    console.log("deberian ser estas",this.encuestas);
    
    this.generarGraficoSatisfaccion();
    this.generarGraficoRecomendaciones();
    this.generarGraficoAspectos();
    this.generarEstrellas();
  });
}
setActiveTab(tab: string): void {
  
  this.destroyCharts();  // Destruir los gráficos antes de cambiar de pestaña
  this.activeTab = tab;
  if (this.activeTab=="estadisticas") {
    this.escucharGraficoVisitas();
    this.escucharGraficoPacientes();
    this.escucharGraficoMedicos();
  }
  if (this.activeTab=="graficos") {

    this.escucharEncuestas();
    
  }

}destroyCharts() {
  console.log('Destruyendo gráficos...');

  if (this.chartVisitas) {
    console.log('Destruyendo gráfico de visitas');
    this.chartVisitas.destroy();
    this.chartVisitas = null;  // Asegúrate de ponerlo en null después de destruirlo
  } else {
    console.log('Gráfico de visitas ya destruido o no creado');
  }

  if (this.chartPacientes) {
    console.log('Destruyendo gráfico de pacientes');
    this.chartPacientes.destroy();
    this.chartPacientes = null;
  } else {
    console.log('Gráfico de pacientes ya destruido o no creado');
  }

  if (this.chartMedicos) {
    console.log('Destruyendo gráfico de médicos');
    this.chartMedicos.destroy();
    this.chartMedicos = null;
  } else {
    console.log('Gráfico de médicos ya destruido o no creado');
  }

  if (this.chartSatisfaccion) {
    console.log('Destruyendo gráfico de satisfacción');
    this.chartSatisfaccion.destroy();
    this.chartSatisfaccion = null;
  } else {
    console.log('Gráfico de satisfacción ya destruido o no creado');
  }

  if (this.chartRecomendaciones) {
    console.log('Destruyendo gráfico de recomendaciones');
    this.chartRecomendaciones.destroy();
    this.chartRecomendaciones = null;
  } else {
    console.log('Gráfico de recomendaciones ya destruido o no creado');
  }

  if (this.chartAspectos) {
    console.log('Destruyendo gráfico de aspectos');
    this.chartAspectos.destroy();
    this.chartAspectos = null;
  } else {
    console.log('Gráfico de aspectos ya destruido o no creado');
  }
}




/** 📌 Promedio de "Nivel de Satisfacción" */
generarEstrellas() {
  console.log("ENCUESTAS",this.encuestas);
  
  const niveles = this.encuestas.map(e => e.estrellas || 0);
  const promedio = niveles.length 
  ? niveles.map(Number).reduce((a, b) => a + b, 0) / niveles.length 
  : 0;

  console.log(niveles);
  console.log(niveles.reduce((a, b) => a + b, 0));
  console.log(niveles.length);
  console.log(promedio);
    
  if (this.chartestrellas) {
    this.chartestrellas.data.datasets[0].data = [promedio];
    this.chartestrellas.update();
  } else {
    this.chartestrellas = new Chart("chartestrellas", {
      type: 'bar',
      data: {
        labels: ['Promedio de estrellas recibidas'],
        datasets: [{ data: [promedio], backgroundColor: 'pink' }]
      },
      options: { scales: { y: { min: 1, max: 5 } } }
    });
  }
}

/** 📌 Promedio de "Nivel de Satisfacción" */
generarGraficoSatisfaccion() {
  console.log("ENCUESTAS",this.encuestas);
  
  const niveles = this.encuestas.map(e => e.satisfaccion || 0);
  const promedio = niveles.length 
  ? niveles.map(Number).reduce((a, b) => a + b, 0) / niveles.length 
  : 0;

  console.log(niveles);
  console.log(niveles.reduce((a, b) => a + b, 0));
  console.log(niveles.length);
  console.log(promedio);
    
  if (this.chartSatisfaccion) {
    this.chartSatisfaccion.data.datasets[0].data = [promedio];
    this.chartSatisfaccion.update();
  } else {
    this.chartSatisfaccion = new Chart("chartSatisfaccion", {
      type: 'bar',
      data: {
        labels: ['Satisfacción Promedio'],
        datasets: [{ data: [promedio], backgroundColor: 'blue' }]
      },
      options: { scales: { y: { min: 1, max: 5 } } }
    });
  }
}

/** 📌 Porcentaje de recomendaciones */
generarGraficoRecomendaciones() {
  const total = this.encuestas.length;
  const recomendados = this.encuestas.filter(e => e.recomienda === "Sí").length;
  const noRecomendados = total - recomendados;

  if (this.chartRecomendaciones) {
    this.chartRecomendaciones.data.datasets[0].data = [recomendados, noRecomendados];
    this.chartRecomendaciones.update();
  } else {
    this.chartRecomendaciones = new Chart("chartRecomendaciones", {
      type: 'pie',
      data: {
        labels: ['Recomienda', 'No Recomienda'],
        datasets: [{
          data: [recomendados, noRecomendados],
          backgroundColor: ['green', 'red']
        }]
      }
    });
  }
}

/** 📌 Frecuencia de aspectos más valorados */
generarGraficoAspectos() {
  const aspectos = ["Rapidez", "Amabilidad", "Limpieza", "Comodidad"];
  const frecuencias = aspectos.map(aspecto =>
    this.encuestas.filter(e => e.aspectos && e.aspectos.includes(aspecto)).length
  );

  if (this.chartAspectos) {
    this.chartAspectos.data.datasets[0].data = frecuencias;
    this.chartAspectos.update();
  } else {
    this.chartAspectos = new Chart("chartAspectos", {
      type: 'bar',
      data: {
        labels: aspectos.map(a => a.charAt(0).toUpperCase() + a.slice(1)), // Capitalizar
        datasets: [{ label: 'Veces mencionados', data: frecuencias, backgroundColor: 'orange' }]
      }
    });
  }
}










  /** 🚀 Escucha los cambios en visitas y actualiza el gráfico en tiempo real */
  escucharGraficoVisitas() {
    this.estadisticasService.getCantidadVisitas().subscribe((cantidad) => {
      if (this.chartVisitas) {
        this.chartVisitas.data.datasets[0].data = [cantidad];
        console.log("esta creado");
        
        this.chartVisitas.update();
        
      } else {
        this.chartVisitas = new Chart("chartVisitas", {
          type: 'bar',
          data: {
            labels: ['Visitas'],
            datasets: [{ label: 'Cantidad de Visitas', data: [cantidad], backgroundColor: 'blue' }]
          }
        });
      }
    });
  }

  /** 🚀 Escucha los cambios en pacientes por especialidad y actualiza el gráfico */
  escucharGraficoPacientes() {
    this.estadisticasService.getPacientesPorEspecialidad().subscribe((datos) => {
      const especialidades = Object.keys(datos);
      const cantidades = Object.values(datos);

      if (this.chartPacientes) {
        this.chartPacientes.data.labels = especialidades;
        this.chartPacientes.data.datasets[0].data = cantidades;
        this.chartPacientes.update();
      } else {
        this.chartPacientes = new Chart("chartPacientes", {
          type: 'bar',
          data: {
            labels: especialidades,
            datasets: [{ data: cantidades, backgroundColor: ['red', 'green', 'blue', 'yellow','black','cyan'] }]
          }
        });
      }
    });
  }

  /** 🚀 Escucha los cambios en médicos por especialidad y actualiza el gráfico */
  escucharGraficoMedicos() {
    this.estadisticasService.getMedicosPorEspecialidad().subscribe((datos) => {
      const especialidades = Object.keys(datos);
      const cantidades = Object.values(datos);

      if (this.chartMedicos) {
        this.chartMedicos.data.labels = especialidades;
        this.chartMedicos.data.datasets[0].data = cantidades;
        this.chartMedicos.update();
      } else {
        this.chartMedicos = new Chart("chartMedicos", {
          type: 'polarArea',
          data: {
            labels: especialidades,
            datasets: [{ data: cantidades, backgroundColor: ['purple', 'orange', 'pink', 'green', 'blue','cyan'] }]
          }
        });
      }
    });
  }

  /** 📥 Descargar gráfico como imagen */
  descargarGrafico(chartId: string) {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/jpg');
    link.download = `${chartId}.jpg`;
    link.click();
  }


   /** 🚀 Se ejecuta cuando el usuario selecciona un paciente */
   seleccionarPaciente(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pacienteSeleccionado = target.value;
    console.log('Paciente seleccionado:', this.pacienteSeleccionado);
    this.escucharTurnos();
    // Aquí puedes llamar a otro método para cargar los turnos del paciente
  }

  /** 📌 Escuchar turnos del paciente seleccionado */
  escucharTurnos() {
    if (this.pacienteSeleccionado) {
      this.estadisticasService.listenTurnosPorPaciente(this.pacienteSeleccionado);
      this.estadisticasService.getTurnosPorPaciente().subscribe(turnos => {
        this.turnos = turnos;
        console.log("tirmos",this.turnos);
        
      });
    }
  }

  cargarPacientes() {
    this.estadisticasService.getPacientes().subscribe((data) => {
      this.pacientes = data;
      console.log("pp carga",this.pacientes);
      
    });
  }

}
