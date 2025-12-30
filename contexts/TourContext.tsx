
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from './I18nContext';

export interface TourStep {
  target: string; // CSS Selector or ID
  titleKey: string;
  contentKey: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TourContextProps {
  runTour: boolean;
  stepIndex: number;
  steps: TourStep[];
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  hasSeenTour: boolean;
}

const TourContext = createContext<TourContextProps | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  
  // Define Tour Steps Global Configuration
  const steps: TourStep[] = [
    { target: '[data-tour="sidebar-dashboard"]', titleKey: 'tour.dashboard.title', contentKey: 'tour.dashboard.content', position: 'right' },
    { target: '[data-tour="sidebar-radios"]', titleKey: 'tour.radios.title', contentKey: 'tour.radios.content', position: 'right' },
    { target: '[data-tour="sidebar-music"]', titleKey: 'tour.music.title', contentKey: 'tour.music.content', position: 'right' },
    { target: '[data-tour="sidebar-settings"]', titleKey: 'tour.settings.title', contentKey: 'tour.settings.content', position: 'right' },
    { target: '[data-tour="header-user"]', titleKey: 'tour.user.title', contentKey: 'tour.user.content', position: 'left' },
  ];

  useEffect(() => {
    const seen = localStorage.getItem('lomuz_tour_seen');
    if (seen) {
      setHasSeenTour(true);
    } else {
      // Auto-start tour on first visit after a short delay
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setStepIndex(0);
    setRunTour(true);
  };

  const stopTour = () => {
    setRunTour(false);
    setHasSeenTour(true);
    localStorage.setItem('lomuz_tour_seen', 'true');
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      stopTour();
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  return (
    <TourContext.Provider value={{ runTour, stepIndex, steps, startTour, stopTour, nextStep, prevStep, hasSeenTour }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
