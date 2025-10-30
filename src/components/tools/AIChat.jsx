// components/tools/AIChat.jsx
import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaChevronDown, FaWifi, FaSignal, FaRobot, FaUser, FaTrash, FaMagic, FaCheck, FaCopy } from "react-icons/fa";
import { useToast } from "../../components/contexts/ToastContext";
import "./AIChat.css";

// API configuration
const API_CONFIG = {
  baseURL: 'http://192.168.1.26:9090',
  endpoints: {
    ask: '/ollama/ask'
  }
};

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(null);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  // Function to clean up AI response - remove markdown and formatting
  // Enhanced function to clean up AI response - preserve line breaks
  const cleanResponse = (text) => {
    if (!text) return text;

    return String(text)
      // Convert HTML line breaks to newlines first
      .replace(/<br\s*\/?>/gi, '\n')
      // Remove other HTML tags but preserve content
      .replace(/<[^>]*>/g, '')
      // Remove table borders and separators
      .replace(/\|[-|]+\|/g, '')
      .replace(/\|/g, ' ')
      // Remove markdown bold **text**
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove markdown italic *text* or _text_
      .replace(/(?:\*|_)(.*?)(?:\*|_)/g, '$1')
      // Remove markdown headers (# Header)
      .replace(/^#+\s+/gm, '')
      // Remove markdown links [text](url)
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Remove markdown code `code`
      .replace(/`(.*?)`/g, '$1')
      // Remove markdown blockquotes (> text)
      .replace(/^>\s+/gm, '')
      // Convert bullet points to clean format
      .replace(/^-\s+/gm, '• ')
      .replace(/^\*\s+/gm, '• ')
      // Remove horizontal rules (---, ***, ___)
      .replace(/^[-*_]{3,}$/gm, '')
      // Clean up multiple spaces (but preserve single spaces)
      .replace(/[ ]+/g, ' ')
      // Preserve intentional line breaks but remove excessive ones
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace from each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Final trim
      .trim();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test API connection on component mount
  useEffect(() => {
    testAPIConnection();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Test API connection
  const testAPIConnection = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.ask}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "test connection"
        })
      });

      if (response.ok) {
        setIsConnected(true);
        console.log('API connection successful');
      } else {
        setIsConnected(false);
        console.warn('API connection failed');
      }
    } catch (error) {
      setIsConnected(false);
      console.error('API connection error:', error);
    }
  };

  // Send message to Ollama API
  const sendToOllama = async (prompt) => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.ask}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Handle the nested response structure
      let rawResponse = "";
      if (data && typeof data === 'object') {
        if (data.response && data.response.response && data.response.response.message) {
          rawResponse = String(data.response.response.message.content);
        } else if (data.response && data.response.message) {
          rawResponse = String(data.response.message.content || data.response.message);
        } else if (data.message) {
          rawResponse = String(data.message.content || data.message);
        } else {
          rawResponse = JSON.stringify(data, null, 2);
        }
      } else if (typeof data === 'string') {
        rawResponse = data;
      } else {
        rawResponse = String(data);
      }

      // Clean the response before returning
      return cleanResponse(rawResponse);
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Failed to get response from AI: ${error.message}`);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage.trim(),
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await sendToOllama(currentInput);

      const aiMessage = {
        id: Date.now() + 1,
        content: String(aiResponse),
        sender: "ai",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);

      const fallbackResponse = `I understand you're asking about "${currentInput}". This is a fallback response because the AI service is currently unavailable. Error: ${error.message}`;

      const aiMessage = {
        id: Date.now() + 1,
        content: fallbackResponse,
        sender: "ai",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      addToast("AI service is temporarily unavailable. Using fallback mode.", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    addToast("Chat cleared", "info");
  };

  const retryConnection = async () => {
    setIsLoading(true);
    await testAPIConnection();
    setIsLoading(false);

    if (isConnected) {
      addToast("Reconnected to AI service", "success");
    } else {
      addToast("Failed to reconnect. Check your connection.", "error");
    }
  };

  const getConnectionStatusText = () => {
    if (isConnected === null) return 'Checking connection...';
    if (isConnected) return 'Online';
    return 'AI Service Offline';
  };

  // Quick prompts for the welcome screen
  const quickPrompts = [
    "Help me write a professional email",
    "Help me plan a healthy meal prep",
    "Create a workout plan for beginners",
    "Suggest some creative project ideas"
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  return (
    <div className="ai-chat-container">
      {/* Modern Header */}
      <div className="modern-chat-header">
        <div className="header-left">
          <div className="ai-avatar">
            <FaRobot className="ai-icon" />
          </div>
          <div className="header-info">
            <h1 className="app-name">AVIDIA Assistant</h1>
            <div className="connection-status-modern">
              <div className={`status-dot-modern ${isConnected === true ? 'connected' : isConnected === false ? 'disconnected' : 'checking'}`}></div>
              <span className="status-text-modern">{getConnectionStatusText()}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          {messages.length > 0 && (
            <button className="clear-btn-modern" onClick={clearChat} title="Clear chat">
              <FaTrash />
            </button>
          )}
          {!isConnected && (
            <button className="retry-btn-modern" onClick={retryConnection} disabled={isLoading}>
              Retry
            </button>
          )}
        </div>
      </div>

      <div className="chat-layout-modern">
        {/* Main Chat Area */}
        <div className="chat-main-modern">
          {/* Messages Container */}
          <div className="messages-container-modern">
            {messages.length === 0 ? (
              // Modern Welcome Screen
              <div className="modern-welcome-screen">
                <div className="welcome-hero">
                  <div className="hero-icon">
                    <FaMagic />
                  </div>
                  <h1 className="welcome-title-modern">How can I help you today?</h1>
                  <p className="welcome-subtitle">Ask anything, get instant AI-powered answers</p>

                  {/* Quick Prompts */}
                  <div className="quick-prompts-grid">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        className="quick-prompt-card"
                        onClick={() => handleQuickPrompt(prompt)}
                      >
                        <span className="prompt-text">{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Modern Messages List
              <div className="messages-list-modern">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-modern ${message.sender === 'user' ? 'user-message-modern' : 'ai-message-modern'}`}
                  >
                    <div className="message-avatar-modern">
                      {message.sender === 'user' ? (
                        <FaUser className="user-avatar-icon" />
                      ) : (
                        <FaRobot className="ai-avatar-icon" />
                      )}
                    </div>
                    <div className="message-content-modern">
                      <div className="message-bubble">
                        <div className="text-content-modern">{message.content}</div>

                        {message.sender === 'ai' && (
                          <div className="message-footer-modern">
                            <button
                              className={`copy-btn-modern ${message.copied ? 'copied' : ''}`}
                              onClick={() => {
                                navigator.clipboard.writeText(message.content);
                                addToast("AI reply copied", "success");

                                // Temporarily mark message as copied
                                setMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === message.id ? { ...m, copied: true } : m
                                  )
                                );
                                setTimeout(() => {
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === message.id ? { ...m, copied: false } : m
                                    )
                                  );
                                }, 2000);
                              }}
                            >
                              {message.copied ? (
                                <>
                                  <FaCheck className="copy-icon" /> Copied
                                </>
                              ) : (
                                <>
                                  <FaCopy className="copy-icon" /> Copy
                                </>
                              )}
                            </button>
                            <div className="message-timestamp-modern">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            
                          </div>
                        )}

                        {message.sender === 'user' && (
                          <div className="message-timestamp-modern">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}

                {/* Modern Loading Indicator */}
                {isLoading && (
                  <div className="message-modern ai-message-modern">
                    <div className="message-avatar-modern">
                      <FaRobot className="ai-avatar-icon" />
                    </div>
                    <div className="message-content-modern">
                      <div className="message-bubble">
                        <div className="typing-indicator-modern">
                          <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <span className="typing-text">AVIDIA is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Modern Input Area */}
          <div className="input-container-modern">
            <div className="input-wrapper-modern">
              <div className="input-field-modern">
                <input
                  type="text"
                  className="message-input-modern"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message AI Assistant..."
                  disabled={isLoading}
                />
                <button
                  className="send-btn-modern"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  title="Send message"
                >
                  <FaPaperPlane className="send-icon" />
                </button>
              </div>
              <div className="input-hint">
                Press Enter to send • Shift + Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}