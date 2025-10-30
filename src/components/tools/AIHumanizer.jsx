// components/tools/AIHumanizer.jsx
import { useState, useRef } from "react";
import { 
  FaUpload, 
  FaDownload, 
  FaCopy, 
  FaSyncAlt, 
  FaFileAlt,
  FaMagic,
  FaUser,
  FaRobot
} from "react-icons/fa";
import { useToast } from "../../components/contexts/ToastContext";
import "./AIHumanizer.css";

export default function AIHumanizer() {
  const [inputText, setInputText] = useState("");
  const [humanizedText, setHumanizedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english-us");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  // Supported languages
  const languages = [
    { code: "english-us", name: "English (US)" },
    { code: "english-uk", name: "English (UK)" },
    { code: "french", name: "French" },
    { code: "spanish", name: "Spanish" },
    { code: "all", name: "All" }
  ];

  // API INTEGRATION HERE
  const handleHumanize = async () => {
    if (!inputText.trim()) {
      addToast("Please enter text to humanize", "warning");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("http://192.168.1.26:9090/ai-humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: inputText }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const humanized =
        data?.response?.message?.content || "Humanized text not available.";
      setHumanizedText(humanized);
      addToast("Text humanized successfully!", "success");
    } catch (error) {
      console.error("Humanization error:", error);
      addToast("Humanization failed. Please try again.", "error");
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
    if (!humanizedText.trim()) return;

    const blob = new Blob([`Original: ${inputText}\n\nHumanized: ${humanizedText}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "humanized-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    addToast("Humanized text downloaded", "success");
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
    setHumanizedText("");
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    addToast("All text cleared", "info");
  };

  const getReadabilityScore = (text) => {
    if (!text.trim()) return 0;
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    let score = Math.max(0, 100 - avgWordsPerSentence * 2);
    return Math.min(100, Math.round(score));
  };

  const getAIProbability = (text) => {
    if (!text.trim()) return 0;
    const aiIndicators = [
      /utilization/gi, /contemporary/gi, /revolutionized/gi, /facilitating/gi,
      /enhanced efficiency/gi, /complex processes/gi, /aforementioned/gi,
      /imperative to acknowledge/gi, /implementation of strategic methodologies/gi,
      /multifaceted nature/gi, /comprehensive analysis/gi, /paramount importance/gi
    ];
    let aiScore = 0;
    aiIndicators.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) aiScore += matches.length * 5;
    });
    return Math.min(95, aiScore);
  };

  return (
    <div className="humanizer-container">
      <div className="humanizer-header">
        <div className="header-content">
          <div className="header-icon">
            <FaMagic />
          </div>
          <div className="header-text">
            <h1 className="humanizer-title">AVIDIA Humanizer</h1>
            <p className="humanizer-subtitle">Make AI-generated text sound natural and human-like</p>
          </div>
        </div>
        <div className="header-actions">
          {(inputText || humanizedText) && (
            <button className="action-btn secondary" onClick={handleClearAll} title="Clear all text">
              Clear All
            </button>
          )}
          <button className="action-btn primary" onClick={handleHumanize} disabled={isProcessing || !inputText.trim()}>
            {isProcessing ? (
              <>
                <FaSyncAlt className="spinning" /> Humanizing...
              </>
            ) : (
              <>
                <FaMagic /> Humanize
              </>
            )}
          </button>
        </div>
      </div>

      <div className="humanizer-content">
        <div className="humanizer-main">
          <div className="input-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <FaRobot className="panel-icon" /> AI Text Input
              </h3>
              <div className="file-info">
                {uploadedFileName && (
                  <span className="file-name">
                    <FaFileAlt /> {uploadedFileName}
                  </span>
                )}
              </div>
            </div>

            <div className="text-area-container">
              <textarea
                className="text-area input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="To humanize text, enter or paste it here and press 'Humanize'"
                rows={12}
              />
              {inputText && (
                <div className="text-metrics">
                  {/* <div className="metric">
                    <span className="metric-label">AI Probability:</span>
                    <span className="metric-value ai-high">{getAIProbability(inputText)}%</span>
                  </div> */}
                  {/* <div className="metric">
                    <span className="metric-label">Readability:</span>
                    <span className="metric-value readability-low">{getReadabilityScore(inputText)}%</span>
                  </div> */}
                </div>
              )}
            </div>
          </div>

          <div className="output-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <FaUser className="panel-icon" /> Humanized Text
              </h3>
              {humanizedText && (
                <div className="output-actions">
                  <button className="action-btn small" onClick={() => handleCopy(humanizedText, "Humanized text")} title="Copy humanized text">
                    <FaCopy />
                  </button>
                  <button className="action-btn small" onClick={handleDownload} title="Download humanized text">
                    <FaDownload />
                  </button>
                </div>
              )}
            </div>

            <div className="text-area-container">
              <textarea
                className="text-area output-text"
                value={humanizedText}
                onChange={(e) => setHumanizedText(e.target.value)}
                placeholder="Humanized text will appear here..."
                rows={12}
                readOnly={!humanizedText}
              />
              {humanizedText && (
                <div className="text-metrics">
                  {/* <div className="metric">
                    <span className="metric-label">AI Probability:</span>
                    <span className="metric-value ai-low">{getAIProbability(humanizedText)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Readability:</span>
                    <span className="metric-value readability-high">{getReadabilityScore(humanizedText)}%</span>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h4>Instant Processing</h4>
            <p>Get human-like text in seconds with our advanced AI technology</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h4>Multi-language</h4>
            <p>Supports multiple languages including English, French, and Spanish</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>AI Detection</h4>
            <p>See the AI probability score before and after humanization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
