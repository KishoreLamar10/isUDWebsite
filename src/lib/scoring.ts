import { ResponseStatus } from '@prisma/client';

export type SolutionData = {
  id: string;
  points: number;
  isMandatory: boolean;
  standardNumber: string;
};

export type SectionData = {
  id: string;
  number: string;
  totalCredits: number;
  minPoints1: number;
  minPoints2: number;
  minPoints3: number;
  solutions: SolutionData[];
};

export type ChapterData = {
  id: string;
  number: string;
  totalCredits: number;
  sections: SectionData[];
};

export type ResponseData = {
  solutionId: string;
  status: ResponseStatus;
};

export type ToggleData = {
  sectionId: string;
  isEnabled: boolean;
};

const preliminaryApplicableSections = new Set([
  '2.1',
  '2.2',
  '2.3',
  '2.4',
  '3.1',
  '3.2',
  '3.3',
  '3.4',
  '3.5',
  '3.6',
  '3.7',
  '3.8',
  '3.9',
  '3.10',
  '3.11',
  '3.12',
  '4.2',
  '4.4',
  '5.1',
  '5.2',
  '5.3',
  '5.4',
  '5.5',
  '5.6',
  '5.8',
  '6.1',
  '6.3',
  '6.4',
  '6.5',
  '6.6',
  '6.7',
  '6.9',
  '6.11',
  '6.12',
  '6.13',
  '6.14',
  '6.15',
  '6.16',
  '7.1',
  '7.2',
  '7.3',
  '7.4',
  '7.5',
  '7.6',
  '7.7',
  '7.8',
  '7.9',
  '7.10',
  '7.11',
  '7.12',
  '8.1',
  '8.2',
  '8.3',
  '8.4',
  '8.5',
  '8.6',
  '9.1',
  '9.2',
  '9.3',
]);

function compareStandardNumbers(a: string, b: string) {
  const aParts = a.split('.').map((part) => Number(part));
  const bParts = b.split('.').map((part) => Number(part));
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i++) {
    const aValue = aParts[i] ?? -1;
    const bValue = bParts[i] ?? -1;

    if (aValue !== bValue) return aValue - bValue;
  }

  return a.localeCompare(b);
}

function getDisplaySectionNumber(chapterNumber: string, sectionNumber: string) {
  return `${chapterNumber}.${sectionNumber}`;
}

function getRequiredDisplayNumber(standardNumber: string, fallbackSectionNumber: string) {
  const parts = standardNumber.split('.');

  if (parts.length <= 2) return standardNumber || fallbackSectionNumber;

  return parts.slice(0, -1).join('.');
}

/**
 * Calculates scores based on isUD threshold logic
 */
export function calculateProjectScore(
  chapters: ChapterData[],
  responses: ResponseData[],
  toggles: ToggleData[] = []
) {
  const toggleMap = new Map(toggles.map((t) => [t.sectionId, t.isEnabled]));
  const responseMap = new Map(responses.map((r) => [r.solutionId, r.status]));

  let totalBonus = 0;
  const failedSections: string[] = [];
  const missingMandatorySectionsSet = new Set<string>();

  const chapterScores = chapters.map((chapter) => {
    let chapterEarned = 0;
    let chapterAvailable = 0;

    chapter.sections.forEach((section) => {
      const isEnabled = toggleMap.get(section.id) !== false;
      if (!isEnabled) return;

      chapterAvailable += section.totalCredits;

      const implementedSolutions = section.solutions.filter(
        (sol) => responseMap.get(sol.id) === 'IMPLEMENTED'
      );
      const implementedCount = implementedSolutions.length;

      // 1. Check Mandatory Solutions
      const missingMandatory = section.solutions.filter(
        (sol) => sol.isMandatory && responseMap.get(sol.id) !== 'IMPLEMENTED'
      );
      missingMandatory.forEach((solution) => {
        missingMandatorySectionsSet.add(
          getRequiredDisplayNumber(solution.standardNumber, getDisplaySectionNumber(chapter.number, section.number))
        );
      });

      let sectionCredits = 0;
      let thresholdReached = 0; // Number of solutions needed for the earned credits

      // 2. Tiered logic: Calculate base credits
      if (section.minPoints3 > 0 && implementedCount >= section.minPoints3) {
        sectionCredits = section.totalCredits;
        thresholdReached = section.minPoints3;
      } else if (section.minPoints2 > 0 && implementedCount >= section.minPoints2) {
        sectionCredits = section.totalCredits;
        thresholdReached = section.minPoints2;
      } else if (section.minPoints1 > 0 && implementedCount >= section.minPoints1) {
        sectionCredits = Math.max(1, Math.floor(section.totalCredits / 2));
        thresholdReached = section.minPoints1;
      } else {
        const hasThresholds = section.minPoints1 > 0 || section.minPoints2 > 0;
        if (!hasThresholds) {
          const rawScore = section.solutions.reduce((sum, sol) => {
            return sum + (responseMap.get(sol.id) === 'IMPLEMENTED' ? sol.points : 0);
          }, 0);
          sectionCredits = Math.min(rawScore, section.totalCredits);
          thresholdReached = Math.round(sectionCredits); // Approximation for bonus logic
        }
      }

      // 3. Bonus Credits Logic
      // 1 bonus credit for every 5 solutions implemented beyond the requirement
      if (sectionCredits > 0) {
        const surplus = implementedCount - thresholdReached;
        if (surplus >= 5) {
          totalBonus += Math.floor(surplus / 5);
        }
      }

      const displaySectionNumber = getDisplaySectionNumber(chapter.number, section.number);
      if (sectionCredits < 1 && preliminaryApplicableSections.has(displaySectionNumber)) {
        failedSections.push(displaySectionNumber);
      }

      chapterEarned += sectionCredits;
    });

    return {
      id: chapter.id,
      earned: Math.min(chapterEarned, chapterAvailable),
      total: chapterAvailable,
    };
  });

  const totalScore = chapterScores.reduce((sum, ch) => sum + ch.earned, 0);
  const finalBonus = Math.min(totalBonus, 10);
  const activeSectionsCount = chapters.reduce((cnt, ch) => {
    return cnt + ch.sections.filter(s => toggleMap.get(s.id) !== false).length;
  }, 0);

  return {
    chapterScores,
    totalScore,
    totalBonus: finalBonus,
    failedSections: [...new Set(failedSections)].sort(compareStandardNumbers),
    missingMandatorySections: [...missingMandatorySectionsSet].sort(compareStandardNumbers),
    activeSectionsCount,
  };
}
