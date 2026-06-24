import type { ContactRelationshipCategory } from "@/types/humanbase";

export const contactRelationshipCategories: {
  value: ContactRelationshipCategory;
  label: string;
}[] = [
  { value: "family", label: "Familie" },
  { value: "friends", label: "Freunde" },
  { value: "work", label: "Arbeit" },
  { value: "education", label: "Ausbildung" },
  { value: "other", label: "Sonstiges" },
];

export const contactRelationshipTypeOptions: {
  value: string;
  label: string;
  inverse: string;
  category: ContactRelationshipCategory;
}[] = [
  { value: "brother", label: "Bruder", inverse: "brother", category: "family" },
  { value: "sister", label: "Schwester", inverse: "sister", category: "family" },
  { value: "sibling", label: "Geschwister", inverse: "sibling", category: "family" },
  { value: "parent", label: "Elternteil", inverse: "child", category: "family" },
  { value: "child", label: "Kind", inverse: "parent", category: "family" },
  { value: "partner", label: "Partner", inverse: "partner", category: "family" },
  { value: "friend", label: "Freund/in", inverse: "friend", category: "friends" },
  { value: "colleague", label: "Kollege/in", inverse: "colleague", category: "work" },
  { value: "manager", label: "Fuehrungskraft", inverse: "direct_report", category: "work" },
  { value: "direct_report", label: "Mitarbeiter/in", inverse: "manager", category: "work" },
  { value: "mentor", label: "Mentor/in", inverse: "mentee", category: "work" },
  { value: "mentee", label: "Mentee", inverse: "mentor", category: "work" },
  { value: "teacher", label: "Lehrer/in", inverse: "student", category: "education" },
  { value: "student", label: "Schueler/in", inverse: "teacher", category: "education" },
  { value: "neighbor", label: "Nachbar/in", inverse: "neighbor", category: "other" },
  { value: "other", label: "Andere Beziehung", inverse: "other", category: "other" },
];

export function getRelationshipTypeOption(value: string) {
  return contactRelationshipTypeOptions.find((option) => option.value === value);
}

export function getRelationshipTypeLabel(value: string) {
  return getRelationshipTypeOption(value)?.label ?? value;
}

export function getInverseRelationshipType(value: string) {
  return getRelationshipTypeOption(value)?.inverse;
}

export function isContactRelationshipCategory(
  value: string,
): value is ContactRelationshipCategory {
  return contactRelationshipCategories.some((category) => category.value === value);
}
