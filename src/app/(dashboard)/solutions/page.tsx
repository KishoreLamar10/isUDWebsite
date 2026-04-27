import BrowseSolutionsClient from '@/components/BrowseSolutionsClient';
import { prisma } from '@/lib/prisma';

export default async function BrowseSolutionsPage() {
  const chapters = await prisma.chapter.findMany({
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
            },
          },
        },
      },
    },
  });

  return <BrowseSolutionsClient chapters={chapters} />;
}
