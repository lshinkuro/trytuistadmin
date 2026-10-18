export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthRepository {
  login(credentials: Credentials): Promise<AdminUser>;
  logout(): Promise<void>;
  currentAdmin(): Promise<AdminUser>;
}
