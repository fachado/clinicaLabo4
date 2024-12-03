import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = getAuth(); // Obtén la instancia de Auth
  const router = inject(Router);
  const firestore = inject(Firestore);

  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Acceder al documento de usuario en Firestore
          const userDoc = doc(firestore, 'usuarios', user.uid);
          const userSnapshot = await getDoc(userDoc);
          const userData = userSnapshot.data();

          if (userData && userData['userType'] === 'admin') {
            resolve(true); // Permite el acceso si es admin
          } else {
            Swal.fire({
              title: 'Acceso denegado',
              text: 'Necesitas ser administrador para ver esta sección.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              router.navigate(['/']); // Redirige a la página principal u otra página
              resolve(false); // Bloquea el acceso
            });
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo verificar el acceso.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            router.navigate(['/']); // Redirige si hay un error al obtener el documento
            resolve(false);
          });
        }
      } else {
        Swal.fire({
          title: 'Acceso denegado',
          text: 'Necesitas estar logueado para ver esta sección.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          router.navigate(['/login']); // Redirige a la página de login
          resolve(false); // Bloquea el acceso
        });
      }
    });
  });
};
