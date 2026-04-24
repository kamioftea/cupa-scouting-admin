import type { Option, Result } from "@bodil/opt";
import type { RoleValue, UserWithRoles } from "~/model/user.types";

export type UserIdentity = {
  id: number;
  email: string;
  name: string;
};

export type RegisterRequest = Pick<UserIdentity, "email" | "name"> & Partial<Pick<UserWithRoles, "roles">>;

export type UserCredentials = {
  email: string;
  password: string;
};

export type UserUpdateInput = Partial<Pick<UserWithRoles, "name" | "email" | "roles">>;

export type PasswordResetDTO = {
  name: string;
  email: string;
  token: string;
};

export type ResetPasswordTokenRecord = {
  id: number;
  email: string;
  token: string;
  expiresAt: string | Date;
};

export type ChangeEmailTokenRecord = {
  id: number;
  old_email: string;
  new_email: string;
  token: string;
  expiresAt: string | Date;
};

export type MessageError = {
  message: string;
};

export interface UserRepository {
  registerUser(request: RegisterRequest): Promise<ResetPasswordTokenRecord>;
  createPasswordResetForEmail(email: string): Promise<Option<PasswordResetDTO>>;
  verifyResetToken(token: string): Promise<Option<ResetPasswordTokenRecord>>;
  setPassword(password: string, token: string): Promise<Result<number, MessageError>>;
  findById(id: number): Promise<UserWithRoles | null>;
  loginUser(credentials: UserCredentials): Promise<Option<UserWithRoles>>;
  updateUser(userId: number, updates: UserUpdateInput): Promise<void>;
  setRoles(userId: number, roles: RoleValue[]): Promise<void>;
  getEmailChangeToken(oldEmail: string, newEmail: string): Promise<ChangeEmailTokenRecord>;
  verifyEmailChangeTokenForUser(token: string, user: UserIdentity): Promise<Option<ChangeEmailTokenRecord>>;
  updateUserEmailFromToken(token: string, user: UserIdentity): Promise<Result<undefined, MessageError>>;
  updatePassword(user: UserIdentity, currentPassword: string, newPassword: string): Promise<Result<undefined, Error>>;
  findAll(): Promise<UserWithRoles[]>;
}

