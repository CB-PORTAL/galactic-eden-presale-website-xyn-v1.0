"use client";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const GalacticPortal = dynamic(
  () => import('@/components/GalacticPortal'),
  { ssr: false }
);

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: '#93C5FD',
          marginBottom: '2rem'
        }}>Loading Galactic Eden...</h1>
        <div style={{ 
          width: '2rem', 
          height: '2rem', 
          borderRadius: '9999px',
          borderTop: '2px solid #3b82f6',
          borderBottom: '2px solid #3b82f6',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <GalacticPortal />
    </Suspense>
  );
}