import type { Metadata } from 'next';
import CouplePageWrapper from './wrapper';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

async function fetchCoupleBySlug(slug: string) {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query CoupleBySlug($slug: String!) {
          couple(slug: $slug) {
            displayName
            bio
            coverPhoto
          }
        }`,
        variables: { slug },
      }),
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return json.data?.couple ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const couple = await fetchCoupleBySlug(slug);

  if (!couple) {
    return {
      title: 'Page Not Found - Momentee',
      description: 'This couple page does not exist.',
    };
  }

  const title = `${couple.displayName} - Momentee`;
  const description =
    couple.bio || `${couple.displayName}'s love story on Momentee`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(couple.coverPhoto ? { images: [couple.coverPhoto] } : {}),
      type: 'profile',
      siteName: 'Momentee',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(couple.coverPhoto ? { images: [couple.coverPhoto] } : {}),
    },
  };
}

export default function CouplePublicPage() {
  return <CouplePageWrapper />;
}
