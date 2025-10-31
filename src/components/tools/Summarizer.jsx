// components/tools/Summarizer.jsx
import { useState, useRef } from "react";
import { 
  FaUpload, 
  FaDownload, 
  FaCopy, 
  FaSyncAlt, 
  FaFileAlt,
  FaCompress,
  FaChartBar
} from "react-icons/fa";
import { useToast } from "../../components/contexts/ToastContext";
import "./Summarizer.css";

export default function Summarizer() {
  const [inputText, setInputText] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMode, setSelectedMode] = useState("paragraph");
  const [summaryLength, setSummaryLength] = useState("short");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [summaryStats, setSummaryStats] = useState({
    summaryWordCount: 0,
    originalWordCount: 0,
    model: "",
    timestamp: ""
  });
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  // Summary modes
  const summaryModes = [
    { value: "paragraph", label: "Paragraph" },
    { value: "bullet", label: "Bullet Points" },
    { value: "custom", label: "Custom" }
  ];

  // Summary lengths
  const summaryLengths = [
    { value: "short", label: "Short" },
    { value: "long", label: "Long" }
  ];

  // API Integration for Summarization
  const handleSummarize = async () => {
    if (!inputText.trim()) {
      addToast("Please enter text to summarize", "warning");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("http://192.168.1.13:9090/ai-summarizing/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputText
          // Removed options object since API doesn't seem to use it based on your example
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      
      // Handle the API response structure
      if (data.summary) {
        setSummarizedText(data.summary);
        setSummaryStats({
          summaryWordCount: data.summaryWordCount || 0,
          originalWordCount: data.originalWordCount || 0,
          model: data.model || "",
          timestamp: data.timestamp || ""
        });
        addToast("Text summarized successfully!", "success");
      } else {
        throw new Error("No summary found in response");
      }
    } catch (error) {
      console.error("Summarization error:", error);
      addToast("Summarization failed. Please try again.", "error");
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
    if (!summarizedText.trim()) return;

    const blob = new Blob([
      `Original Text (${getWordCount(inputText)} words):\n${inputText}\n\n` +
      `Summary (${summaryStats.summaryWordCount} words):\n${summarizedText}\n\n` +
      `Reduction: ${getReductionPercentage(inputText, summarizedText)}%\n` +
      `Model: ${summaryStats.model || 'N/A'}\n` +
      `Generated: ${summaryStats.timestamp ? new Date(summaryStats.timestamp).toLocaleString() : 'N/A'}`
    ], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
    addToast("Summary downloaded", "success");
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
    setSummarizedText("");
    setUploadedFileName("");
    setSummaryStats({
      summaryWordCount: 0,
      originalWordCount: 0,
      model: "",
      timestamp: ""
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    addToast("All text cleared", "info");
  };

  const getWordCount = (text) => {
    return text.trim() ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  const getSentenceCount = (text) => {
    return text.trim() ? text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length : 0;
  };

  const getReductionPercentage = (original, summary) => {
    if (!original.trim() || !summary.trim()) return 0;
    const originalWords = getWordCount(original);
    const summaryWords = getWordCount(summary);
    const reduction = ((originalWords - summaryWords) / originalWords) * 100;
    return Math.max(0, Math.round(reduction));
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="summarizer-container">
      <div className="summarizer-header">
        <div className="header-content">
          <div className="header-icon">
            <FaCompress />
          </div>
          <div className="header-text">
            <h1 className="summarizer-title">AVIDIA Summarizer</h1>
            <p className="summarizer-subtitle">Condense long text into key points quickly</p>
          </div>
        </div>
        <div className="options-panel">
          <div className="option-group">
            <label htmlFor="summary-mode">Mode:</label>
            <select 
              id="summary-mode"
              value={selectedMode} 
              onChange={(e) => setSelectedMode(e.target.value)}
              className="mode-select"
            >
              {summaryModes.map(mode => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="option-group">
            <label htmlFor="summary-length">Summary Length:</label>
            <select 
              id="summary-length"
              value={summaryLength} 
              onChange={(e) => setSummaryLength(e.target.value)}
              className="length-select"
            >
              {summaryLengths.map(length => (
                <option key={length.value} value={length.value}>
                  {length.label}
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
              <FaUpload /> Upload Doc
            </button>
            {uploadedFileName && (
              <div className="file-info">
                <FaFileAlt /> {uploadedFileName}
              </div>
            )}
          </div> */}
        </div>
        <div className="header-actions">
          {(inputText || summarizedText) && (
            <button className="action-btn secondary" onClick={handleClearAll} title="Clear all text">
              Clear All
            </button>
          )}
          <button className="action-btn primary" onClick={handleSummarize} disabled={isProcessing || !inputText.trim()}>
            {isProcessing ? (
              <>
                <FaSyncAlt className="spinning" /> Summarizing...
              </>
            ) : (
              <>
                <FaCompress /> Summarize
              </>
            )}
          </button>
        </div>
      </div>

      <div className="summarizer-content">
        <div className="summarizer-main">
          <div className="input-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <FaFileAlt className="panel-icon" /> Paste Text
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
                placeholder="Paste your text here to summarize it..."
                rows={10}
              />
              {inputText && (
                <div className="text-metrics">
                  <div className="metric">
                    <span className="metric-label">Sentences:</span>
                    <span className="metric-value sentence-count">{getSentenceCount(inputText)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Words:</span>
                    <span className="metric-value word-count">{getWordCount(inputText)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="output-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <FaCompress className="panel-icon" /> Summary
              </h3>
              {summarizedText && (
                <div className="panel-actions">
                  <button 
                    className="action-btn small" 
                    onClick={() => handleCopy(summarizedText, "Summary")} 
                    title="Copy summary"
                  >
                    <FaCopy />
                  </button>
                  <button 
                    className="action-btn small" 
                    onClick={handleDownload} 
                    title="Download summary"
                  >
                    <FaDownload />
                  </button>
                </div>
              )}
            </div>

            <div className="text-area-container">
              <textarea
                className="text-area output-text"
                value={summarizedText}
                onChange={(e) => setSummarizedText(e.target.value)}
                placeholder="Your summary will appear here..."
                rows={10}
                readOnly={!summarizedText}
              />
              {summarizedText && (
                <div className="text-metrics">
                  {/* <div className="metric">
                    <span className="metric-label">Reduction:</span>
                    <span className="metric-value reduction-high">
                      {getReductionPercentage(inputText, summarizedText)}%
                    </span>
                  </div> */}
                  <div className="metric">
                    <span className="metric-label">Summary Words:</span>
                    <span className="metric-value summary-word-count">
                      {summaryStats.summaryWordCount || getWordCount(summarizedText)}
                    </span>
                  </div>
                  {/* {summaryStats.model && (
                    <div className="metric">
                      <span className="metric-label">Model:</span>
                      <span className="metric-value model-info">{summaryStats.model}</span>
                    </div>
                  )} */}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h4>Multiple Formats</h4>
            <p>Get summaries in paragraph form, bullet points, or custom formats</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Length Control</h4>
            <p>Choose between short concise summaries or more detailed long versions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Quick Processing</h4>
            <p>Generate accurate summaries in seconds with advanced AI technology</p>
          </div>
        </div>
      </div>
    </div>
  );
}