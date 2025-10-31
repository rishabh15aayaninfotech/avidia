// App.jsx
import { useState, createContext, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ConsentBanner from "./components/ConsentBanner";
import ToastContainer from "./components/ToastContainer";
import { ToastProvider } from "./components/contexts/ToastContext";
import "./App.css";

export const ThemeContext = createContext();
export const ConsentContext = createContext();

function App() {
  const [theme, setTheme] = useState("light");
  const [activeTool, setActiveTool] = useState("ai-chat"); // Changed default to ai-chat
  const [consent, setConsent] = useState({
    essential: true,
    analytics: false,
    personalization: false,
    training: false
  });

  useEffect(() => {
    // Load consent preferences from localStorage
    const savedConsent = localStorage.getItem('qualibot-consent');
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent));
    }

    // Load active tool state - if not saved, default to ai-chat
    const savedTool = localStorage.getItem('qualibot-active-tool');
    if (savedTool) {
      setActiveTool(savedTool);
    } else {
      setActiveTool("ai-chat"); // Ensure ai-chat is default
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const updateConsent = (newConsent) => {
    setConsent(newConsent);
    localStorage.setItem('qualibot-consent', JSON.stringify(newConsent));
  };

  const setActiveToolWithValidation = (toolId) => {
    const validTools = ["editor", "proofreader", "templates", "history", "plagiarism", "ai-detector", "ai-chat","translate","ai-humanizer","summarizer"];
    
    if (validTools.includes(toolId)) {
      setActiveTool(toolId);
      localStorage.setItem('qualibot-active-tool', toolId);
      
      // Track tool navigation if analytics consent is given
      if (consent.analytics) {
        console.log('Tool navigation:', toolId);
      }
    } else {
      console.warn('Invalid tool ID:', toolId);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      activeTool, 
      setActiveTool: setActiveToolWithValidation 
    }}>
      <ConsentContext.Provider value={{ 
        consent, 
        updateConsent 
      }}>
        <ToastProvider>
          <div className={`app ${theme}`}>
            <div className="app-container">
              <Sidebar />
              <MainContent />
            </div>
            <ConsentBanner />
            <ToastContainer />
          </div>
        </ToastProvider>
      </ConsentContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;