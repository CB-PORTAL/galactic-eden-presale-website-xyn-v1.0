'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioSrc: string;
  volume?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSrc,
  volume = 0.4,
  autoPlay = true,
  loop = true
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    
    audio.volume = volume;
    audio.loop = loop;
    
    audio.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
      if (autoPlay) {
        attemptPlay();
      }
    });
    
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioSrc, volume, autoPlay, loop]);

  // Auto-play when Connect Wallet is clicked
  useEffect(() => {
    const connectButtons = document.querySelectorAll('button');
    
    const handleConnectClick = () => {
      if (audioRef.current && !isPlaying) {
        attemptPlay();
      }
    };
    
    connectButtons.forEach(button => {
      if (button.textContent?.includes('Connect Wallet') || 
          button.textContent?.includes('Already Installed') || 
          button.textContent?.includes('Install Phantom')) {
        button.addEventListener('click', handleConnectClick);
      }
    });
    
    return () => {
      connectButtons.forEach(button => {
        if (button.textContent?.includes('Connect Wallet') || 
            button.textContent?.includes('Already Installed') || 
            button.textContent?.includes('Install Phantom')) {
          button.removeEventListener('click', handleConnectClick);
        }
      });
    };
  }, [isPlaying]);
  
  const attemptPlay = async () => {
    if (audioRef.current && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setHasInteracted(true);
      } catch (error) {
        console.log('Autoplay prevented. User interaction required.');
      }
    }
  };
  
  useEffect(() => {
    const handleUserInteraction = () => {
      if (autoPlay && isLoaded && !isPlaying) {
        attemptPlay();
        setHasInteracted(true);
      }
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [autoPlay, isLoaded, isPlaying]);
  
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setHasInteracted(true);
  };
  
  // Enhanced cosmic audio control - repositioned to stay within the purple background
  return (
    <div
      className="cosmic-audio-control"
      onClick={togglePlayback}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',           // Center horizontally
        transform: 'translateX(-50%)', // Ensure perfect centering
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        backgroundColor: 'rgba(45, 18, 100, 0.75)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50px',
        border: `1px solid ${isPlaying ? 'rgba(79, 209, 197, 0.5)' : 'rgba(139, 92, 246, 0.5)'}`,
        boxShadow: isPlaying 
          ? '0 0 15px rgba(79, 209, 197, 0.3), 0 0 5px rgba(79, 209, 197, 0.2)' 
          : '0 0 15px rgba(139, 92, 246, 0.3), 0 0 5px rgba(139, 92, 246, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        gap: '12px',
        maxWidth: '280px',     // Limit width for smaller screens
        width: 'auto'
      }}
    >
      {/* Cosmic orb */}
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isPlaying 
            ? 'radial-gradient(circle, #4fd1c5 10%, #4299e1 100%)' 
            : 'radial-gradient(circle, #8b5cf6 10%, #6366f1 100%)',
          boxShadow: isPlaying
            ? '0 0 10px #4fd1c5, 0 0 5px rgba(66, 153, 225, 0.8) inset'
            : '0 0 10px #8b5cf6, 0 0 5px rgba(99, 102, 241, 0.8) inset',
          position: 'relative',
          animation: isPlaying ? 'pulse 2s infinite' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Sound wave animation */}
        {isPlaying && (
          <>
            <div className="sound-wave" style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'transparent',
              border: '1px solid rgba(79, 209, 197, 0.5)',
              animation: 'wave 2s infinite',
              opacity: 0
            }}></div>
            <div className="sound-wave" style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'transparent',
              border: '1px solid rgba(79, 209, 197, 0.5)',
              animation: 'wave 2s infinite 0.6s',
              opacity: 0
            }}></div>
          </>
        )}
        
        {/* Icon */}
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {isPlaying ? (
            <>
              <path d="M8 12h8" />
            </>
          ) : (
            <>
              <polygon points="5 3 19 12 5 21 5 3" />
            </>
          )}
        </svg>
      </div>
      
      {/* Text content */}
      <div style={{ textAlign: 'left' }}>
        <p style={{
          margin: 0,
          fontSize: '0.8rem',
          fontWeight: 'bold',
          color: isPlaying ? '#4fd1c5' : '#93C5FD',
          letterSpacing: '0.5px'
        }}>
          {isPlaying ? "Cosmic Experience Active" : "Activate Cosmic Experience"}
        </p>
        <p style={{
          margin: 0,
          fontSize: '0.65rem',
          color: 'rgba(147, 197, 253, 0.8)',
          letterSpacing: '0.3px'
        }}>
          {isPlaying ? "Immersive Galactic Eden Sounds" : "Enhance your journey with cosmic ambient sound"}
        </p>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes wave {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        
        .cosmic-audio-control:hover {
          transform: translateX(-50%) translateY(-2px);
          box-shadow: ${isPlaying 
            ? '0 0 20px rgba(79, 209, 197, 0.4), 0 0 10px rgba(79, 209, 197, 0.3)' 
            : '0 0 20px rgba(139, 92, 246, 0.4), 0 0 10px rgba(139, 92, 246, 0.3)'};
        }

        @media (max-width: 768px) {
          .cosmic-audio-control {
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;