import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, docData, addDoc, setDoc, updateDoc, deleteDoc, getFirestore, getDocs, query, where } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TurnosService {
  constructor(
    private firestore: Firestore,
  ) {}
  private collectionName = 'turnos';
  private usuariosCollection = 'usuarios';
  private especialistasCollection = 'especialistas';

  // Obtener los turnos
  getTurnos(): Observable<any[]> {
    const turnosCollection = collection(this.firestore, this.collectionName);
    return collectionData(turnosCollection, { idField: 'id' }) as Observable<any[]>;
  }

  // Obtener los turnos del paciente (filtrados por el nombre del paciente)
  async obtenerTurnosPaciente(paciente: string): Promise<any[]> {
    try {
      const turnosRef = collection(this.firestore, this.collectionName);
      const q = query(turnosRef, where('paciente', '==', paciente));
      const querySnapshot = await getDocs(q);
      let turnos: any[] = [];
      querySnapshot.forEach((doc) => {
        turnos.push({ ...doc.data(), id: doc.id });
      });
      return turnos;
    } catch (error) {
      console.error('Error al obtener turnos del paciente: ', error);
      return [];
    }
  }
  async obtenerTurnosPacienteByEspecialista(paciente: string, especialistaId: string): Promise<any[]> {
    try {
      const turnosRef = collection(this.firestore, this.collectionName);
      const q = query(turnosRef, 
        where('paciente', '==', paciente),
        where('especialista', '==', especialistaId)
      );
      const querySnapshot = await getDocs(q);
      let turnos: any[] = [];
      querySnapshot.forEach((doc) => {
        turnos.push({ ...doc.data(), id: doc.id });
      });
      return turnos;
    } catch (error) {
      console.error('Error al obtener turnos del paciente: ', error);
      return [];
    }
  }
  // Crear un turno
  async crearTurno(turno: any): Promise<void> {
    const turnosCollection = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(turnosCollection, turno);
    console.log('Turno creado con ID:', docRef.id);
  }

  // Actualizar un turno
  async actualizarTurno(id: string, data: any): Promise<void> {
    const turnoDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(turnoDocRef, data);
  }

  // Cancelar un turno (solo si el estado no es 'Realizado')
  async cancelarTurno(id: string, comentario: string): Promise<void> {
    const turnoDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const turnoSnapshot = await getDoc(turnoDocRef);
    
    if (turnoSnapshot.exists()) {
      const turnoData = turnoSnapshot.data();
      if (turnoData['estado'] !== 'Realizado') {
        await updateDoc(turnoDocRef, {
          estado: 'Cancelado',
          comentarioCancelacion: comentario,
        });
        console.log('Turno cancelado');
      } else {
        console.error('El turno ya ha sido realizado y no puede cancelarse');
      }
    } else {
      console.error('Turno no encontrado');
    }
  }

  // Aceptar un turno
  async aceptarTurno(id: string): Promise<void> {
    const turnoDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const turnoSnapshot = await getDoc(turnoDocRef);

    if (turnoSnapshot.exists()) {
      const turnoData = turnoSnapshot.data();
      if (turnoData['estado'] === 'pendiente') {
        await updateDoc(turnoDocRef, {
          estado: 'Aceptado',
        });
        console.log('Turno aceptado');
      } else {
        console.error('El turno no está en estado pendiente');
      }
    } else {
      console.error('Turno no encontrado');
    }
  }

  // Finalizar un turno
  async finalizarTurno(id: string, comentario: string): Promise<void> {
    const turnoDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const turnoSnapshot = await getDoc(turnoDocRef);

    if (turnoSnapshot.exists()) {
      const turnoData = turnoSnapshot.data();
      if (turnoData['estado'] === 'Aceptado') {
        await updateDoc(turnoDocRef, {
          estado: 'Finalizado',
          ComentarioFinalizado: comentario,
        });
        console.log('Turno Finalizado');
      } else {
        console.error('El turno no está en estado Aceptado');
      }
    } else {
      console.error('Turno no encontrado');
    }
  }
  
  async cargarHistoriaClinica(turnoId: string, historia: any): Promise<void> {
    const turnoDocRef = doc(this.firestore, `${this.collectionName}/${turnoId}`);
    const turnoSnapshot = await getDoc(turnoDocRef);

    if (turnoSnapshot.exists()) {
      const turnoData = turnoSnapshot.data();
      if (turnoData['estado'] === 'Finalizado') {
        await updateDoc(turnoDocRef, {
          HistoriaClinica: historia,
        });
        console.log('Turno Finalizado');
      } else {
        console.error('El turno no está en estado Aceptado');
      }
    } else {
      console.error('Turno no encontrado');
    }
  }
  
  // Rechazar un turno
  async rechazarTurno(id: string, comentario: string): Promise<void> {
    const turnoDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const turnoSnapshot = await getDoc(turnoDocRef);

    if (turnoSnapshot.exists()) {
      const turnoData = turnoSnapshot.data();
      if (turnoData['estado'] === 'Pendiente') {
        await updateDoc(turnoDocRef, {
          estado: 'Rechazado',
          comentarioRechazo: comentario,
        });
        console.log('Turno rechazado');
      } else {
        console.error('El turno no está en estado pendiente');
      }
    } else {
      console.error('Turno no encontrado');
    }
  }

  // Completar encuesta
  async completarEncuesta(id: string, encuesta: string): Promise<void> {
    const turnoDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const turnoSnapshot = await getDoc(turnoDocRef);

    if (turnoSnapshot.exists()) {
      await updateDoc(turnoDocRef, {
        encuesta: encuesta,
      });
      console.log('Encuesta completada');
    } else {
      console.error('Turno no encontrado');
    }
  }

  // Calificar atención
  async calificarAtencion(id: string, comentario: string): Promise<void> {
    const turnoDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const turnoSnapshot = await getDoc(turnoDocRef);

    if (turnoSnapshot.exists()) {
      await updateDoc(turnoDocRef, {
        calificacionAtencion: comentario,
      });
      console.log('Calificación de atención enviada');
    } else {
      console.error('Turno no encontrado');
    }
  }

  // Obtener especialistas
  async obtenerEspecialistas(): Promise<any[]> {
    try {
      const especialistasRef = collection(this.firestore, this.especialistasCollection);
      const querySnapshot = await getDocs(especialistasRef);
      let especialistas: any[] = [];
      querySnapshot.forEach((doc) => {
        especialistas.push(doc.data());
      });
      return especialistas;
    } catch (error) {
      console.error('Error al obtener especialistas: ', error);
      return [];
    }
  }

  // Obtener la disponibilidad de un especialista
  async getDisponibilidad(especialistaId: string): Promise<any[]> {
    const especialistaDocRef = doc(this.firestore, `${this.usuariosCollection}/${especialistaId}`);
    const snapshot = await getDoc(especialistaDocRef);

    if (snapshot.exists()) {
      const especialista = snapshot.data();
      return especialista?.['disponibilidad'] || [];
    } else {
      console.error('Especialista no encontrado');
      return [];
    }
  }
}
