// components/tools/Proofreader.jsx
import { useState, useRef } from "react";
import { 
  FaUpload, 
  FaDownload, 
  FaCopy, 
  FaSyncAlt, 
  FaFileAlt,
  FaEdit,
  FaCheckCircle,
  FaSpellCheck
} from "react-icons/fa";
import { useToast } from "../../components/contexts/ToastContext";
import "./Proofreader.css";

export default function Proofreader() {
  const [inputText, setInputText] = useState("");
  const [proofreadText, setProofreadText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("formal");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  // Writing styles
  const writingStyles = [
    { value: "formal", label: "Formal" },
    { value: "casual", label: "Casual" },
    { value: "academic", label: "Academic" },
    { value: "business", label: "Business" },
    { value: "creative", label: "Creative" }
  ];

  // Supported languages
  const languages = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Italian", label: "Italian" }
  ];

  // API Integration for Proofreading
  const handleProofread = async () => {
    if (!inputText.trim()) {
      addToast("Please enter text to proofread", "warning");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("http://192.168.1.26:9090/ai-proofreader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputText,
          options: {
            style: selectedStyle,
            language: selectedLanguage
          }
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      // Assuming the API returns the proofread text in a similar structure
      const proofread = data?.response?.message?.content || data?.correctedText || "Proofread text not available.";
      setProofreadText(proofread);
      addToast("Text proofread successfully!", "success");
    } catch (error) {
      console.error("Proofreading error:", error);
      addToast("Proofreading failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes("text") && !file.name.endsWith(".txt") && !file.name.endsWith(".doc")) {
      addToast("Please upload a text file (.txt or .doc)", "warning");
      return;
    }

    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setInputText(e.target.result);
      addToast("Document uploaded successfully", "success");
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!proofreadText.trim()) return;

    const blob = new Blob([`Original: ${inputText}\n\nProofread: ${proofreadText}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "proofread-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    addToast("Proofread text downloaded", "success");
  };

  const handleCopy = (text, type) => {
    if (!text.trim()) return;

    navigator.clipboard
      .writeText(text)
      .then(() => addToast(`${type} copied to clipboard`, "success"))
      .catch(() => addToast("Failed to copy text", "error"));
  };

  const handleClearAll = () => {
    setInputText("");
    setProofreadText("");
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    addToast("All text cleared", "info");
  };

  const getErrorCount = (text) => {
    if (!text.trim()) return 0;
    // Simple error detection - you can enhance this based on your needs
    const commonErrors = [
      /\btheir\s+there\b/gi,
      /\byour\s+you're\b/gi,
      /\bits\s+it's\b/gi,
      /,\s+but/gi,
      /\band\s+but/gi,
      /\bhowever\s+but/gi
    ];
    
    let errorCount = 0;
    commonErrors.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) errorCount += matches.length;
    });
    
    return errorCount;
  };

  const getImprovementScore = (original, proofread) => {
    if (!original.trim() || !proofread.trim()) return 0;
    const originalErrors = getErrorCount(original);
    const proofreadErrors = getErrorCount(proofread);
    const improvement = ((originalErrors - proofreadErrors) / Math.max(1, originalErrors)) * 100;
    return Math.max(0, Math.min(100, Math.round(improvement)));
  };

  return (
    <div className="proofreader-container">
      <div className="proofreader-header">
        <div className="header-content">
          <div className="header-icon">
            <FaSpellCheck />
          </div>
          <div className="header-text">
            <h1 className="proofreader-title">AVIDIA Proofreader</h1>
            <p className="proofreader-subtitle">Fix grammar, spelling, and style issues in your text</p>
          </div>
        </div>
        <div className="options-panel">
          <div className="option-group">
            <label htmlFor="writing-style">Writing Style:</label>
            <select 
              id="writing-style"
              value={selectedStyle} 
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="style-select"
            >
              {writingStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="option-group">
            <label htmlFor="language">Language:</label>
            <select 
              id="language"
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="style-select"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* <div className="file-upload-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.doc,.docx"
              style={{ display: "none" }}
            />
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaUpload /> Upload Document
            </button>
            {uploadedFileName && (
              <div className="file-info">
                <FaFileAlt /> {uploadedFileName}
              </div>
            )}
          </div> */}
        </div>
        <div className="header-actions">
          {(inputText || proofreadText) && (
            <button className="action-btn secondary" onClick={handleClearAll} title="Clear all text">
              Clear All
            </button>
          )}
          <button className="action-btn primary" onClick={handleProofread} disabled={isProcessing || !inputText.trim()}>
            {isProcessing ? (
              <>
                <FaSyncAlt className="spinning" /> Proofreading...
              </>
            ) : (
              <>
                <FaSpellCheck /> Proofread
              </>
            )}
          </button>
        </div>
      </div>

      <div className="proofreader-content">
        {/* Options Panel */}
        {/* <div className="options-panel">
          <div className="option-group">
            <label htmlFor="writing-style">Writing Style:</label>
            <select 
              id="writing-style"
              value={selectedStyle} 
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="style-select"
            >
              {writingStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="option-group">
            <label htmlFor="language">Language:</label>
            <select 
              id="language"
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="language-select"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="file-upload-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.doc,.docx"
              style={{ display: "none" }}
            />
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaUpload /> Upload Document
            </button>
            {uploadedFileName && (
              <div className="file-info">
                <FaFileAlt /> {uploadedFileName}
              </div>
            )}
          </div>
        </div> */}

        <div className="proofreader-main">
          <div className="input-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <FaEdit className="panel-icon" /> Original Text
              </h3>
              {inputText && (
                <div className="panel-actions">
                  <button 
                    className="action-btn small" 
                    onClick={() => handleCopy(inputText, "Original text")} 
                    title="Copy original text"
                  >
                    <FaCopy />
                  </button>
                </div>
              )}
            </div>

            <div className="text-area-container">
              <textarea
                className="text-area input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter or paste your text here to proofread it for grammar, spelling, and style improvements"
                rows={12}
              />
              {/* {inputText && (
                <div className="text-metrics">
                  <div className="metric">
                    <span className="metric-label">Detected Issues:</span>
                    <span className="metric-value issues-count">{getErrorCount(inputText)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Word Count:</span>
                    <span className="metric-value word-count">{inputText.split(/\s+/).filter(word => word.length > 0).length}</span>
                  </div>
                </div>
              )} */}
            </div>
          </div>

          <div className="output-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <FaCheckCircle className="panel-icon" /> Proofread Text
              </h3>
              {proofreadText && (
                <div className="panel-actions">
                  <button 
                    className="action-btn small" 
                    onClick={() => handleCopy(proofreadText, "Proofread text")} 
                    title="Copy proofread text"
                  >
                    <FaCopy />
                  </button>
                  <button 
                    className="action-btn small" 
                    onClick={handleDownload} 
                    title="Download proofread text"
                  >
                    <FaDownload />
                  </button>
                </div>
              )}
            </div>

            <div className="text-area-container">
              <textarea
                className="text-area output-text"
                value={proofreadText}
                onChange={(e) => setProofreadText(e.target.value)}
                placeholder="Proofread text will appear here..."
                rows={12}
                readOnly={!proofreadText}
              />
              {/* {proofreadText && (
                <div className="text-metrics">
                  <div className="metric">
                    <span className="metric-label">Improvement Score:</span>
                    <span className="metric-value improvement-high">
                      {getImprovementScore(inputText, proofreadText)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Remaining Issues:</span>
                    <span className="metric-value issues-count">{getErrorCount(proofreadText)}</span>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✍️</div>
            <h4>Grammar & Spelling</h4>
            <p>Fix grammatical errors, spelling mistakes, and punctuation issues automatically</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h4>Style Optimization</h4>
            <p>Adapt your writing to different styles: formal, casual, academic, or business</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h4>Multi-language Support</h4>
            <p>Proofread text in multiple languages including English, Spanish, French, and more</p>
          </div>
        </div>
      </div>
    </div>
  );
}