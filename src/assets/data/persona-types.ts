export type PersonaType = "persona" | "vehiculo";

export interface PersonaTypeOption {
  value: PersonaType;
  content: string;
}

export const personaTypes: PersonaTypeOption[] = [
  { value: "persona", content: "Persona" },
  { value: "vehiculo", content: "Vehiculo" },
];
