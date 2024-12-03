import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grafico-turnos-dia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grafico-turnos-dia.component.html',
  styleUrls: ['./grafico-turnos-dia.component.scss']
})
export class GraficoTurnosDiaComponent implements OnInit, AfterViewInit {
  fechaSeleccionada: string | null = null;  // Fecha y hora seleccionada en formato ISO string
  turnosPorDia: any[] = [];  // Datos de turnos por día
  chartDias: any;  // Instancia del gráfico

  constructor(private firestore: Firestore) {
    Chart.register(...registerables);  // Registrar los elementos de Chart.js
  }

  ngOnInit(): void {
    // Si tienes un valor por defecto, puedes cargar los datos por una fecha específica
    const fechaActual = new Date().toISOString().split('T')[0];  // Fecha actual en formato 'YYYY-MM-DD'
    this.fechaSeleccionada = fechaActual;  // Valor por defecto con formato 'YYYY-MM-DD'
    this.cargarDatosTurnosDias();
  }

  ngAfterViewInit(): void {
    this.createChartDias();
  }

  // Filtra los turnos según la fecha y hora seleccionada
  filtrarDatos() {
    if (this.fechaSeleccionada) {
      console.log("fecha",this.fechaSeleccionada);
      this.cargarDatosTurnosDias(this.fechaSeleccionada);
    }
  }

  // Cargar los datos de turnos de la base de datos
  async cargarDatosTurnosDias(fecha?: string) {
    try {
      let turnosCollection = collection(this.firestore, 'turnos');
      let turnosQuery;

      if (fecha) {
        console.log("fechita",fecha);
        
        turnosQuery = query(turnosCollection, where('dia', '==', fecha));  // Filtrar por fecha y hora
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
  }
