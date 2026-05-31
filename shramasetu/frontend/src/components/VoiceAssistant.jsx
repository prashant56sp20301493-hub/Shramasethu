import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VoiceAssistantButton from './voice/VoiceAssistantButton';
import IVRModal from './voice/IVRModal';
import OwnerIVRModal from './voice/OwnerIVRModal';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const VoiceAssistant = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const { speak } = useTextToSpeech();
  const { t } = useTranslation();
  
  // Resolve user role
  let userRole = localStorage.getItem('role') || 'labour';

  // Auto read screen on location transitions (Accessibility Easy Mode feature)
  useEffect(() => {
    const isEasyMode = localStorage.getItem('shramasetu_easymode') === 'true';
    if (!isEasyMode || isModalOpen) return;

    let announceText = '';
    const path = location.pathname;

    if (path.includes('/dashboard/labour')) {
      announceText = "Available Job Offers page opened.";
    } else if (path.includes('/labour/attendance')) {
      announceText = "Attendance tracking page opened.";
    } else if (path.includes('/labour/wages')) {
      announceText = "Wages tracking page opened.";
    } else if (path.includes('/labour/insurance')) {
      announceText = "Health Insurance policy page opened.";
    } else if (path.includes('/labour/feedback')) {
      announceText = "Rate Owner feedback form opened.";
    } else if (path.includes('/labour/support')) {
      announceText = "AI Chat support page opened.";
    } else if (path.includes('/dashboard/owner')) {
      announceText = "Owner Hire dashboard opened.";
    } else if (path.includes('/owner/attendance')) {
      announceText = "Labour Attendance sheet opened.";
    } else if (path.includes('/owner/wages')) {
      announceText = "Labour Wage calculator opened.";
    } else if (path.includes('/owner/marketplace')) {
      announceText = "Rental Marketplace opened.";
    } else if (path.includes('/owner/insurance')) {
      announceText = "Owner Health Insurance opened.";
    } else if (path.includes('/dashboard/admin')) {
      announceText = "Admin System Status dashboard opened. Currently 2 registered users, 1 active job, Firestore server connected.";
    } else if (path.includes('/admin/rental-companies')) {
      announceText = "Rental companies ledger opened.";
    } else if (path.includes('/admin/insurance-plans')) {
      announceText = "Insurance providers management opened.";
    } else if (path.includes('/admin/commissions')) {
      announceText = "Profits ledger opened.";
    } else if (path.includes('/admin/feedback')) {
      announceText = "Manage feedback screen opened.";
    } else if (path.includes('/admin/support-chats')) {
      announceText = "Support chats monitor opened.";
    }

    if (announceText) {
      // Small timeout so user hears it clearly after render completes
      const timer = setTimeout(() => {
        speak(announceText);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, speak, isModalOpen]);

  return (
    <>
      <VoiceAssistantButton onClick={() => setIsModalOpen(true)} />
      {userRole === 'owner' ? (
        <OwnerIVRModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userRole={userRole} 
        />
      ) : (
        <IVRModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userRole={userRole} 
        />
      )}
    </>
  );
};

export default VoiceAssistant;
