// src/components/animations/PortalAnimation.tsx
import React, { useEffect, useRef } from 'react';

interface PortalAnimationProps {
  active?: boolean;
}

export const PortalAnimation: React.FC<PortalAnimationProps> = ({ active = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 3;
    let currentRadius = 0;
    let hue = 220;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (active) {
        currentRadius = Math.min(currentRadius + 1, maxRadius);
      } else {
        currentRadius = Math.max(currentRadius - 1, 0);
      }

      // Draw portal rings
      for (let i = 0; i < 3; i++) {
        const radius = currentRadius - i * 20;
        if (radius > 0) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${hue + i * 20}, 100%, 60%, ${0.5 - i * 0.1})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      hue = (hue + 0.5) % 360;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};