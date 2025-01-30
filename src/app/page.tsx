"use client";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import GalacticPortal with no SSR
const GalacticPortal = dynamic(
  () => import('@/components/GalacticPortal'),
  { ssr: false }
);

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalacticPortal />
    </Suspense>
  );
}