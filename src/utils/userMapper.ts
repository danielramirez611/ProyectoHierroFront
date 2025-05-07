// src/utils/userMapper.ts
import { User, UserFormData } from '../types/User';

export function toUserFormData(user: User | null): UserFormData | undefined {
  if (!user) return undefined;

  const {
    id,
    firstName,
    lastNameP,
    lastNameM,
    documentNumber,
    phone,
    email,
    passwordHash,
    role,
    birthDate,
    gender,
    address
  } = user;

  return {
    id,
    firstName,
    lastNameP,
    lastNameM,
    documentNumber,
    phone,
    email,
    passwordHash,
    role,
    birthDate,
    gender,
    address
  };
}
