import type {UserRepository} from "~/model/user.repository";
import {createContext} from "react-router";
import type {DrizzleLogisticsRepository} from "~/model/drizzle/logistics.server";

export type DatabaseContext = {
    userRepository: UserRepository
    logisticsRepository: DrizzleLogisticsRepository,
}

export const databaseContext = createContext<DatabaseContext>();
