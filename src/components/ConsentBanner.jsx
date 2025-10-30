// components/ConsentBanner.jsx
import { useContext, useState } from "react";
import { ConsentContext } from "../App";
import "./ConsentBanner.css";

export default function ConsentBanner() {
  const { consent, updateConsent } = useContext(ConsentContext);
  const [isOpen, setIsOpen] = useState(!localStorage.getItem('qualibot-consent'));

  const handleAcceptAll = () => {
    updateConsent({
      essential: true,
      analytics: true,
      personalization: true,
      training: true
    });
    setIsOpen(false);
  };

  const handleRejectAll = () => {
    updateConsent({
      essential: true,
      analytics: false,
      personalization: false,
      training: false
    });
    setIsOpen(false);
  };

  const handleCustomize = () => {
    // Implement custom consent modal
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="consent-banner" role="dialog" aria-labelledby="consent-title">
      <div className="consent-content">
        <h3 id="consent-title" className="consent-title">Cookie Consent</h3>
        <p className="consent-description">
          We use cookies and similar technologies to provide essential functionality, 
          analyze usage, and personalize your experience. Some data may be used to 
          improve our AI models. You can customize your preferences below.
        </p>
        
        <div className="consent-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleRejectAll}
          >
            Reject All
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleCustomize}
          >
            Customize
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAcceptAll}
          >
            Accept All
          </button>
        </div>
        
        <div className="consent-links">
          <a href="/privacy" className="consent-link">Privacy Policy</a>
          <a href="/terms" className="consent-link">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}