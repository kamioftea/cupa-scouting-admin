import type {UserRepository} from "~/model/user.repository";
import {createContext} from "react-router";
import type {DrizzleLogisticsRepository} from "~/model/drizzle/logistics.server";
import type {DrizzleScoutingRepository} from "~/model/drizzle/scouting.server";

export type DatabaseContext = {
    userRepository: UserRepository
    logisticsRepository: DrizzleLogisticsRepository,
    scoutingRepository: DrizzleScoutingRepository,
}

export const databaseContext = createContext<DatabaseContext>();
