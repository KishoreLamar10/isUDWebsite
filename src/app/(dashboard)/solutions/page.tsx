import BrowseSolutionsClient from '@/components/BrowseSolutionsClient';
import { prisma } from '@/lib/prisma';
import { sortChecklistHierarchy } from '@/lib/naturalSort';

export default async function BrowseSolutionsPage() {
  const chapters = sortChecklistHierarchy(await prisma.chapter.findMany({
    where: { archivedAt: null },
    orderBy: { number: 'asc' },
    include: {
      sections: {
        where: { archivedAt: null },
        orderBy: { number: 'asc' },
        include: {
          solutions: {
            where: { archivedAt: null },
            orderBy: { standardNumber: 'asc' },
            include: {
              goals: {
                where: { archivedAt: null },
              },
              phases: {
                where: { archivedAt: null },
              },
              figures: {
                where: {
                  archivedAt: null,
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
