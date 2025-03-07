// src/components/GalacticPortal.tsx
'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectButton } from "./wallet/ConnectButton";
import { PurchaseInterface } from "./presale/PurchaseInterface";
import { TokenMetrics } from "./presale/TokenMetrics";
import ImprovedSpaceshipFleet from "./animations/ImprovedSpaceshipFleet";
import AudioPlayer from "./AudioPlayer";
import "./wallet/ConnectButtonStyles.css";
import { DebugToggle } from "./DebugToggle";

const GalacticPortal: React.FC = () => {
  const { connected } = useWallet();
 
  return (
    <div style={{
      backgroundColor: 'black',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto'
    }}>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #4C1D95, #3B0764, #2D1264)',
        padding: '2rem 1rem'
      }}>
        {/* Stars background */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '2px',
                height: '2px',
                backgroundColor: 'white',
                borderRadius: '9999px',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: 'twinkle 3s ease-in-out infinite',
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>
       
        {/* Improved Spaceship animations */}
        <ImprovedSpaceshipFleet count={6} minSize={30} maxSize={55} minSpeed={0.7} maxSpeed={1.5} />
       
        {/* Content container */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '36rem',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Header */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#93C5FD',
              marginBottom: '1rem'
            }}>
              Galactic Eden
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(147, 197, 253, 0.8)'
            }}>
              The Gateway to a New Digital Universe
            </p>
          </div>
         
          {/* Main portal */}
          <div style={{
            width: '100%',
            maxWidth: '36rem',
            margin: '0 auto',
            backgroundColor: 'rgba(45, 18, 100, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(88, 28, 135, 0.3)',
            marginBottom: '2rem'
          }}>
            {/* Portal header */}
            <div style={{
              backgroundColor: '#3B0764',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#93C5FD'
              }}>
                XYN Token Presale Portal
              </h2>
            </div>
           
            {/* Portal content */}
            <div style={{ padding: '1.5rem' }}>
              {!connected ? (
                <div style={{
                  textAlign: 'center',
                  padding: '1rem 0'
                }}>
                  <p style={{
                    color: '#93C5FD',
                    fontSize: '1.125rem',
                    marginBottom: '2rem'
                  }}>
                    Connect your wallet to acquire XYN tokens - your key to the Galactic Eden universe
                  </p>
                  <ConnectButton />
                </div>
              ) : (
                <PurchaseInterface />
              )}
            </div>
          </div>
         
          {/* Footer information with network indicator */}
          <div style={{
            textAlign: 'center',
            marginTop: 'auto'
          }}>
            <p style={{ color: 'rgba(147, 197, 253, 0.8)', marginBottom: '0.5rem' }}>Total Supply: 10,000,000,000 XYN</p>
            <p style={{ color: 'rgba(147, 197, 253, 0.7)', marginBottom: '0.5rem' }}>Exchange Rate: 1 SOL = 1,000,000 XYN</p>
            <p style={{ color: 'rgba(147, 197, 253, 0.5)', fontSize: '0.875rem', marginTop: '1rem' }}>
              Powered by Solana{' '}
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#3B0764',
                borderRadius: '9999px',
                fontSize: '0.75rem'
              }}>
                {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Add the audio player */}
      <AudioPlayer audioSrc="/audio/galactic-ambient.mp3" volume={0.4} />
    </div>
  );
};

export default GalacticPortal;