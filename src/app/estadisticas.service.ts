import { Injectable } from '@angular/core';
import { Firestore, collection, onSnapshot, query, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { getDocs } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private cantidadVisitas$ = new BehaviorSubject<number>(0);
  private pacientesPorEspecialidad$ = new BehaviorSubject<{ [key: string]: number }>({});
  private medicosPorEspecialidad$ = new BehaviorSubject<{ [key: string]: number }>({});
  private turnosPaciente$ = new BehaviorSubject<any[]>([]);
  private encuestas$ = new BehaviorSubject<any[]>([]); // ✅ Inicializamos el BehaviorSubject

  constructor(private firestore: Firestore) {
    console.log("encuestas");
    
    this.listenEncuestas();

    this.listenCantidadVisitas();
    this.listenPacientesPorEspecialidad();
    this.listenMedicosPorEspecialidad();
  }

  /** 🚀 Escuchar cantidad total de visitas (turnos solicitados) */
  private listenCantidadVisitas() {
    const turnosRef = collection(this.firestore, 'turnos');
    onSnapshot(turnosRef, (snapshot) => {
      this.cantidadVisitas$.next(snapshot.size);
    });
  }
  getCantidadVisitas(): Observable<number> {
    return this.cantidadVisitas$.asObservable();
  }

  /** 🚀 Escuchar cantidad de pacientes por especialidad */
  private listenPacientesPorEspecialidad() {
    const turnosRef = collection(this.firestore, 'turnos');
    
    onSnapshot(turnosRef, (snapshot) => {
        const conteo: { [key: string]: Set<string> } = {}; // Usamos un Set para evitar duplicados por especialidad

        snapshot.forEach(doc => {
            const data = doc.data();
            const especialidad = data['especialidad'];
            const pacienteId = data['paciente']; // Suponiendo que el turno tiene un pacienteId
            
            if (especialidad && pacienteId) {
                if (!conteo[especialidad]) {
                    conteo[especialidad] = new Set();
                }
                conteo[especialidad].add(pacienteId); // Agregamos solo IDs únicos
            }
        });

        // Convertimos el Set a un objeto con cantidades
        const resultado: { [key: string]: number } = {};
        for (const especialidad in conteo) {
            resultado[especialidad] = conteo[especialidad].size; // Contamos los pacientes únicos por especialidad
        }

        this.pacientesPorEspecialidad$.next(resultado);
    });
}

getPacientesPorEspecialidad(): Observable<{ [key: string]: number }> {
    return this.pacientesPorEspecialidad$.asObservable();
}


  private listenMedicosPorEspecialidad() {
    const usuariosRef = query(collection(this.firestore, 'usuarios'), where('userType', '==', 'especialista'));
    onSnapshot(usuariosRef, (snapshot) => {
      const conteo: { [key: string]: number } = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data['especialidad']) {
          // Si un especialista tiene varias especialidades, las recorremos
          data['especialidad'].forEach((especialidad: string) => {
            conteo[especialidad] = (conteo[especialidad] || 0) + 1;
          });
        }
      });
      console.log("conteo",conteo);
      
      this.medicosPorEspecialidad$.next(conteo);
    });
  }

  getMedicosPorEspecialidad(): Observable<{ [key: string]: number }> {
    return this.medicosPorEspecialidad$.asObservable();
  }

  /** 🚀 Escuchar respuestas de encuestas */
  private listenEncuestas() {
    const turnosRef = collection(this.firestore, 'turnos'); // 📂 Buscamos en `turnos`
    console.log("escuchando encuestas");

    onSnapshot(turnosRef, (snapshot) => {
      const encuestas = snapshot.docs
        .map(doc => {
          const turno = doc.data();
          console.log("Turno recibido:", turno);

          // Verificamos que 'encuesta' sea un objeto y no un array
          const encuesta = turno['encuesta'];
          if (encuesta) {
            return {
              ...encuesta, 
              turnoId: doc.id // 📌 Agregamos el ID del turno para referencia
            };
          }
          return null; // Si no hay encuesta, retornamos null
        })
        .filter((e: any) => e !== null); // Eliminamos los turnos sin encuesta

      console.log("Encuestas procesadas:", encuestas);
      
      // Emitimos las encuestas al BehaviorSubject
      this.encuestas$.next(encuestas);
    }, (error) => {
      console.log('Error al escuchar encuestas:', error);
    });
  }
  getEncuestas(): Observable<any[]> {
    console.log("devolvi estas",this.encuestas$.asObservable());

    return this.encuestas$.asObservable();
  }

/** 🚀 Escucha en tiempo real los turnos de un paciente */
listenTurnosPorPaciente(pacienteId: string) {
  const turnosRef = query(collection(this.firestore, 'turnos'), where('paciente', '==', pacienteId));
  
  onSnapshot(turnosRef, (snapshot) => {
    const turnos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    this.turnosPaciente$.next(turnos);
  });
}

/** 📌 Obtener los turnos del paciente */
getTurnosPorPaciente(): Observable<any[]> {
  return this.turnosPaciente$.asObservable();
}

 /** 🚀 Obtiene la lista de pacientes */
  getPacientes(): Observable<any[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const pacientesQuery = query(usuariosRef, where('userType', '==', 'paciente'));

    return new Observable(observer => {
      getDocs(pacientesQuery).then(snapshot => {
        const pacientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        observer.next(pacientes);
        observer.complete();
      }).catch(error => observer.error(error));
    });
  }

}