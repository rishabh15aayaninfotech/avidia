// components/Sidebar.jsx
import { useContext } from "react";
import { ThemeContext } from "../App";
import {
  FaPenAlt,
  FaCheckDouble,
  FaSearch,
  FaShieldAlt,
  FaUserCircle,
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaCog,
  FaHistory,
  FaRobot,
  FaComments,
  FaLanguage,
  FaMagic,
  FaCompress
} from "react-icons/fa";
import "./Sidebar.css";
import img1 from "./images/ai_logo.png";

export default function Sidebar() {
  const { theme, toggleTheme, activeTool, setActiveTool } = useContext(ThemeContext);

  const tools = [
    { id: "ai-chat", icon: <FaComments />, label: "AI Chat", premium: false },
    { id: "translate", icon: <FaLanguage />, label: "Translate", premium: false },
    { id: "ai-humanizer", icon: <FaMagic />, label: "AI Humanizer", premium: false },
    { id: "proofreader", icon: <FaCheckDouble />, label: "Proofreader", premium: false },
    { id: 'summarizer',icon: <FaCompress />, label: 'Summarizer',  path: '/summarizer' },
    { id: "editor", icon: <FaPenAlt />, label: "AI Editor", premium: false },
    { id: "plagiarism", icon: <FaSearch />, label: "Plagiarism Check", premium: false },
    { id: "ai-detector", icon: <FaShieldAlt />, label: "AI Detector", premium: false },
    // { id: "templates", icon: <FaRobot />, label: "Templates", premium: false },
    { id: "history", icon: <FaHistory />, label: "History", premium: false },
  ];

  return (
    <aside className={`sidebar ${theme}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon"><img src={img1} alt=""  className="img-fluid" width={40}/></span>
          <span className="logo-text">AVIDIA</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="nav-section">
          <h3 className="section-title">Writing Tools</h3>
          <ul className="tool-list">
            {tools.map((tool) => (
              <li key={tool.id}>
                <button
                  className={`tool-item ${activeTool === tool.id ? 'active' : ''} ${tool.premium ? 'premium' : ''}`}
                  onClick={() => setActiveTool(tool.id)}
                  aria-current={activeTool === tool.id ? 'page' : undefined}
                >
                  <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
                  <span className="tool-label">{tool.label}</span>
                  {tool.premium && (
                    <span className="premium-badge" aria-label="Premium feature">PRO</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Section */}
      {/* <div className="sidebar-footer">
        <div className="user-profile">
          <FaUserCircle className="user-avatar" aria-hidden="true" />
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-plan">Free Plan</span>
          </div>
        </div>
        
        <div className="sidebar-actions">
          <button 
            className="action-btn" 
            onClick={toggleTheme} 
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
          </button>
          <button className="action-btn" title="Settings" aria-label="Settings">
            <FaCog aria-hidden="true" />
          </button>
          <button className="action-btn" title="Sign out" aria-label="Sign out">
            <FaSignOutAlt aria-hidden="true" />
          </button>
        </div>
      </div> */}
    </aside>
  );
}