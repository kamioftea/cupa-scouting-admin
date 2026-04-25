import {type AnySQLiteColumn, check, CheckBuilder} from "drizzle-orm/sqlite-core";
import {sql} from "drizzle-orm";

export function enumCheck(
    column: AnySQLiteColumn,
    name: string,
    values: [string, ...string[]],
    nullable: boolean = false,
): CheckBuilder {
    const sqlValues = sql.raw(
        values.map((value) => `'${value}'`)
              .join(", ")
    );

    return check(
        name,
        nullable
        ? sql`(${column} is null or ${column} in (${sqlValues}))`
        : sql`${column} in (${sqlValues})`,
    );
}
