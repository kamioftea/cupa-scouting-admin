import type {UserRepository} from "~/model/user.repository";
import {createContext} from "react-router";
import type {DrizzleLogisticsRepository} from "~/model/drizzle/logistics.server";
import type {DrizzleMetadataRepository} from "~/model/drizzle/metadata.server";
import type {DrizzleScoutingRepository} from "~/model/drizzle/scouting.server";

export type DatabaseContext = {
    userRepository: UserRepository
    logisticsRepository: DrizzleLogisticsRepository,
    metadataRepository: DrizzleMetadataRepository,
    scoutingRepository: DrizzleScoutingRepository,
}

export const databaseContext = createContext<DatabaseContext>();
