import BrowseSolutionsClient from '@/components/BrowseSolutionsClient';
import { getCachedLibrary } from '@/lib/libraryCache';
import { sortChecklistHierarchy } from '@/lib/naturalSort';

export default async function BrowseSolutionsPage() {
  const chapters = sortChecklistHierarchy(await getCachedLibrary());

  return <BrowseSolutionsClient chapters={chapters} />;
}
