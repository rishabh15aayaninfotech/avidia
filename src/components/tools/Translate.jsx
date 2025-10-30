// components/tools/Translate.jsx
import { useState, useRef } from "react";
import { FaExchangeAlt, FaCopy, FaVolumeUp, FaDownload, FaLanguage, FaSyncAlt, FaTrash } from "react-icons/fa";
import { useToast } from "../../components/contexts/ToastContext";
import "./Translate.css";

export default function Translate() {
    const [sourceText, setSourceText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [sourceLang, setSourceLang] = useState("auto");
    const [targetLang, setTargetLang] = useState("en");
    const [isTranslating, setIsTranslating] = useState(false);
    const sourceTextareaRef = useRef(null);
    const translatedTextareaRef = useRef(null);
    const { addToast } = useToast();

    // Supported languages
    const languages = [
        { code: "auto", name: "Auto Detect" },
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "it", name: "Italian" },
        { code: "pt", name: "Portuguese" },
        { code: "ru", name: "Russian" },
        { code: "zh", name: "Chinese" },
        { code: "ja", name: "Japanese" },
        { code: "ko", name: "Korean" },
        { code: "ar", name: "Arabic" },
        { code: "hi", name: "Hindi" },
        { code: "bn", name: "Bengali" },
        { code: "tr", name: "Turkish" },
        { code: "nl", name: "Dutch" },
        { code: "pl", name: "Polish" },
        { code: "uk", name: "Ukrainian" },
    ];

    // Quick translation examples
    const quickExamples = [
        "Hello, how are you today?",
        "I would like to book a hotel room",
        "What time does the museum open?",
        "Could you recommend a good restaurant?",
        "Where is the nearest pharmacy?"
    ];

    // ✅ Integrated Translation API
    const handleTranslate = async () => {
        if (!sourceText.trim()) {
            addToast("Please enter text to translate", "warning");
            return;
        }

        setIsTranslating(true);

        try {
            const response = await fetch("http://192.168.1.26:9090/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: sourceText,
                    targetLang: languages.find(l => l.code === targetLang)?.name || targetLang,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const translated = data?.response?.message?.content || "Translation not available.";
            setTranslatedText(translated);
            addToast("Translation completed", "success");
        } catch (error) {
            console.error("Translation error:", error);
            addToast("Translation failed. Please try again.", "error");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleClearAll = () => {
        setSourceText("");
        setTranslatedText("");
        addToast("Text cleared", "info");
    };

    const handleClearSource = () => {
        setSourceText("");
        addToast("Source text cleared", "info");
    };

    const handleClearTranslation = () => {
        setTranslatedText("");
        addToast("Translation cleared", "info");
    };

    const handleSwapLanguages = () => {
        if (sourceLang !== "auto") {
            setSourceLang(targetLang);
        }
        setTargetLang(sourceLang === "auto" ? "en" : sourceLang);

        if (sourceText && translatedText) {
            setSourceText(translatedText);
            setTranslatedText(sourceText);
        }
    };

    const handleCopyText = (text, type) => {
        if (!text.trim()) return;

        navigator.clipboard.writeText(text)
            .then(() => {
                addToast(`${type} copied to clipboard`, "success");
            })
            .catch(() => {
                addToast("Failed to copy text", "error");
            });
    };

    const handleSpeakText = (text, type) => {
        if (!text.trim() || !('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        window.speechSynthesis.speak(utterance);
        addToast(`Playing ${type} audio`, "info");
    };

    const handleDownloadTranslation = () => {
        if (!translatedText.trim()) return;

        const blob = new Blob([`Source: ${sourceText}\n\nTranslation: ${translatedText}`], {
            type: 'text/plain;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'translation.txt';
        a.click();
        URL.revokeObjectURL(url);
        addToast("Translation downloaded", "success");
    };

    const handleQuickExample = (example) => {
        setSourceText(example);
    };

    const handleKeyPress = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleTranslate();
        }
    };

    const getCharacterCount = (text) => {
        return text.length;
    };

    const getWordCount = (text) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    return (
        <div className="translate-container">
            {/* Header */}
            <div className="translate-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FaLanguage />
                    </div>
                    <div className="header-text">
                        <h1 className="translate-title">AVIDIA Translator</h1>
                        <p className="translate-subtitle">Translate text between 100+ languages instantly</p>
                    </div>
                </div>
                <div className="header-actions">
                    {(sourceText || translatedText) && (
                        <button 
                            className="action-btn secondary"
                            onClick={handleClearAll}
                            title="Clear all text"
                        >
                            <FaTrash />
                            Clear All
                        </button>
                    )}
                    <button 
                        className="action-btn primary"
                        onClick={handleTranslate}
                        disabled={isTranslating || !sourceText.trim()}
                    >
                        {isTranslating ? (
                            <>
                                <FaSyncAlt className="spinning" />
                                Translating...
                            </>
                        ) : (
                            <>
                                <FaLanguage />
                                Translate
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="translate-content">
                {/* Language Selection */}
                <div className="language-selection">
                    <div className="language-input">
                        <label className="language-label">From</label>
                        <select
                            className="language-select"
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="swap-btn"
                        onClick={handleSwapLanguages}
                        title="Swap languages"
                    >
                        <FaExchangeAlt />
                    </button>

                    <div className="language-input">
                        <label className="language-label">To</label>
                        <select
                            className="language-select"
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                        >
                            {languages.filter(lang => lang.code !== "auto").map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Translation Area */}
                <div className="translation-area">
                    {/* Source Text Area */}
                    <div className="text-area-container">
                        <div className="text-area-header">
                            <span className="text-area-title">
                                {sourceLang === "auto" ? "Source Text" : languages.find(l => l.code === sourceLang)?.name}
                            </span>
                            <div className="text-stats">
                                <span>{getWordCount(sourceText)} words</span>
                                <span>{getCharacterCount(sourceText)} chars</span>
                            </div>
                        </div>
                        <div className="text-area-wrapper">
                            <textarea
                                ref={sourceTextareaRef}
                                className="text-area source-text"
                                value={sourceText}
                                onChange={(e) => setSourceText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Enter text to translate..."
                                rows={8}
                            />
                            {sourceText && (
                                <div className="text-actions">
                                    <button className="text-action-btn" onClick={handleClearSource} title="Clear source text">
                                        <FaTrash />
                                    </button>
                                    <button className="text-action-btn" onClick={() => handleCopyText(sourceText, "Source text")} title="Copy text">
                                        <FaCopy />
                                    </button>
                                    <button className="text-action-btn" onClick={() => handleSpeakText(sourceText, "source")} title="Listen to text">
                                        <FaVolumeUp />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Translated Text Area */}
                    <div className="text-area-container">
                        <div className="text-area-header">
                            <span className="text-area-title">
                                {languages.find(l => l.code === targetLang)?.name}
                            </span>
                            <div className="text-stats">
                                <span>{getWordCount(translatedText)} words</span>
                                <span>{getCharacterCount(translatedText)} chars</span>
                            </div>
                        </div>
                        <div className="text-area-wrapper">
                            <textarea
                                ref={translatedTextareaRef}
                                className="text-area translated-text"
                                value={translatedText}
                                onChange={(e) => setTranslatedText(e.target.value)}
                                placeholder="Translation will appear here..."
                                rows={8}
                                readOnly
                            />
                            {translatedText && (
                                <div className="text-actions">
                                    <button className="text-action-btn" onClick={handleClearTranslation} title="Clear translation">
                                        <FaTrash />
                                    </button>
                                    <button className="text-action-btn" onClick={() => handleCopyText(translatedText, "Translation")} title="Copy translation">
                                        <FaCopy />
                                    </button>
                                    <button className="text-action-btn" onClick={() => handleSpeakText(translatedText, "translation")} title="Listen to translation">
                                        <FaVolumeUp />
                                    </button>
                                    <button className="text-action-btn" onClick={handleDownloadTranslation} title="Download translation">
                                        <FaDownload />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Examples */}
                {!sourceText && (
                    <div className="quick-examples">
                        <h3 className="examples-title">Try these examples:</h3>
                        <div className="examples-grid">
                            {quickExamples.map((example, index) => (
                                <button key={index} className="example-chip" onClick={() => handleQuickExample(example)}>
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shortcut Hint */}
                <div className="shortcut-hint">
                    <span>💡 Pro tip: Press Ctrl + Enter to translate instantly</span>
                </div>
            </div>
        </div>
    );
}
