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

    chapter.sections.forEach((section) => {
      const isEnabled = toggleMap.get(section.id) !== false;
      if (!isEnabled) return;

      const implementedSolutions = section.solutions.filter(
        (sol) => responseMap.get(sol.id) === 'IMPLEMENTED'
      );
      const implementedCount = implementedSolutions.length;

      // 1. Check Mandatory Solutions
      const missingMandatory = section.solutions.filter(
        (sol) => sol.isMandatory && responseMap.get(sol.id) !== 'IMPLEMENTED'
      );
      if (missingMandatory.length > 0) {
        missingMandatorySectionsSet.add(section.number);
      }

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

      if (sectionCredits < 1) {
        failedSections.push(section.number);
      }

      chapterEarned += sectionCredits;
    });

    return {
      id: chapter.id,
      earned: Math.min(chapterEarned, chapter.totalCredits),
      total: chapter.totalCredits,
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
    failedSections: [...new Set(failedSections)].sort(),
    missingMandatorySections: [...missingMandatorySectionsSet].sort(),
    activeSectionsCount,
  };
}
