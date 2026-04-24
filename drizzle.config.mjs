import { defineConfig } from "drizzle-kit";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    dialect: "sqlite",
    schema: "./app/model/drizzle/schema.ts",
    out: "./migrations",
    strict: true,
    verbose: true,
});
