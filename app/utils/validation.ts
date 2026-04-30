import {z} from "zod";

export const  nullablePositiveIntFromInput = (label: string) =>
    z.preprocess(
        (value) => {
            if (value === "" || value == null) return null;
            if (typeof value === "string") return Number(value);
            return value;
        },
        z.number(`Enter the number of ${label}`)
         .int("Enter a whole number")
         .positive("Enter a positive number")
         .nullable()
    );
