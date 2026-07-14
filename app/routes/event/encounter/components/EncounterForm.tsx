import type {EncounterRow} from "~/model/drizzle/schema/metadata";
import type {$ZodIssue} from "zod/v4/core";
import Input from "~/components/form/Input";
import {MultiInput} from "~/components/form/MultiInput";
import TextArea from "~/components/form/TextArea";
import RadioGroup from "~/components/form/RadioGroup";
import {encounterValidator} from "~/model/drizzle/metadata.types";

export type EncounterFormElementsProps = {
  values?: Partial<EncounterRow>,
  errors?: $ZodIssue[];
}

export function EncounterFormElements({values, errors}: EncounterFormElementsProps) {
  return <>
    <div className={"split-two-thirds"}>
      <Input name={"name"} label="Name" defaultValue={values?.name} defaultFocus errors={errors}/>
      <Input name={"code"} label="Code" defaultValue={values?.code} errors={errors}/>
    </div>
    
    <RadioGroup
      name={"produceEncounterOpportunity"}
      legend="Provide Encounter Opportunity?"
      defaultSelected={values?.produceEncounterOpportunity ? "yes" : "no"}
      options={[
        {
          label: "Yes",
          value: "yes",
          reveal: <>
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
          </>
        },
        { label: "No", value: "no" }
      ]}
    />
  </>
}

export function validateEncounterData(formData: FormData) {
  const data = {
    ...Object.fromEntries(formData),
    usefulSkills:
      (formData.getAll("usefulSkills") ?? [])
        .filter(skill => typeof skill === 'string' && skill.trim() !== ""),
    requirements:
      (formData.getAll("requirements") ?? [])
        .filter(req => typeof req === 'string' && req.trim() !== ""),
  }
  
  return encounterValidator.safeParse(data);
}
