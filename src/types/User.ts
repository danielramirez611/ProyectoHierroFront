export interface User {
  id: number;
  firstName: string;
  lastNameP: string;
  lastNameM: string;
  documentNumber: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: 'Administrador' | 'Gestor' | 'Familiar' | 'Niño';
  birthDate: string;
  gender: string;
  address: string;
  firebaseToken?: string; // <-- nuevo campo opcional para token Firebase

}

export type UserFormData = Omit<User, 'id'> & {
  id?: number; // ✅ opcional
};
