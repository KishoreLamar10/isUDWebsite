export function compareNumericText(a: string, b: string) {
  const aParts = a.split('.').map((part) => Number(part));
  const bParts = b.split('.').map((part) => Number(part));
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i++) {
    const aValue = Number.isFinite(aParts[i]) ? aParts[i] : -1;
    const bValue = Number.isFinite(bParts[i]) ? bParts[i] : -1;

    if (aValue !== bValue) return aValue - bValue;
  }

  return a.localeCompare(b);
}

export function sortChecklistHierarchy<T extends {
  number: string;
  sections?: Array<{
    number: string;
    solutions?: Array<{ standardNumber: string }>;
  }>;
}>(chapters: T[]) {
  return chapters
    .map((chapter) => ({
      ...chapter,
      sections: chapter.sections
        ?.map((section) => ({
          ...section,
          solutions: section.solutions
            ? [...section.solutions].sort((a, b) => compareNumericText(a.standardNumber, b.standardNumber))
            : section.solutions,
        }))
        .sort((a, b) => compareNumericText(a.number, b.number)),
    }))
    .sort((a, b) => compareNumericText(a.number, b.number));
}
