// components/tools/Paraphraser.jsx
import { useState } from "react";
import "./Tools.css";

export default function Paraphraser() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedMode, setSelectedMode] = useState("Standard");
  const [synonymsLevel, setSynonymsLevel] = useState(3);

  const modes = ["Standard", "Fluency", "Formal", "Academic", "Simple", "Creative", "Expand", "Shorten"];

  const handleParaphrase = () => {
    // Mock paraphrasing - in real app, this would call an API
    const mockOutput = inputText ? `Paraphrased: ${inputText} (using ${selectedMode} mode)` : "";
    setOutputText(mockOutput);
  };

  const handleSampleText = () => {
    const sample = "The quick brown fox jumps over the lazy dog. This is a sample text to demonstrate the paraphrasing capabilities of our AI tool.";
    setInputText(sample);
  };

  return (
    <div className="tool-container">
      {/* Controls Section */}
      <div className="controls-card">
        <div className="controls-row">
          <div className="control-group">
            <label className="control-label">Language</label>
            <select className="control-select">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>French</option>
              <option>Spanish</option>
              <option>German</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Synonyms</label>
            <div className="slider-group">
              <input 
                type="range" 
                min="0" 
                max="5" 
                value={synonymsLevel}
                onChange={(e) => setSynonymsLevel(e.target.value)}
                className="synonym-slider"
              />
              <span className="slider-value">{synonymsLevel}</span>
            </div>
          </div>
        </div>

        <div className="modes-grid">
          {modes.map((mode) => (
            <button
              key={mode}
              className={`mode-btn ${selectedMode === mode ? 'active' : ''}`}
              onClick={() => setSelectedMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn secondary" onClick={handleSampleText}>
          Try Sample Text
        </button>
        <button className="action-btn secondary">
          Paste Text
        </button>
      </div>

      {/* Text Areas */}
      <div className="text-areas-grid">
        <div className="text-area-card">
          <div className="card-header">
            <h3>Original Text</h3>
            <span className="char-count">{inputText.length} characters</span>
          </div>
          <textarea
            className="modern-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter or paste your text here to rewrite..."
            rows={12}
          />
        </div>

        <div className="text-area-card">
          <div className="card-header">
            <h3>Rewritten Text</h3>
            <button className="copy-btn" disabled={!outputText}>
              Copy Text
            </button>
          </div>
          <textarea
            className="modern-textarea"
            value={outputText}
            readOnly
            placeholder="Your rewritten text will appear here..."
            rows={12}
          />
        </div>
      </div>

      {/* Main Action Button */}
      <div className="main-action">
        <button className="primary-btn large" onClick={handleParaphrase}>
          <span className="btn-icon">✨</span>
          Paraphrase Text
        </button>
      </div>
    </div>
  );
}