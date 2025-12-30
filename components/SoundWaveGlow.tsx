
import React, { useRef, useEffect, memo } from 'react';

interface SoundWaveGlowProps {
  isPlaying: boolean;
  intensity?: number; // 0 a 1
  color?: string;
}

const SoundWaveGlow: React.FC<SoundWaveGlowProps> = ({ 
  isPlaying, 
  intensity = 0.5, 
  color = '#7C3AED' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Respeita preferência de movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      // Interromper processamento se a aba não estiver visível
      if (document.hidden) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;
      
      // Ajuste de velocidade baseado no estado e preferências
      const speed = prefersReducedMotion ? 0.005 : (isPlaying ? 0.04 : 0.01);
      const currentIntensity = isPlaying ? intensity : 0.1;
      
      phaseRef.current += speed;

      // Desenha 3 camadas de ondas com frequências e opacidades diferentes
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        
        // Gradiente de linha para efeito de fade nas pontas
        const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
        lineGrad.addColorStop(0, 'transparent');
        lineGrad.addColorStop(0.5, `${color}${i === 0 ? '66' : '33'}`);
        lineGrad.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = lineGrad;
        ctx.shadowBlur = isPlaying ? 15 : 5;
        ctx.shadowColor = color;

        for (let x = 0; x < width; x += 2) {
          const frequency = 0.005 + (i * 0.002);
          const amplitude = (height * 0.3 * currentIntensity) / (i + 1);
          const y = midY + Math.sin(x * frequency + phaseRef.current + (i * 2)) * amplitude;
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    if (!prefersReducedMotion || isPlaying) {
      requestRef.current = requestAnimationFrame(render);
    } else {
        // Se movimento reduzido e pausado, desenha apenas uma vez
        render();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, intensity, color]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen"
      style={{ filter: 'blur(1px)' }}
    />
  );
};

export default memo(SoundWaveGlow);
