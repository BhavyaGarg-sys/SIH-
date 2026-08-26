import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, FileText, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/query', {
        query: input,
        top_k: 4,
      });

      const data = response.data;
      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error querying API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message || 'Failed to fetch response. Make sure backend is running.'}`,
          isError: true
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 BIS Document QA Assistant</h1>
        <p>Ask questions about Bureau of Indian Standards technical documents.</p>
      </header>

      <main className="chat-container">
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-state">
              <Bot size={48} className="empty-icon" />
              <h2>How can I help you today?</h2>
              <p>Try asking about specific BIS standards, clauses, or compliance requirements.</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {msg.isError ? (
                    <span className="error-text">{msg.content}</span>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <SourcesDropdown sources={msg.sources} />
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <Loader2 className="spinner" size={20} />
                  <span>Searching standards & generating answer...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What is the acceptable limit for pH in drinking water?"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </main>
    </div>
  );
}

function SourcesDropdown({ sources }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sources-container">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="sources-toggle"
      >
        <FileText size={16} />
        <span>View {sources.length} Sources</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isOpen && (
        <div className="sources-list">
          {sources.map((src, idx) => (
            <div key={idx} className="source-item">
              <div className="source-header">
                <strong>Source {idx + 1}:</strong> {src.source || "Unknown Document"}
              </div>
              <div className="source-meta">
                <span>Page: {src.page || "?"}</span>
                <span>Relevance: {(src.score || 0).toFixed(4)}</span>
              </div>
              {src.chunk_id && (
                <div className="source-chunk">ID: {src.chunk_id}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
