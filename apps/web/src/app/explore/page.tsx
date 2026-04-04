import type { Metadata } from 'next';
import ExploreContent from './explore-content';

export const metadata: Metadata = {
  title: 'Explore Love Stories - Momentee',
  description: 'Discover beautiful couple pages from the Momentee community.',
};

export default function ExplorePage() {
  return <ExploreContent />;
}
