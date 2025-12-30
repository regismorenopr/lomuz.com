
import React, { useRef, useEffect } from 'react';

interface VolumeMonitorProps {
  isPlaying: boolean;
  mediaType?: string; // 'MUSIC', 'COMMERCIAL', etc.
  className?: string;
  barCount?: number;
}

const VolumeMonitor: React.FC<VolumeMonitorProps> = ({ 
  isPlaying, 
  mediaType = 'MUSIC', 
  className = '',
  barCount = 24 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // State for smooth animation (Current height vs Target height)
  const bars = useRef<number[]>(new Array(barCount).fill(0)); 
  const targets = useRef<number[]>(new Array(barCount).fill(0)); 
  
  // Configuration based on media type
  const isMusic = mediaType === 'MUSIC';
  
  // Physics configuration: Music is snappier, Voice is smoother
  const speed = isMusic ? 0.2 : 0.15; 
  const volatility = isMusic ? 0.95 : 0.7; 

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // --- GRADIENT DEFINITION ---
      // Defined per frame to adapt to resizing if necessary, though usually static
      const gradient = ctx.createLinearGradient(0, rect.height, 0, 0);
      
      if (isMusic) {
          // LOMUZ IMPERIAL THEME (Roxo/Purple) - Valorizando a marca
          gradient.addColorStop(0, '#4C1D95');   // Base: Violet 900 (Deep)
          gradient.addColorStop(0.4, '#6D28D9'); // Low-Mid: Amethyst
          gradient.addColorStop(0.6, '#7C3AED'); // Mid: Lomuz Imperial (Primary)
          gradient.addColorStop(1, '#D8B4FE');   // Peak: Lavender (Bright)
      } else {
          // MEDIA/COMMERCIAL THEME (Amarelo/Gold) - Destaque para inserções
          gradient.addColorStop(0, '#B45309');   // Base: Amber 700
          gradient.addColorStop(0.5, '#F59E0B'); // Mid: Lomuz Gold
          gradient.addColorStop(1, '#FEF3C7');   // Peak: Pale Amber
      }

      ctx.fillStyle = gradient;

      // Bar Dimensions with gaps
      const gapRatio = 0.35; // 35% gap for cleaner separation
      const barWidth = (rect.width / barCount) * (1 - gapRatio);
      const gap = (rect.width / barCount) * gapRatio;

      for (let i = 0; i < barCount; i++) {
        // 1. Update Logic (Simulated Physics)
        if (isPlaying) {
          // If close to target, pick new random target
          if (Math.abs(bars.current[i] - targets.current[i]) < 0.05) {
            const noise = Math.random();
            const pos = i / barCount;
            let shapeFactor = 1.0;

            // Shape the noise to simulate Frequency Spectrum
            if (isMusic) {
                // Music Curve: Boost Bass (Left), Dip Mids, Boost Highs
                if (pos < 0.25) shapeFactor = 1.0 + (Math.random() * 0.3); // Heavy Bass
                else if (pos > 0.3 && pos < 0.6) shapeFactor = 0.6; // Mid scoop
                else shapeFactor = 0.85; // Presence/Highs
            } else {
                // Voice Curve: Focus on Center (Human Speech Range)
                // Bell curve shape
                const distFromCenter = Math.abs(pos - 0.5);
                shapeFactor = Math.max(0.2, 1.2 - (distFromCenter * 2.5)); 
            }

            targets.current[i] = noise * volatility * shapeFactor;
          }
        } else {
          // Idle State: Gentle hum
          targets.current[i] = 0.03 + (Math.sin(Date.now() / 500 + i) * 0.01); 
        }

        // Smooth Interpolation (Lerp)
        bars.current[i] += (targets.current[i] - bars.current[i]) * speed;

        // 2. Draw Logic
        const x = i * (barWidth + gap) + (gap / 2);
        // Ensure strictly positive height for rendering
        const visualHeight = Math.max(bars.current[i] * rect.height, 3); 
        const y = rect.height - visualHeight;

        ctx.beginPath();
        // Modern rounded top bars
        const radius = Math.min(barWidth / 2, visualHeight / 2);
        ctx.roundRect(x, y, barWidth, visualHeight, [radius, radius, 0, 0]);
        
        // Glow Effect (Neon style)
        ctx.shadowBlur = 12;
        ctx.shadowColor = isMusic 
            ? 'rgba(124, 58, 237, 0.4)' // Purple Glow
            : 'rgba(245, 158, 11, 0.4)'; // Gold Glow
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, mediaType, barCount, isMusic, speed, volatility]);

  return (
    <div className={`relative ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default VolumeMonitor;
