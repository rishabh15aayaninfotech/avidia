// components/MainContent.jsx
import { useContext } from "react";
import { ThemeContext } from "../App";
import { FaUser } from "react-icons/fa";
import AIEditor from "./tools/AIEditor";
import Proofreader from "./tools/Proofreader";
import Templates from "./tools/Templates";
import History from "./tools/History";
import PlagiarismChecker from "./tools/PlagiarismChecker";
import AIDetector from "./tools/AIDetector";
import AIChat from "./tools/AIChat";
import Translate from "./tools/Translate";
import AIHumanizer from "./tools/AIHumanizer";
import "./MainContent.css";

export default function MainContent() {
  const { activeTool } = useContext(ThemeContext);

  const renderTool = () => {
    switch (activeTool) {
      case "ai-chat":
        return <AIChat />;
      case "translate":
        return <Translate />;
      case "ai-humanizer":
        return <AIHumanizer />;
      case "editor":
        return <AIEditor />;
      case "proofreader":
        return <Proofreader />;
      case "templates":
        return <Templates />;
      case "history":
        return <History />;
      case "plagiarism":
        return <PlagiarismChecker />;
      case "ai-detector":
        return <AIDetector />;
      default:
        return <AIChat />;
    }
  };

  const getToolTitle = () => {
    const titles = {
      "ai-chat": "AI Chat Assistant",
      "translate": "AI Translator",
      "ai-humanizer": "AI Humanizer",
      editor: "AI Content Editor",
      proofreader: "Proofreader",
      templates: "Content Templates",
      history: "History & Versions",
      plagiarism: "Plagiarism Checker",
      "ai-detector": "AI Content Detector"
    };
    return titles[activeTool] || "AI Chat Assistant";
  };

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="header-content">
          <h1 className="page-title">AVIDIA (Aayan Infotech Model)</h1>
          <div className="header-actions">
            {/* <button className="btn btn-secondary">
              Export
            </button> */}
            <button className="btn btn-primary">
              <span className="btn-icon">
                <FaUser />
              </span>
              
            </button>
          </div>
        </div>
      </div>
      <div className="content-area">
        {renderTool()}
      </div>
    </main>
  );
}