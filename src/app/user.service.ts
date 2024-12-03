import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, getDocs, query, where ,getDoc,setDoc} from '@angular/fire/firestore';
import {  createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { map } from 'rxjs';
import { Auth, getAuth, onAuthStateChanged, User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private storage: Storage,
  ) {}
  

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user);
      });
    });
  }
  
async  obtenerLogs() {
  const logsCollection = collection(this.firestore, 'logs');
  const querySnapshot = await getDocs(logsCollection);
  const logs=querySnapshot.docs.map(doc => doc.data());
  return logs
  
}
  // Obtener rol del usuario basado en su email
 async guardarLogs(){
  const fechaActual = new Date();
const fechaFormateada = fechaActual.toLocaleString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const logRef = collection(this.firestore, 'logs');
await addDoc(logRef, {
  usuario: this.auth.currentUser?.email,
  fecha: fechaFormateada,
  });
 }
  // Obtener todas las especialidades
  async getEspecialidades(): Promise<any[]> {
    const especialidadesRef = collection(this.firestore, 'especialidades');
    const especialidadesSnap = await getDocs(especialidadesRef);
    const especialidades: any[] = [];
    
    especialidadesSnap.forEach(doc => {
      especialidades.push({ id: doc.id, ...doc.data() }); // Incluye el ID y los datos del documento
    });
  
    console.log("especialidades", especialidades);
  
    return especialidades;
  }
  
  

  // Obtener especialistas por especialidad
  async getEspecialistasByEspecialidad(especialidad: string) {
    const especialistasRef = collection(this.firestore, 'usuarios'); // Tu colección de especialistas
    console.log(especialidad);
    
    const q = query(
      especialistasRef,
      where('userType', '==', 'especialista'),
      where('especialidad', 'array-contains', especialidad) // Consulta usando array-contains
    );

    try {
      const querySnapshot = await getDocs(q);
      const especialistas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("esto devuelve",especialistas);

      return especialistas; // Devuelves los especialistas filtrados
      
    } catch (error) {
      console.error('Error al obtener especialistas: ', error);
      return [];
    }
  }

  async getEspecialistas(): Promise<any[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('userType', '==', 'especialista'));
    const especialistasSnap = await getDocs(q);
    const especialistas: any[] = [];
    
    especialistasSnap.forEach(doc => {
      const data = doc.data();
      // Asegúrate de que lo que necesitas es lo que estás obteniendo
      especialistas.push(data); // Puedes personalizar los datos si necesitas algo específico
    });
    
    return especialistas;
  }

 
  // Obtener lista de pacientes (para el administrador)
  async getPacientes(): Promise<any[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('rol', '==', 'paciente'));
    const pacientesSnap = await getDocs(q);
    const pacientes: any[] = [];
    pacientesSnap.forEach(doc => {
      const data = doc.data();
      pacientes.push({
        email: doc.id,
        nombre: data['nombre'],
      });
    });
    return pacientes;
  }

  // Guardar el turno en Firebase
  async guardarTurno(turno: any): Promise<void> {
    try {
      const turnosRef = collection(this.firestore, 'turnos');
      const turnoDoc = doc(turnosRef);
      await setDoc(turnoDoc, turno);
    } catch (error) {
      console.log(error);
      
    }

      
  }









































  // Guardar la disponibilidad en Firestore
  async guardarHorarios(email: string, disponibilidad: any[]): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'disponibilidad', email); // Accedemos a un documento específico con el email del usuario
      await setDoc(docRef, {
        disponibilidad: disponibilidad,
        fechaActualizacion: new Date()
      });
      console.log('Disponibilidad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar disponibilidad en Firestore: ', error);
    }
  }

  // Obtener la disponibilidad de un especialista (email)
  async obtenerDisponibilidad(email: string): Promise<any> {
    try {
      console.log(email);
      
      const docRef = doc(this.firestore, 'disponibilidad', email); // Obtenemos el documento que contiene la disponibilidad del usuario
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("horario devuelve esto",docSnap.data());
        
        return docSnap.data(); // Devuelve la data si el documento existe
      } else {
        console.log('No se encontró el documento de disponibilidad');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener la disponibilidad: ', error);
      return null;
    }
  }

  // Obtener todos los documentos de una colección (por ejemplo, para ver todos los especialistas)
  async obtenerEspecialistas(): Promise<any[]> {
    try {
      const especialistasRef = collection(this.firestore, 'especialistas');
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


  async createUser(userData: any, userType: string, profileImage: File): Promise<void> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        userData.email,
        userData.password
      );

      // Subir la imagen de perfil al Storage
      const profileImageRef = ref(
        this.storage,
        `profile_images/${userCredential.user.uid}/${profileImage.name}`
      );
      await uploadBytes(profileImageRef, profileImage);
      const profileImageUrl = await getDownloadURL(profileImageRef);

      // Crear el documento del usuario en Firestore
      const userRef = doc(this.firestore, 'usuarios', userCredential.user.uid);
      await updateDoc(userRef, {
        ...userData,
        userType,
        profileImageUrl,
      });

      console.log('Usuario creado con éxito:', userCredential.user);
    } catch (error) {
      console.error('Error al crear el usuario:', error);
    }
  }

  // Obtener todos los usuarios (solo administradores pueden hacerlo)
  async getUsers(): Promise<any[]> {
    const usersRef = collection(this.firestore, 'usuarios');
    const usersSnapshot = await getDocs(usersRef);
    const usersList: any[] = [];
    usersSnapshot.forEach((doc) => {
      usersList.push(doc.data());
    });
    return usersList;
  }

  // Habilitar o deshabilitar acceso
  async toggleUserAccess(userId: string, isEnabled: boolean): Promise<void> {
    const userRef = doc(this.firestore, 'usuarios', userId);
    await updateDoc(userRef, {
      isEnabled,
    });
  }


  async getUserData(email: string): Promise<any | null> {  // Usamos 'any' porque estamos retornando un objeto con datos diversos
    try {
      // Definir la referencia a la colección de usuarios
      const usersCollectionRef = collection(this.firestore, 'usuarios');
    
      // Crear una consulta para buscar por el campo email
      const q = query(usersCollectionRef, where("email", "==", email.toLowerCase()));
    
      // Obtener los resultados de la consulta
      const querySnapshot = await getDocs(q);
    
      // Si la consulta devuelve resultados
      if (!querySnapshot.empty) {
        // Si encuentra al menos un documento
        const userDoc = querySnapshot.docs[0]; // Tomar el primer documento (debería ser único)
        const userData = userDoc.data();
        console.log('Usuario encontrado:', userData); // Imprimir los datos del usuario
        return userData;  // Retorna los datos del usuario encontrados
      } else {
        console.log('Usuario no encontrado');
        return null;  // Si no encuentra el usuario, retornamos null
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      return null;  // En caso de error, retornamos null
    }
  }
  
  async getUserDisponibilidadByDocName(docName: string): Promise<any | null> {
    try {
      // Definir la referencia al documento usando el nombre del documento
      const userDocRef = doc(this.firestore, 'disponibilidad', docName);
  
      // Obtener el documento
      const userDocSnap = await getDoc(userDocRef);
  
      // Si el documento existe
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log('Usuario encontrado:', userData);  // Imprimir los datos del usuario
        return userData;  // Retorna los datos del usuario encontrados
      } else {
        console.log('Documento no encontrado');
        return null;  // Si el documento no existe, retornamos null
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      return null;  // En caso de error, retornamos null
    }
  }

   // Método que obtiene el tipo de usuario basado en el email
   async getUserType(email: string): Promise<string> {
    try {
      // Definir la referencia a la colección de usuarios
      const usersCollectionRef = collection(this.firestore, 'usuarios');
  
      // Crear una consulta para buscar por el campo email
      const q = query(usersCollectionRef, where("email", "==", email.toLowerCase()));
  
      // Obtener los resultados de la consulta
      const querySnapshot = await getDocs(q);
  
      // Si la consulta devuelve resultados
      if (!querySnapshot.empty) {
        // Si encuentra al menos un documento
        const userDoc = querySnapshot.docs[0]; // Tomar el primer documento (debería ser único)
        const userData = userDoc.data();
        console.log('Usuario encontrado:', userData); // Imprimir los datos del usuario
        return userData?.['userType'] || 'usuario'; // Retornar el tipo de usuario o 'usuario' por defecto
      } else {
        // Si no encuentra resultados
        console.log('Usuario no encontrado');
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error("Error al obtener el tipo de usuario: ", error);
      return 'usuario'; // Valor por defecto en caso de error
    }
  }


  getUserRole(): Observable<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      const userCollectionRef = collection(this.firestore, 'usuarios');
      const q = query(userCollectionRef, where('email', '==', user.email));
      console.log(user.email )
     return from(getDocs(q)).pipe(
        map(snapshot => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            return data['userType'] as string; // Cambia 'rol' al nombre exacto del campo de rol
          } else {
            return null; // Retorna null si no se encuentra el usuario
          }
        })
      );
    } else {
      return new Observable(subscriber => {
        subscriber.next(null);
        subscriber.complete();
      });
    }
  }
}