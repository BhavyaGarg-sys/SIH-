import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, FileText, ChevronDown, ChevronUp, Bot, User, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../App.css';
import AppHeader from '../components/AppHeader';

// Simple fallback for session ID if crypto.randomUUID is unavailable
const generateId = () => {
  return window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : 'sess_' + Math.random().toString(36).substr(2, 9);
};

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [savedWidgets, setSavedWidgets] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sidebar sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [user]);

  // Load specific chat history when activeSessionId changes
  useEffect(() => {
    if (!activeSessionId || !user) return;
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/chat/history/${activeSessionId}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };
    fetchHistory();
  }, [activeSessionId, user]);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const res = await axios.get('http://localhost:8000/api/v1/chat/sessions');
      setSessions(res.data);
      if (res.data.length > 0 && !activeSessionId) {
        setActiveSessionId(res.data[0].session_id);
      } else if (!activeSessionId) {
        setActiveSessionId(generateId());
      }
    } catch (error) {
      console.error("Failed to load sessions", error);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(generateId());
    setMessages([]);
    setSavedWidgets(new Set());
  };

  const handleSaveProject = async (widgetData, index) => {
    try {
      await axios.post('http://localhost:8000/api/v1/projects', {
        title: `${widgetData.standard} Compliance`,
        standard_id: widgetData.standard,
        scheme_id: widgetData.scheme,
        initial_steps: widgetData.checklist.map(s => ({ id: s.id, title: s.title, status: 'PENDING' })),
        session_id: activeSessionId
      });
      setSavedWidgets(prev => new Set(prev).add(index));
    } catch (err) {
      console.error(err);
      alert('Failed to save project');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setApiError(null);

    // If it's the very first message of a new session, ensure activeSessionId is set
    const currentSessionId = activeSessionId || generateId();
    if (!activeSessionId) setActiveSessionId(currentSessionId);

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/chat/message', {
        message: userMessage.content,
        interaction_mode: "guided_ui",
        session_id: currentSessionId
      });

      const data = response.data;
      const assistantMessage = {
        role: 'assistant',
        content: data.ai_text,
        ui_widget: data.ui_widget,
        citations: data.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Refresh the sidebar to update titles in case this was a new chat
      fetchSessions();
      
    } catch (error) {
      console.error("Error querying API:", error);
      setApiError(error.message || 'Failed to fetch response. Please try again.');
      setTimeout(() => setApiError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div className="chat-sidebar" style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '15px' }}>
          <button 
            onClick={handleNewChat}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' }}
          >
            <Plus size={18} /> New Chat
          </button>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Recent Chats</div>
            {sessions.map(s => (
              <div 
                key={s.session_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: activeSessionId === s.session_id ? '#1e293b' : 'transparent',
                  marginBottom: '5px'
                }}
                onMouseOver={(e) => {
                  if (activeSessionId !== s.session_id) e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.querySelector('.delete-btn').style.opacity = 1;
                }}
                onMouseOut={(e) => {
                  if (activeSessionId !== s.session_id) e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.querySelector('.delete-btn').style.opacity = 0;
                }}
              >
                <div 
                  onClick={() => {
                    setActiveSessionId(s.session_id);
                    setMessages([]); // clear current view while loading
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}
                >
                  <MessageSquare size={16} color="#cbd5e1" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}
                  </span>
                </div>
                
                <button
                  className="delete-btn"
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0, padding: 0, display: 'flex', alignItems: 'center' }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if(!window.confirm("Delete this chat?")) return;
                    try {
                      await axios.delete(`http://localhost:8000/api/v1/chat/session/${s.session_id}`);
                      if (activeSessionId === s.session_id) {
                        handleNewChat();
                      } else {
                        fetchSessions();
                      }
                    } catch(err) {
                      console.error("Failed to delete chat", err);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <main className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="messages-area">
            {messages.length === 0 && (
              <div className="empty-state" style={{ marginTop: '20px' }}>
                <Bot size={48} className="empty-icon" style={{ marginBottom: '20px' }} />
                <h2 style={{ color: '#1e293b' }}>Welcome to BIS Intelligence</h2>
                <p style={{ marginBottom: '30px', color: '#64748b' }}>Select a workflow or start chatting below.</p>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  
                  {/* MSME Certification Form */}
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, color: '#2563eb', fontSize: '16px' }}>🏭 Start Certification</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Generate a compliance roadmap for your product.</p>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const product = e.target.product.value;
                      const role = e.target.role.value;
                      if(!product) return;
                      // Generate a natural language prompt that triggers the CERTIFICATION intent
                      const prompt = `I am a ${role} looking to manufacture and certify ${product} in India. Please provide the certification checklist.`;
                      setInput(prompt);
                      // Programmatically submit the main form
                      setTimeout(() => {
                        const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                        document.getElementById('main-chat-form').dispatchEvent(submitEvent);
                      }, 100);
                    }}>
                      <select name="product" required style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <option value="">Select Product...</option>
                        <option value="LED Bulbs">LED Bulbs</option>
                        <option value="Helmets">Two-Wheeler Helmets</option>
                        <option value="Smartwatches">Smartwatches</option>
                        <option value="Steel Tubes">Steel Tubes</option>
                      </select>
                      <select name="role" style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <option value="Domestic Manufacturer">Domestic Manufacturer</option>
                        <option value="Foreign Manufacturer">Foreign Manufacturer</option>
                        <option value="Importer">Importer</option>
                      </select>
                      <button type="submit" style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Generate Roadmap</button>
                    </form>
                  </div>

                  {/* Verification Form */}
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, color: '#10b981', fontSize: '16px' }}>🔍 Verify Hallmark</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Check the authenticity of a gold jewelry HUID.</p>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const huid = e.target.huid.value;
                      if(!huid) return;
                      const prompt = `I want to verify the 6-digit hallmark HUID code: ${huid}. Please pull up the verification tool.`;
                      setInput(prompt);
                      setTimeout(() => {
                        const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                        document.getElementById('main-chat-form').dispatchEvent(submitEvent);
                      }, 100);
                    }}>
                      <input type="text" name="huid" placeholder="Enter 6-digit HUID (e.g. AB1234)" maxLength={6} required style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                      <button type="submit" style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Verify Code</button>
                    </form>
                  </div>

                </div>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className="avatar">
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {msg.content}
                  </div>
                  
                  {msg.ui_widget && (
                    <div className="ui-widget-container">
                      <div className="widget-header">
                         <FileText size={16} /> 
                         Interactive Widget: {msg.ui_widget.type.replace('_', ' ')}
                      </div>
                      <div className="widget-body">
                         {msg.ui_widget.type === "COMPLIANCE_DASHBOARD" && (
                           <>
                             <h4>Scheme: {msg.ui_widget.data.scheme}</h4>
                             <p className="widget-standard">Standard: {msg.ui_widget.data.standard}</p>
                             <div className="widget-checklist">
                               {msg.ui_widget.data.checklist && msg.ui_widget.data.checklist.map((step, idx) => (
                                 <div key={idx} className="checklist-item">
                                   <input type="checkbox" /> <span>{step.title}</span>
                                 </div>
                               ))}
                             </div>
                             <button 
                               className="save-project-btn" 
                               onClick={() => handleSaveProject(msg.ui_widget.data, index)}
                               disabled={savedWidgets.has(index)}
                               style={{ backgroundColor: savedWidgets.has(index) ? '#22c55e' : '#2563eb' }}
                             >
                               {savedWidgets.has(index) ? 'Project Saved ✓' : 'Save as Project'}
                             </button>
                           </>
                         )}
                         {msg.ui_widget.type === "HALLMARK_GUIDE" && (
                           <div className="hallmark-form">
                             <p>{msg.ui_widget.data.instruction}</p>
                             <input type="text" placeholder="e.g., AB1234" maxLength="6" />
                             <button>Verify HUID</button>
                           </div>
                         )}
                      </div>
                    </div>
                  )}
                  
                  {msg.citations && msg.citations.length > 0 && (
                    <SourcesDropdown sources={msg.citations} />
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="avatar"><Bot size={20} /></div>
                <div className="message-content">
                  <div className="message-text" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Loader2 className="spinner" size={20} />
                    Processing intent...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area" style={{ borderTop: '1px solid #e2e8f0', background: 'white', position: 'relative' }}>
            {apiError && (
              <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: '#fee2e2', color: '#ef4444', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                {apiError}
              </div>
            )}
            <form onSubmit={handleSubmit} id="main-chat-form" style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center', padding: '20px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about BIS regulations, hallmarking, or standards..."
                disabled={isLoading}
                style={{ flex: 1, padding: '15px 20px', borderRadius: '24px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                style={{ background: (!input.trim() || isLoading) ? '#cbd5e1' : '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
              >
                <Send size={20} />
              </button>
            </form>
            <div className="disclaimer" style={{ padding: '0 20px 10px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
              AI-generated information for BIS Hackathon MVP. Always verify with official documents.
            </div>
          </div>
        </main>
      </div>
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
                <button 
                  onClick={() => {
                    const filename = (src.standard || src.source || "").split('/').pop().split('\\').pop();
                    window.open(`http://localhost:8000/pdfs/${filename}`, '_blank');
                  }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', padding: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', textAlign: 'left' }}
                >
                  <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {src.standard || src.source || "Unknown Document"}
                </button>
              </div>
              <div className="source-meta">
                <span>{src.clause || `Page: ${src.page}`}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

