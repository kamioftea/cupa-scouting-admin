import type {UserRepository} from "~/model/user.repository";
import {createContext} from "react-router";

export type DatabaseContext = {
    userRepository: UserRepository
}

export const databaseContext = createContext<DatabaseContext>();
