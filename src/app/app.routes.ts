import { Routes } from '@angular/router';
import { RegisterComponent } from './componentes/register/register.component';
import { HomeComponent } from './componentes/home/home.component';
import { LoginComponent } from './componentes/login/login.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { TurnosComponent } from './componentes/turnos/turnos.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { SolicitarTurnoComponent } from './componentes/solicitar-turno/solicitar-turno.component';
import { MisTurnosComponent } from './componentes/mis-turnos/mis-turnos.component';
import { PacientesComponent } from './componentes/pacientes/pacientes.component';
import { InformesComponent } from './componentes/informes/informes.component';
import { GraficosComponent } from './graficos/graficos.component';
export const routes: Routes = [

    { path: '', component: HomeComponent },

    { path: 'registro', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'usuarios', component: UsuariosComponent },
    { path: 'turnos', component: TurnosComponent },
    { path: 'perfil', component: PerfilComponent },
    { path: 'solicitarTurno', component: SolicitarTurnoComponent },
    { path: 'misTurnos', component: MisTurnosComponent },
    { path: 'pacientes', component: PacientesComponent },
    { path: 'informes', component: InformesComponent },
    { path: 'estadisticas', component: GraficosComponent },











    



    
];
