// src/components/AudioPlayer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioSrc: string;
  volume?: number; // 0 to 1
  autoPlay?: boolean;
  loop?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSrc,
  volume = 0.4, // Default to 40% volume
  autoPlay = true,
  loop = true
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    
    // Configure audio
    audio.volume = volume;
    audio.loop = loop;
    
    // Event listeners
    audio.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
      // Many browsers require user interaction before allowing autoplay
      // We'll keep trying to play in case user interacts with the page
      if (autoPlay) {
        attemptPlay();
      }
    });
    
    // Handle play state tracking
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioSrc, volume, autoPlay, loop]);
  
  // Attempt to play audio (might be blocked by browser)
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
  
  // Add event listener to document for user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (autoPlay && isLoaded && !isPlaying) {
        attemptPlay();
        setHasInteracted(true);
      }
    };
    
    // These events count as user interaction for autoplay policies
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [autoPlay, isLoaded, isPlaying]);
  
  // Toggle play/pause
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setHasInteracted(true);
  };
  
  return (
    <div 
      className="audio-player-controls" 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: 'rgba(45, 18, 100, 0.7)',
        backdropFilter: 'blur(8px)',
        borderRadius: '50px',
        border: '1px solid rgba(139, 92, 246, 0.5)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(147, 197, 253, 0.2)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        maxWidth: '300px'
      }}
      onClick={togglePlayback}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isPlaying 
            ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.6), rgba(139, 92, 246, 0.6))' 
            : 'linear-gradient(135deg, rgba(236, 72, 153, 0.6), rgba(139, 92, 246, 0.6))',
          marginRight: '10px',
          flexShrink: 0,
          border: '1px solid rgba(147, 197, 253, 0.3)',
          boxShadow: isPlaying 
            ? '0 0 10px rgba(79, 70, 229, 0.4)' 
            : '0 0 10px rgba(236, 72, 153, 0.4)'
        }}
      >
        {isPlaying ? (
          <svg width="14" height="14" fill="white" viewBox="0 0 16 16">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
          </svg>
        ) : (
          <svg width="14" height="14" fill="white" viewBox="0 0 16 16">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
          </svg>
        )}
      </div>
      <div style={{ overflow: 'hidden' }}>
        <p 
          style={{ 
            margin: 0, 
            color: '#93C5FD',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}
        >
          {isPlaying ? "Enhanced Experience On" : "Activate Full Experience"}
        </p>
        <p 
          style={{ 
            margin: 0, 
            color: 'rgba(147, 197, 253, 0.7)',
            fontSize: '0.65rem',
            whiteSpace: 'nowrap'
          }}
        >
          {isPlaying ? "Immersive Galactic Eden Sound" : "Unlock the cosmic atmosphere"}
        </p>
      </div>
    </div>
  );
};

export default AudioPlayer;