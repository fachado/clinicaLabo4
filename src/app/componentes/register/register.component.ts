import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, MinLengthValidator, ReactiveFormsModule, Validators } from '@angular/forms';
import { getAuth, createUserWithEmailAndPassword,sendEmailVerification  } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import { AngularFireStorage, AngularFireStorageModule } from '@angular/fire/compat/storage';  // Importa AngularFireStorage
import { Firestore, addDoc, collection,getDoc,query,where,getDocs } from '@angular/fire/firestore';
import { Storage,ref,uploadBytes,getDownloadURL } from '@angular/fire/storage';

import Swal from 'sweetalert2';
import { UserService } from '../../user.service';
import { CaptchaDirective } from '../../captcha.directive';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,AngularFireStorageModule,CaptchaDirective],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',


})
export class RegisterComponent {

  userRole: string | null = null;
  selectedSpecialties: string[] = []; // Aquí almacenaremos las especialidades seleccionadas
  newSpecialtyInput: string = ''; // Input para nueva especialidad

  registerFormPaciente: FormGroup;
  registerFormEspecialista: FormGroup;
  registerFormDefault: FormGroup;

  specialties = ['Cardiología', 'Dermatología', 'Neurología']; // Lista de especialidades predeterminadas
  userType = '';
  profileImage: any;
  medicalImage: any;

  loading = true;
  selectedFile: File | null = null;
  userImageUrl: string | null = null;
  captchaValido: boolean = false;
  captchaDeshabilitado: boolean = false;
  loading2 = true;

  onCaptchaValid(valid: boolean) {
    this.captchaValido = valid;
  }
  toggleCaptcha() {
    this.captchaDeshabilitado = !this.captchaDeshabilitado;
  }
  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private storage: Storage,
    private userService: UserService
  ) {
    setTimeout(() => {
      this.loading = false;
    }, 1500);
    this.loadDefaultSpecialties();
    this.loadSpecialties();

    // Formulario para Paciente
    this.registerFormPaciente = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      socialInsurance: ['',Validators.required,]
    });


    // Formulario para Especialista
    this.registerFormEspecialista = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      specialties: [[], Validators.required],  // Inicializamos con un arreglo vacío
      newSpecialty: ['']
    });

    // Formulario para otro tipo de usuarios (Admin u otros)
    this.registerFormDefault = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Obtener el rol del usuario
    this.userService.getUserRole().subscribe(
      role => {
        this.userRole = role;
        console.log('Rol del usuario:', this.userRole);
      },
      error => {
        console.error('Error al obtener el rol del usuario:', error);
      }
    );
  }

  // Métodos para cambiar el tipo de usuario
  esPaciente() {
    this.userType = 'paciente';
  }

  esEspecialista() {
    this.userType = 'especialista';
  }

  esAdmin() {
    this.userType = 'admin';
  }

  // Verificar si el usuario es Admin
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  // Manejar la foto de perfil (para todos los usuarios)
  onFileSelectProfile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileImage = file;
    }
  }

  // Manejar la foto médica (solo para pacientes)
  onFileSelectMedical(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.medicalImage = file;
    }
  }
  async loadSpecialties() {
    const specialtiesRef = collection(this.firestore, 'especialidades');
    const snapshot = await getDocs(specialtiesRef);

    // Limpiar el array de especialidades antes de agregar nuevas
    this.specialties = [];
    
    snapshot.forEach(doc => {
      this.specialties.push(doc.data()['name']); // Guardar cada especialidad en el array
    });

    console.log('Especialidades cargadas desde Firestore:', this.specialties);
  }
  // Método para manejar las especialidades seleccionadas
onCheckboxChange(event: any) {
  const value = event.target.value;
  
  if (event.target.checked) {
    // Si está marcado, agregar a selectedSpecialties
    this.selectedSpecialties.push(value);
  } else {
    // Si está desmarcado, eliminar de selectedSpecialties
    const index = this.selectedSpecialties.indexOf(value);
    if (index !== -1) {
      this.selectedSpecialties.splice(index, 1);
    }
  }

  // Actualizar el valor en el formulario
  this.registerFormEspecialista!.get('specialties')?.setValue(this.selectedSpecialties);
}
async loadDefaultSpecialties() {
  const specialtiesRef = collection(this.firestore, 'especialidades');
  const snapshot = await getDocs(specialtiesRef);

  // Verificar si ya existen especialidades en la base de datos
  if (snapshot.empty) {
    // Si no hay especialidades, agregar las predeterminadas
    this.specialties.forEach(async (specialty) => {
      const docRef = doc(specialtiesRef, specialty);
      await setDoc(docRef, { name: specialty });
    });
    console.log('Especialidades predeterminadas guardadas en Firestore');
  } else {
    console.log('Las especialidades ya existen en Firestore');
  }
}
  // Agregar nueva especialidad
  addSpecialty() {
    const trimmedSpecialty = this.registerFormEspecialista.get('newSpecialty')?.value.trim();
  
    if (trimmedSpecialty && !this.specialties.includes(trimmedSpecialty)) {
      this.specialties.push(trimmedSpecialty); // Agregar a la lista de especialidades
      this.registerFormEspecialista.get('newSpecialty')?.setValue(''); // Limpiar el input
  
      // Guardar la especialidad en Firestore
      const specialtiesRef = collection(this.firestore, 'especialidades');
      setDoc(doc(specialtiesRef), { name: trimmedSpecialty, imagen:"https://firebasestorage.googleapis.com/v0/b/fbst-8c19a.appspot.com/o/png-transparent-hospital-logo-clinic-health-care-physician-business.png?alt=media&token=e5a1be8c-b655-491d-9de2-1766520f142e" });
  
      console.log(this.specialties);
    } else if (trimmedSpecialty) {
      alert('La especialidad ya existe en la lista.');
    } else {
      alert('Por favor ingresa un nombre válido.');
    }
  } 

  // Método de envío del formulario
  async onSubmit() {
    let formData;
    if (this.userType === 'paciente') {
      formData = this.registerFormPaciente.value;
    } else if (this.userType === 'especialista') {
      formData = this.registerFormEspecialista.value;
    } else {
      formData = this.registerFormDefault.value;
    }
 // Verificar el estado del CAPTCHA
      if (!this.captchaValido) {
        await Swal.fire('Error', 'Debe validar el CAPTCHA antes de continuar.', 'error');
        return;
      }
    if ((this.userType === 'paciente' || this.userType === 'especialista') && (this.profileImage || this.medicalImage)) {
      const imageUrls: string[] = [];

      try {
        // Subir la foto de perfil
        if (this.profileImage) {
          const profileRef = ref(this.storage, `${this.userType}/${formData.email}/${this.profileImage.name}`);
          await uploadBytes(profileRef, this.profileImage);
          const profileDownloadURL = await getDownloadURL(profileRef);
          imageUrls.push(profileDownloadURL);
        }

        // Subir la foto médica (solo para pacientes)
        if (this.userType === 'paciente' && this.medicalImage) {
          const medicalRef = ref(this.storage, `${this.userType}/${formData.email}/${this.medicalImage.name}`);
          await uploadBytes(medicalRef, this.medicalImage);
          const medicalDownloadURL = await getDownloadURL(medicalRef);
          imageUrls.push(medicalDownloadURL);
        }

        // Crear usuario en Firebase Authentication
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Enviar correo de verificación
        await sendEmailVerification(user);
        Swal.fire('Registro exitoso', 'Por favor verifica tu correo para activar tu cuenta.', 'success');

        // Guardar datos adicionales en Firestore
        const col = collection(this.firestore, 'usuarios');
        const userDoc = {
          nombre: formData.name,
          apellido: formData.surname,
          email: formData.email,
          edad: formData.age,
          dni: formData.dni,
          userType: this.userType,
          imagenes: imageUrls,
        };

        if (this.userType === 'especialista') {
          await addDoc(col, {
            ...userDoc,
            especialidad: this.selectedSpecialties,
            estado: 'inhabilitado',
          });
        } else if (this.userType === 'paciente') {
          await addDoc(col, {
            ...userDoc,
            obraSocial: formData.socialInsurance,
          });
        } else {
          await addDoc(col, userDoc);
        }

        console.log('Usuario registrado y datos guardados en Firestore:', formData);
      } catch (error) {
        console.error('Error en el registro:', error);
      }
    } else {
      console.error('Formulario inválido o no se han seleccionado archivos');
    }
  }
}
