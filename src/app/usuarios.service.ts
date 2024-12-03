import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, doc, updateDoc, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private resultadosCollection: any;

  constructor(private firestore: Firestore) {
    this.resultadosCollection = collection(this.firestore, 'usuarios');
  }

  // Obtener todos los usuarios
  getResultados(): Observable<any[]> {
    return collectionData(this.resultadosCollection, { idField: 'id' });
  }

  // Actualizar el estado de un usuario
  actualizarEstadoUsuario(id: string, estado: string): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `usuarios/${id}`);
    return updateDoc(usuarioDocRef, { estado });
  }
}