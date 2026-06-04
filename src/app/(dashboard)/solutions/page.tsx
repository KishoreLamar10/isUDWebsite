import BrowseSolutionsClient from '@/components/BrowseSolutionsClient';
import { prisma } from '@/lib/prisma';
import { sortChecklistHierarchy } from '@/lib/naturalSort';

export default async function BrowseSolutionsPage() {
  const chapters = sortChecklistHierarchy(await prisma.chapter.findMany({
    orderBy: { number: 'asc' },
    include: {
      sections: {
        orderBy: { number: 'asc' },
        include: {
          solutions: {
            orderBy: { standardNumber: 'asc' },
            include: {
              goals: true,
              phases: true,
              figures: {
                where: {
                  url: {
                    not: null,
                  },
                },
                orderBy: { label: 'asc' },
              },
            },
          },
        },
      },
    },
  }));

  return <BrowseSolutionsClient chapters={chapters} />;
}
