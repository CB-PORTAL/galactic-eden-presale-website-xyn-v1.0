import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
      <div style={{
        width: '1.5rem',
        height: '1.5rem',
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
  );
};