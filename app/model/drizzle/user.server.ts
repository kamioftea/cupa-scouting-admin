import dayjs from "dayjs";
import type {RouterContextProvider} from "react-router";
import {and, asc, eq, gt, inArray} from "drizzle-orm";
import type {Database} from "~/context/drizzleContext";
import {drizzleContext} from "~/context/drizzleContext";
import {Err, None, Ok, Option, type Result} from "@bodil/opt";
import bcrypt from "bcryptjs";
import {
  type ChangeEmailTokenRow,
  changeEmailTokens,
  passwords,
  type ResetPasswordTokenRow,
  resetPasswordTokens,
  roles,
  rolesToUsers,
  type UserRow,
  users,
} from "~/model/drizzle/schema";
import {RoleValue, type UserWithRoles} from "../user.types";
import type {
  ChangeEmailTokenRecord,
  MessageError,
  PasswordResetDTO,
  RegisterRequest,
  UserCredentials,
  UserIdentity,
  UserRepository,
  UserUpdateInput,
} from "~/model/user.repository";

type UserWithOptionalRoleNameRow = {
  user: UserRow;
  roleName: string | null;
};

export class DrizzleUserRepository implements UserRepository {
  private readonly db: Database;

  constructor(context: Readonly<RouterContextProvider>) {
    this.db = context.get(drizzleContext);
  }

  async registerUser(request: RegisterRequest): Promise<ResetPasswordTokenRow> {
    const [{userId}] = await this.db
      .insert(users)
      .values({
        name: request.name,
        email: request.email,
      })
      .onConflictDoNothing({ target: users.email })
      .returning({userId: users.userId});

    if(request.roles) {
        await this.setRoles(userId, request.roles);
    }

    return this.createResetPasswordToken(request.email);
  }

  async createPasswordResetForEmail(email: string): Promise<Option<PasswordResetDTO>> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      return None;
    }

    const token = await this.createResetPasswordToken(email);
    return Option.from(token).map(({ token }) => ({
      name: user.name,
      email,
      token,
    }));
  }

  private async createResetPasswordToken(email: string): Promise<ResetPasswordTokenRow> {
    const token = crypto.randomUUID();
    const expiresAt = dayjs().add(1, "day").toISOString();

    await this.db.insert(resetPasswordTokens).values({ email, token, expiresAt });

    const created = await this.db
      .select()
      .from(resetPasswordTokens)
      .where(eq(resetPasswordTokens.token, token));

    return created[0]!;
  }

  async verifyResetToken(token: string): Promise<Option<ResetPasswordTokenRow>> {
    const result = await this.db
      .select()
      .from(resetPasswordTokens)
      .where(
        and(
          eq(resetPasswordTokens.token, token),
          gt(resetPasswordTokens.expiresAt, dayjs().toISOString()),
        ),
      );

    return Option.from(result[0]);
  }

  async setPassword(password: string, token: string): Promise<Result<number, MessageError>> {
    const option = await this.verifyResetToken(token);
    if (!option.isSome()) {
      return Err({ message: "Invalid or expired token" });
    }

    const { email } = option.value;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.findUserByEmail(email);
    if (!user) {
      return Err({ message: "No user registered with this email" });
    }

    await this.db
      .insert(passwords)
      .values({ userId: user.userId, hash: hashedPassword })
      .onConflictDoUpdate({
        target: passwords.userId,
        set: { hash: hashedPassword },
      });

    await this.db.delete(resetPasswordTokens).where(eq(resetPasswordTokens.email, email));

    const persistedUser = await this.findUserByEmail(email);
    return Option.from(persistedUser)
      .map(({ userId }) => userId)
      .okOr({ message: "User not found" });
  }

  async findById(userId: number): Promise<UserWithRoles | null> {
    const rows = await this.db
      .select({
        user: users,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(rolesToUsers, eq(rolesToUsers.userId, users.userId))
      .leftJoin(roles, eq(roles.roleId, rolesToUsers.roleId))
      .where(eq(users.userId, userId));

    return this.mapUsersWithRoles(rows)[0] ?? null;
  }

  async loginUser({ email, password }: UserCredentials): Promise<Option<UserWithRoles>> {
    const user = await this.findByEmailWithRoles(email);

    const passwordRow = await this.db
      .select({ hash: passwords.hash })
      .from(passwords)
      .where(eq(passwords.userId, user?.userId ?? -1));

    const passwordMatches = await bcrypt.compare(password, passwordRow[0]?.hash ?? "");
    if (!passwordMatches) {
      return None;
    }

    return Option.from(user ?? undefined);
  }

  async updateUser(userId: number, { roles: nextRoles, ...updates }: UserUpdateInput) {
    const data: Partial<RegisterRequest> = {};

    if (typeof updates.name === "string") {
      data.name = updates.name;
    }

    if (typeof updates.email === "string") {
      data.email = updates.email;
    }

    if (Object.keys(data).length > 0) {
      await this.db.update(users).set(data).where(eq(users.userId, userId));
    }

    if (nextRoles) {
      await this.setRoles(userId, nextRoles);
    }
  }

  async setRoles(userId: number, nextRoles: RoleValue[]) {
    if (nextRoles.length > 0) {
      await this.db
        .insert(roles)
        .values(nextRoles.map((name) => ({ name })))
        .onConflictDoNothing({ target: roles.name });
    }

    await this.db.delete(rolesToUsers).where(eq(rolesToUsers.userId, userId));

    if (nextRoles.length === 0) {
      return;
    }

    const allRoles = await this.db
      .select({ roleId: roles.roleId })
      .from(roles)
      .where(inArray(roles.name, nextRoles));

    if (allRoles.length === 0) {
      return;
    }

    await this.db
      .insert(rolesToUsers)
      .values(allRoles.map((role) => ({ roleId: role.roleId, userId })))
      .onConflictDoNothing();
  }

  async getEmailChangeToken(oldEmail: string, newEmail: string): Promise<ChangeEmailTokenRecord> {
    const token = crypto.randomUUID();
    const expiresAt = dayjs().add(1, "day").toISOString();

    await this.db.insert(changeEmailTokens).values({
      oldEmail,
      newEmail,
      token,
      expiresAt,
    });

    const created = await this.db
      .select()
      .from(changeEmailTokens)
      .where(eq(changeEmailTokens.token, token));

    return this.mapChangeEmailToken(created[0]!);
  }

  async verifyEmailChangeTokenForUser(
    token: string,
    user: UserIdentity,
  ): Promise<Option<ChangeEmailTokenRecord>> {
    const result = await this.db
      .select()
      .from(changeEmailTokens)
      .where(
        and(
          eq(changeEmailTokens.token, token),
          eq(changeEmailTokens.oldEmail, user.email),
          gt(changeEmailTokens.expiresAt, dayjs().toISOString()),
        ),
      );

    return Option.from(result[0]).map((row) => this.mapChangeEmailToken(row));
  }

  async updateUserEmailFromToken(token: string, user: UserIdentity): Promise<Result<undefined, MessageError>> {
    const option = await this.verifyEmailChangeTokenForUser(token, user);
    if (!option.isSome()) {
      return Err({ message: "Invalid or expired token" });
    }

    const { old_email, new_email } = option.value;

    await this.db.update(users).set({ email: new_email }).where(eq(users.userId, user.userId));

    await this.db.delete(changeEmailTokens).where(eq(changeEmailTokens.oldEmail, old_email));
    await this.db.delete(changeEmailTokens).where(eq(changeEmailTokens.newEmail, new_email));

    return Ok(undefined);
  }

  async updatePassword(
    user: UserIdentity,
    currentPassword: string,
    newPassword: string,
  ): Promise<Result<undefined, Error>> {
    const passwordRow = await this.db
      .select({ hash: passwords.hash })
      .from(passwords)
      .where(eq(passwords.userId, user.userId));

    const passwordMatches = await bcrypt.compare(currentPassword, passwordRow[0]?.hash ?? "");
    if (!passwordMatches) {
      return Err(new Error("Current password is incorrect"));
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    await this.db
      .update(passwords)
      .set({ hash: newHashedPassword })
      .where(eq(passwords.userId, user.userId));

    return Ok(undefined);
  }

  async findAll(): Promise<UserWithRoles[]> {
    const rows = await this.db
      .select({
        user: users,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(rolesToUsers, eq(rolesToUsers.userId, users.userId))
      .leftJoin(roles, eq(roles.roleId, rolesToUsers.roleId))
      .orderBy(asc(users.userId));

    return this.mapUsersWithRoles(rows);
  }

  private async findUserByEmail(email: string): Promise<UserRow | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  private async findByEmailWithRoles(email: string): Promise<UserWithRoles | undefined> {
    const rows = await this.db
      .select({
        user: users,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(rolesToUsers, eq(rolesToUsers.userId, users.userId))
      .leftJoin(roles, eq(roles.roleId, rolesToUsers.roleId))
      .where(eq(users.email, email));

    return this.mapUsersWithRoles(rows)[0];
  }

  private mapUsersWithRoles(rows: UserWithOptionalRoleNameRow[]): UserWithRoles[] {
    const groupedUsers = new Map<number, UserWithRoles>();

    for (const { user, roleName } of rows) {
      const existing = groupedUsers.get(user.userId);
      if (existing) {
        if (roleName) {
          existing.roles.push(roleName as RoleValue);
        }
        continue;
      }

      groupedUsers.set(user.userId, {
        ...user,
        roles: roleName ? [roleName as RoleValue] : [],
      });
    }

    return [...groupedUsers.values()];
  }

  private mapChangeEmailToken(row: ChangeEmailTokenRow): ChangeEmailTokenRecord {
    return {
      changeTokenId: row.changeTokenId,
      old_email: row.oldEmail,
      new_email: row.newEmail,
      token: row.token,
      expiresAt: row.expiresAt,
    };
  }
}

