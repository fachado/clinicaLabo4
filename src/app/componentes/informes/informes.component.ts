import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Firestore, collection, getDocs, onSnapshot } from '@angular/fire/firestore'; // Importamos onSnapshot
import * as XLSX from 'xlsx'; // Para exportar a Excel
import jsPDF from 'jspdf'; // Para exportar a PDF
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';  // Importamos Chart.js y los elementos necesarios
import html2canvas from 'html2canvas'; // Importamos html2canvas
import {  query, where } from '@angular/fire/firestore';
import { trigger, transition, style, animate } from '@angular/animations';

interface Log {
  usuario: string;
  fecha: string;
}

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './informes.component.html',
  styleUrls: ['./informes.component.scss'],
  animations: [
    trigger('slideFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate(
          '1000ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate(
          '1000ms ease-in',
          style({ opacity: 0, transform: 'translateY(50px)' })
        )
      ])
    ])
  ]
})
export class InformesComponent implements OnInit, AfterViewInit {
  logs: Log[] = []; // Almacenará los logs
  loading: boolean = true;
  cantidadTurnosPorEspecialidad: { [especialidad: string]: number } = {};
  chartData: any; // Datos para el gráfico (usamos tipo any para Chart.js)
  chartType: string = 'bar'; // Tipo de gráfico
  chart!: Chart; // Declaramos el gráfico
  fechaSeleccionada: string | null = null;  // Fecha y hora seleccionada en formato ISO string
  turnosPorDia: any[] = [];  // Datos de turnos por día
  chartDias: any;  // Instancia del gráfico
  fechaInicio: string | null = null; // Fecha inicial seleccionada
  fechaFin: string | null = null; // Fecha final seleccionada
  turnosPorMedico: any[] = []; // Datos de turnos por médico
  chartMedicos: any; // Instancia del gráfico
  turnosPorMedicoFinalizados: any[] = []; // Datos de turnos por médico
  chartMedicosFinalizados: any; // Instancia del gráfico
  fechaInicioFinalizados: string | null = null; // Fecha inicial seleccionada
  fechaFinFinalizados: string | null = null; 
  constructor(private firestore: Firestore) {

    Chart.register(...registerables); // elementos de Chart.js
  }

  async ngOnInit() {
    await this.cargarLogs();
    this.loading = false;

    await this.obtenerDatosTurnos();
    this.generarDatosGrafico();
    if (this.chartData) {
      this.createChart();  //  genera el gráfico
    } else {
      console.log("no se pudo crear");
    }
    // Escuchar cambios en la colección de turnos en tiempo real
    this.escucharCambiosEnTurnos();
    const fechaActual = new Date().toISOString().split('T')[0];  // Fecha actual en formato 'YYYY-MM-DD'
    this.fechaSeleccionada = fechaActual;  // Valor por defecto con formato 'YYYY-MM-DD'
    
    this.fechaInicio=fechaActual;
    this.fechaFin=fechaActual;
    
    this.cargarDatosTurnosDias();
  }

  ngAfterViewInit(): void {
    this.createChartDias();

  }

  filtrarDatosEspecialista(){
      if (this.fechaInicio && this.fechaFin) {
        this.cargarDatosTurnosMedicos(this.fechaInicio, this.fechaFin);
      }
    }
    
    filtrarDatosEspecialistaFinalizado(){
      if (this.fechaInicioFinalizados && this.fechaFinFinalizados) {
        this.cargarDatosTurnosMedicosFinalizados(this.fechaInicioFinalizados, this.fechaFinFinalizados);
      }
    }
    
  filtrarDatos() {

    if (this.fechaSeleccionada) {
      console.log("fecha",this.fechaSeleccionada);
      this.cargarDatosTurnosDias(this.fechaSeleccionada);
      console.log(this.turnosPorMedicoFinalizados);
      
    }


  }

  async cargarDatosTurnosMedicosFinalizados(fechaInicioFinalizados?: string, fechaFinFinalizados?: string) {
    try {
      const turnosCollection = collection(this.firestore, 'turnos');
      let turnosQuery;
  
      if (fechaInicioFinalizados && fechaFinFinalizados) {
        turnosQuery = query(
          turnosCollection,
          where('fechaSolicitud', '>=', fechaInicioFinalizados),
          where('fechaSolicitud', '<=', fechaFinFinalizados),
          where('estado','==','Finalizado')
        );
      } else {
        turnosQuery = query(turnosCollection);
      }
  
      
      // Configurar el listener en tiempo real
      onSnapshot(turnosQuery, (querySnapshot) => {
        const turnos = querySnapshot.docs.map(doc => doc.data() as any);
  
        // Actualizar los datos del gráfico
        this.turnosPorMedicoFinalizados = turnos;
        console.log("si cambio!", this.turnosPorMedicoFinalizados);
        
        this.generarDatosGraficoMedicosFinalizados();
      });
    } catch (error) {
      console.error('Error al cargar los turnos:', error);
    }
  }
  
  generarDatosGraficoMedicosFinalizados() {
    const turnosPorMedico = this.turnosPorMedicoFinalizados.reduce((acc: any, turno: any) => {
      const medico = turno.especialista; // Asume que cada turno tiene un campo 'medico'
      if (!acc[medico]) acc[medico] = 0;
      acc[medico]++;
      return acc;
    }, {});
  
    const labels = Object.keys(turnosPorMedico);
    const data = Object.values(turnosPorMedico);
  
    const chartData = {
      labels: labels,
      datasets: [{
        label: 'Turnos Finalizados.',
        data: data,
        backgroundColor: labels.map((_, index) =>
          index % 2 === 0 ? 'rgba(138, 43, 226, 0.2)' : 'rgba(54, 162, 235, 0.2)'
        ),
        borderColor: labels.map((_, index) =>
          index % 2 === 0 ? 'rgba(138, 43, 226, 1)' : 'rgba(54, 162, 235, 1)'
        ),
        borderWidth: 1
      }]
    };
  
    if (this.chartMedicosFinalizados) {
      this.chartMedicosFinalizados.destroy();
    }
  
    const canvas = document.getElementById('turnosPorMedicoFinalizadosChart') as HTMLCanvasElement;
    if (canvas) {
      this.chartMedicosFinalizados = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            tooltip: {
              enabled: true
            }
          }
        }
      });
    }
  }




  async cargarDatosTurnosMedicos(fechaInicio?: string, fechaFin?: string) {
  try {
    const turnosCollection = collection(this.firestore, 'turnos');
    let turnosQuery;

    if (fechaInicio && fechaFin) {
      turnosQuery = query(
        turnosCollection,
        where('fechaSolicitud', '>=', fechaInicio),
        where('fechaSolicitud', '<=', fechaFin)
      );
    } else {
      turnosQuery = query(turnosCollection);
    }

    // Configurar el listener en tiempo real
    onSnapshot(turnosQuery, (querySnapshot) => {
      const turnos = querySnapshot.docs.map(doc => doc.data() as any);

      // Actualizar los datos del gráfico
      this.turnosPorMedico = turnos;
      this.generarDatosGraficoMedicos();
    });
  } catch (error) {
    console.error('Error al cargar los turnos:', error);
  }
}

generarDatosGraficoMedicos() {
  const turnosPorMedico = this.turnosPorMedico.reduce((acc: any, turno: any) => {
    const medico = turno.especialista; // Asume que cada turno tiene un campo 'medico'
    if (!acc[medico]) acc[medico] = 0;
    acc[medico]++;
    return acc;
  }, {});

  const labels = Object.keys(turnosPorMedico);
  const data = Object.values(turnosPorMedico);

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Turnos por Médico',
      data: data,
      backgroundColor: labels.map((_, index) =>
        index % 2 === 0 ? 'rgba(138, 43, 226, 0.2)' : 'rgba(54, 162, 235, 0.2)'
      ),
      borderColor: labels.map((_, index) =>
        index % 2 === 0 ? 'rgba(138, 43, 226, 1)' : 'rgba(54, 162, 235, 1)'
      ),
      borderWidth: 1
    }]
  };

  if (this.chartMedicos) {
    this.chartMedicos.destroy();
  }

  const canvas = document.getElementById('turnosPorMedicoChart') as HTMLCanvasElement;
  if (canvas) {
    this.chartMedicos = new Chart(canvas, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });
  }
}


  // Cargar los datos de turnos de la base de datos
  async cargarDatosTurnosDias(fecha?: string) {

    try {
      let turnosCollection = collection(this.firestore, 'turnos');
      let turnosQuery;

      if (fecha) {
        console.log("fechita",fecha);
        
        turnosQuery = query(turnosCollection, where('fechaSolicitud', '==', fecha));  // Filtrar por fecha y hora
      } else {
        turnosQuery = query(turnosCollection);  // Sin filtro de fecha
      }

      const querySnapshot = await getDocs(turnosQuery);
      const turnos = querySnapshot.docs.map(doc => doc.data() as any);

      this.turnosPorDia = turnos;
      this.generarDatosGraficoDias();
    } catch (error) {
      console.error('Error al cargar los turnos:', error);
    }
  }

  // Generar los datos para el gráfico
  generarDatosGraficoDias() {
    // Contar la cantidad de turnos por cada día
    const turnosPorFecha = this.turnosPorDia.reduce((acc: any, turno: any) => {
      const fecha = turno.dia.split('T')[0]; // Asume que cada turno tiene un campo 'fecha' con formato ISO
      if (!acc[fecha]) acc[fecha] = 0;
      acc[fecha]++;
      return acc;
    }, {});

    const labels = Object.keys(turnosPorFecha);
    const data = Object.values(turnosPorFecha);

    // Crear el objeto de datos para Chart.js
    const chartData = {
      labels: labels,
      datasets: [{
        label: 'Turnos por Día',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    // Si ya existe un gráfico, lo destruimos antes de crear uno nuevo
    if (this.chartDias) {
      this.chartDias.destroy();
    }

    // Crear el gráfico
    const canvas = document.getElementById('turnosPorDiaChart') as HTMLCanvasElement;
    if (canvas) {
      this.chartDias = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            tooltip: {
              enabled: true
            }
          }
        }
        });
      }
    }

     // Crear gráfico
  createChartDias() {
    if (this.turnosPorDia.length > 0) {
      this.generarDatosGraficoDias();
    }
  }




  async obtenerDatosTurnos() {
    try {
      const turnosCollection = collection(this.firestore, 'turnos'); // Colección de turnos
      const querySnapshot = await getDocs(turnosCollection);
      querySnapshot.docs.forEach(doc => {
        const turno = doc.data() as { especialidad: string };
        if (turno.especialidad) {
          if (!this.cantidadTurnosPorEspecialidad[turno.especialidad]) {
            this.cantidadTurnosPorEspecialidad[turno.especialidad] = 0;
          }
          this.cantidadTurnosPorEspecialidad[turno.especialidad]++;
        }
      });
    } catch (error) {
      console.error('Error al obtener datos de turnos:', error);
    }
  }


  escucharCambiosEnTurnos() {
    const turnosCollection = collection(this.firestore, 'turnos');
    onSnapshot(turnosCollection, (querySnapshot) => {
      this.cantidadTurnosPorEspecialidad = {}; // Reseteamos los datos

      querySnapshot.forEach(doc => {
        const turno = doc.data() as { especialidad: string };
        if (turno.especialidad) {
          if (!this.cantidadTurnosPorEspecialidad[turno.especialidad]) {
            this.cantidadTurnosPorEspecialidad[turno.especialidad] = 0;
          }
          this.cantidadTurnosPorEspecialidad[turno.especialidad]++;
        }
      });
      console.log("estoy pasando por aca");
      console.log("estoy pasando por aca",this.cantidadTurnosPorEspecialidad);

      this.generarDatosGrafico(); // Actualizamos los datos del gráfico
      if (this.chart) {
      this.chart.destroy();
      this.createChart();  // Llamamos a la función que genera el gráfico
      // Actualizamos el gráfico sin destruirlo
      }
    });
  }



  generarDatosGrafico() {
    const labels = Object.keys(this.cantidadTurnosPorEspecialidad);
    const data = Object.values(this.cantidadTurnosPorEspecialidad);
    console.log("vuelta", labels);
    console.log("vuelta", data);

    
    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Turnos por Especialidad',
          data: data,
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  async cargarLogs() {
    try {
      const logsCollection = collection(this.firestore, 'logs');
      const querySnapshot = await getDocs(logsCollection);
      this.logs = querySnapshot.docs.map(doc => doc.data() as Log);
    } catch (error) {
      console.error('Error al cargar los logs:', error);
    }
  }

  createChart() {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (canvas) {
      this.chart = new Chart(canvas, {
        type: 'pie', // Tipo de gráfico
        data: this.chartData, // Datos para el gráfico
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              enabled: true,
            },
          },
        },
      });
    }
  }

  exportarExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.logs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
    XLSX.writeFile(workbook, 'logs.xlsx');
  }

 // Función para generar el PDF
  generarPDF() {
      const content = document.getElementById('contenidoPDF1'); // Asegúrate de usar el id del contenedor de tu página
      const content1 = document.getElementById('contenidoPDF2'); 
      const content2 = document.getElementById('contenidoPDF3');
      console.log(content,content1,content2);
      
      if (content && content1 && content2  ) {
        const pdf = new jsPDF();
    
        pdf.setFont('helvetica', 'normal');
    
        // Logo de la clínica y nombre
        const imageUrl = "https://res.cloudinary.com/duzk2vrqy/image/upload/v1733190640/pngwing.com_unfodu.png";
        pdf.addImage(imageUrl, 'PNG', 10, 5, 30, 30);  // Ajusta el logo en la parte superior izquierda (sin estirarlo)
    
        // Barra de encabezado
        pdf.setFillColor(0, 51, 102);  // Azul oscuro
        pdf.rect(0, 40, pdf.internal.pageSize.width, 20, 'F');  // Barra de encabezado
    
        // Nombre de la clínica al lado del logo (centrado)
        pdf.setFontSize(20);
        pdf.setTextColor(0, 51, 102);  // Blanco
        pdf.text('Clínica Trafalgar', pdf.internal.pageSize.width / 2, 20, { align: 'center' });
        pdf.setFontSize(20);
        pdf.setTextColor(0, 51, 102);  // Blanco
        pdf.text('Informes de la clinica:', pdf.internal.pageSize.width / 2, 36, { align: 'center' });
    
        // Fecha de emisión (alineado a la izquierda)
        const fechaEmision = new Date().toLocaleDateString();  // Formato de fecha "dd/mm/yyyy"
        pdf.setFontSize(12);
        pdf.setTextColor(255,255,255);  // Blanco
        pdf.text(`Fecha de emisión: ${fechaEmision}`, 10, 50);
        
// Altura de la imagen (en mm)
     function addContentToPDF(content: HTMLElement, pageNum: number) {
  return new Promise<void>((resolve) => {
    html2canvas(content).then(canvas => {
      const imgData = canvas.toDataURL('image/png'); // Convertir canvas a imagen PNG

      if (pageNum > 1) {
        pdf.addPage();  // Añadir nueva página después de la primera
      }

      // Establecer el tamaño deseado para la imagen
      const imgWidth = 240;  // Ancho de la imagen
      const imgHeight = 120; // Alto de la imagen

      // Obtener las dimensiones de la página
      const pageWidth = pdf.internal.pageSize.width;  // Ancho de la página
      const pageHeight = pdf.internal.pageSize.height; // Alto de la página

      // Calcular las coordenadas para centrar la imagen en la página
      const xPos = (pageWidth - imgWidth) / 2; // Centrar horizontalmente
      const yPos = (pageHeight - imgHeight) / 2; // Centrar verticalmente

      // Agregar la imagen al PDF, centrada
      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);  // Ajustar el tamaño y la posición

      resolve();
    });
  });
}

addContentToPDF(content, 1)
  .then(() => addContentToPDF(content1, 2))
  .then(() => addContentToPDF(content2, 3))
  .then(() => {
    // Guardar el PDF después de agregar todo el contenido
    pdf.save('informe.pdf');
  });
}
  }
  }


