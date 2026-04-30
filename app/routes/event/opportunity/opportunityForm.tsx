import Input from "~/components/form/Input";
import {optionsFromEnum, Select} from "~/components/form/Select";
import TextArea from "~/components/form/TextArea";
import {MultiInput} from "~/components/form/MultiInput";
import type {$ZodIssue} from "zod/v4/core";
import type {OpportunityRow} from "~/model/drizzle/schema/scouting";

export type OpportunityFormElementsProps = {
    values?: Partial<OpportunityRow>
    errors?: $ZodIssue[];
    opportunityTypes: string[],
    difficultyLevels: string[],
    threatLevels: string[],
}

export function OpportunityFormElements({
                                            values,
                                            errors,
                                            opportunityTypes,
                                            difficultyLevels,
                                            threatLevels
                                        }: OpportunityFormElementsProps) {
    return <>
        <Input name={"name"} label="Name" defaultValue={values?.name} defaultFocus errors={errors}/>

        <div className="rating-row">
            <Select
                name={"opportunityType"}
                label="Type"
                options={optionsFromEnum(opportunityTypes)}
                defaultSelected={values?.opportunityType}
                errors={errors}
            />
            <Select
                name={"difficultyLevel"}
                label="Difficulty"
                options={optionsFromEnum(difficultyLevels)}
                defaultSelected={values?.difficultyLevel}
                errors={errors}
            />
            <Select
                name={"threatLevel"}
                label="Threat"
                options={optionsFromEnum(threatLevels)}
                defaultSelected={values?.threatLevel}
                errors={errors}
            />
        </div>

        <TextArea
            name={"playerDescription"}
            label="Player Description"
            defaultValue={values?.playerDescription ?? undefined}
            errors={errors}
            rows={4}
        />

        <MultiInput
            name="usefulSkills"
            defaultValues={values?.usefulSkills}
            label="Useful Skills"
            errors={errors}
        />

        <MultiInput
            name="requirements"
            defaultValues={values?.requirements}
            label="Requirements/conditions"
            errors={errors}
        />

        <TextArea
            name="monsterBriefing"
            label="Monster Briefing"
            defaultValue={values?.monsterBriefing ?? undefined}
            errors={errors}
            rows={8}
        />

        <MultiInput
            name="items"
            defaultValues={values?.items ?? undefined}
            label="Items/props"
            errors={errors}
        />

        <TextArea
            name="expectedResult"
            label="Expected Results"
            defaultValue={values?.expectedResult ?? undefined}
            errors={errors}
            rows={4}
        />
    </>;
}
