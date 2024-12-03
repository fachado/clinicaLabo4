import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { UserService } from '../../user.service';
@Component({
  selector: 'app-manejo-usuario',
  standalone: true,
  imports: [],
  templateUrl: './manejo-usuario.component.html',
  styleUrl: './manejo-usuario.component.scss'
})
export class ManejoUsuarioComponent {
  users: any[] = [];
  isLoading: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Cargar usuarios desde Firebase
  async loadUsers() {
    this.isLoading = true;
    try {
      this.users = await this.userService.getUsers();
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Habilitar o deshabilitar acceso
  async toggleUserAccess(userId: string, isEnabled: boolean) {
    try {
      await this.userService.toggleUserAccess(userId, isEnabled);
      Swal.fire({
        icon: 'success',
        title: `Usuario ${isEnabled ? 'habilitado' : 'deshabilitado'}`,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado del usuario',
      });
    }
  }
}
