// components/Topbar.jsx
import "./Topbar.css";

export default function Topbar() {
  const modes = ["Standard", "Fluency", "Formal", "Academic", "Simple"];

  return (
    <div className="topbar">
      <div className="topbar-content">
        <div className="lang-select">
          <select className="form-select">
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>French</option>
            <option>Spanish</option>
          </select>
        </div>

        <div className="modes">
          {modes.map((mode) => (
            <button key={mode} className={`mode-btn ${mode === 'Standard' ? 'active' : ''}`}>
              {mode}
            </button>
          ))}
        </div>

        <div className="synonyms">
          <span>Synonyms:</span>
          <div className="slider-container">
            <input type="range" min="0" max="5" className="synonym-slider" />
            <span className="slider-value">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}