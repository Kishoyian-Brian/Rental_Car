export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  status: UserStatus;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
}

