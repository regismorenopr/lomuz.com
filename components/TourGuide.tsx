
import React, { useEffect, useState, useRef } from 'react';
import { useTour } from '../contexts/TourContext';
import { useTranslation } from '../contexts/I18nContext';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui';

const TourGuide: React.FC = () => {
  const { runTour, stepIndex, steps, nextStep, prevStep, stopTour } = useTour();
  const { t } = useTranslation();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (!runTour) return;

    const updatePosition = () => {
      const element = document.querySelector(currentStep.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTargetRect(element.getBoundingClientRect());
      } else {
        // If element not found, skip or stop? Let's skip for safety
        // nextStep(); 
      }
    };

    // Small delay to allow UI to settle/render
    const timer = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timer);
    };
  }, [runTour, stepIndex, currentStep]);

  if (!runTour || !currentStep || !targetRect) return null;

  // Calculate Popover Position
  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    width: '320px',
  };

  // Simple positioning logic
  const spacing = 20;
  if (currentStep.position === 'right') {
    popoverStyle.top = targetRect.top;
    popoverStyle.left = targetRect.right + spacing;
  } else if (currentStep.position === 'left') {
    popoverStyle.top = targetRect.top;
    popoverStyle.left = targetRect.left - 320 - spacing;
  } else if (currentStep.position === 'bottom') {
    popoverStyle.top = targetRect.bottom + spacing;
    popoverStyle.left = targetRect.left;
  } else if (currentStep.position === 'top') {
    popoverStyle.top = targetRect.top - 200 - spacing; // approx height
    popoverStyle.left = targetRect.left;
  } else {
      // Center fallback
      popoverStyle.top = '50%';
      popoverStyle.left = '50%';
      popoverStyle.transform = 'translate(-50%, -50%)';
  }

  // Ensure it stays on screen (basic boundary check)
  if (typeof popoverStyle.top === 'number' && popoverStyle.top < 20) popoverStyle.top = 20;
  if (typeof popoverStyle.left === 'number' && popoverStyle.left < 20) popoverStyle.left = 20;

  return (
    <>
      {/* Dark Overlay with "Spotlight" via clip-path or huge borders. 
          Here using a simpler high z-index stacking context approach. */}
      <div className="fixed inset-0 z-[9990] bg-black/60 transition-opacity duration-300" onClick={stopTour} />
      
      {/* Highlight Box */}
      <div 
        className="fixed z-[9991] border-2 border-[#22D3EE] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6),0_0_30px_rgba(34,211,238,0.5)] pointer-events-none transition-all duration-300 ease-in-out"
        style={{
          top: targetRect.top - 5,
          left: targetRect.left - 5,
          width: targetRect.width + 10,
          height: targetRect.height + 10,
        }}
      />

      {/* Popover Card */}
      <div 
        className="glass-panel p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col gap-3"
        style={popoverStyle}
      >
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-bold text-[#22D3EE] uppercase tracking-wider">
            {t('common.step')} {stepIndex + 1} / {steps.length}
          </span>
          <button onClick={stopTour} className="text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white">{t(currentStep.titleKey)}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {t(currentStep.contentKey)}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            onClick={stopTour} 
            className="text-xs h-8 px-2"
          >
            {t('tour.skip')}
          </Button>
          
          <div className="flex gap-2">
            {stepIndex > 0 && (
                <Button variant="secondary" onClick={prevStep} className="h-8 w-8 p-0 rounded-lg">
                    <ArrowLeft size={14} />
                </Button>
            )}
            <Button onClick={nextStep} className="h-8 px-4 text-xs">
              {stepIndex === steps.length - 1 ? t('tour.finish') : t('common.next')}
              {stepIndex !== steps.length - 1 && <ArrowRight size={12} className="ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourGuide;
