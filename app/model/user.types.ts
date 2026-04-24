export enum RoleValue {
    Organiser = "organiser",
    Writer = "writer",
    Crew = "crew",
    Player = "player",
}

export type User = {
    id: number;
    email: string;
    name: string;
};

export type UserWithRoles = User & { roles: RoleValue[] };
