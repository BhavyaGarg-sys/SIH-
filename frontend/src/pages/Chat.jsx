import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, FileText, ChevronDown, ChevronUp, Bot, User, Plus, MessageSquare, Trash2, ArrowRight, ShieldCheck, HelpCircle, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';
import { toast } from 'sonner';
import { openProtectedPdf } from '../utils/openProtectedPdf';

const generateId = () => {
  return window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : 'sess_' + Math.random().toString(36).substr(2, 9);
};

const SUGGESTIONS = {
  CERTIFICATION: ["What documents do I need?", "How long does this take?", "Which labs can test this?"],
  VERIFICATION:  ["Check another product", "What does this mark mean?", "Show me the QCO"],
  GENERAL:       ["Is there a QCO for this?", "Which BIS scheme applies?", "Find related standards"],
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
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    fetchSessions();
  }, [user]);

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
      toast.success('Project saved to your Workspaces!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save project');
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    setApiError(null);
    const currentSessionId = activeSessionId || generateId();
    if (!activeSessionId) setActiveSessionId(currentSessionId);

    const userMessage = { role: 'user', content: messageText };
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
        intent: data.intent
      };

      setMessages((prev) => [...prev, assistantMessage]);
      fetchSessions();
    } catch (error) {
      console.error("Error querying API:", error);
      setApiError(error.message || 'Failed to fetch response. Please try again.');
      setTimeout(() => setApiError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-4">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus size={18} /> New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2 mt-2">Recent Chats</div>
            {sessions.map(s => (
              <div 
                key={s.session_id}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeSessionId === s.session_id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                }`}
                onClick={() => {
                  if (activeSessionId !== s.session_id) {
                    setActiveSessionId(s.session_id);
                    setMessages([]);
                  }
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <MessageSquare size={16} className={activeSessionId === s.session_id ? 'text-blue-400' : 'text-slate-500'} />
                  <span className={`text-sm truncate ${activeSessionId === s.session_id ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {s.title || 'New Conversation'}
                  </span>
                </div>
                
                <button
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-700"
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
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative bg-white">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center px-4">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                  <Bot size={40} className="text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">How can I help you today?</h2>
                <p className="text-slate-500 mb-10 max-w-md">I can help you navigate BIS standards, generate compliance roadmaps, or verify hallmarking details.</p>
                
                <div className="grid md:grid-cols-2 gap-4 w-full">
                  {/* Option 1 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left cursor-pointer group"
                    onClick={() => {
                      setInput("I am a Domestic Manufacturer looking to certify LED Bulbs in India. Please provide the certification checklist.");
                      document.getElementById('chat-input').focus();
                    }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ShieldCheck size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-800">Start Certification</h3>
                    </div>
                    <p className="text-sm text-slate-500">Generate a compliance roadmap for a new product.</p>
                  </div>
                  
                  {/* Option 2 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all text-left cursor-pointer group"
                    onClick={() => {
                      setInput("I want to verify the 6-digit hallmark HUID code: AB1234. Please pull up the verification tool.");
                      document.getElementById('chat-input').focus();
                    }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <HelpCircle size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-800">Verify Hallmark</h3>
                    </div>
                    <p className="text-sm text-slate-500">Check the authenticity of a gold jewelry HUID.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="max-w-4xl mx-auto space-y-6 pb-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-600 text-white shadow-sm'
                  }`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={22} />}
                  </div>
                  
                  <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                    </div>
                    
                    {msg.ui_widget && (
                      <div className="w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2 font-semibold text-slate-700 text-sm">
                          <FileText size={16} className="text-blue-600" /> 
                          Interactive Widget: {msg.ui_widget.type.replace('_', ' ')}
                        </div>
                        <div className="p-5">
                          {msg.ui_widget.type === "COMPLIANCE_DASHBOARD" && (
                            <div>
                              <h4 className="font-bold text-slate-900 mb-1">Scheme: {msg.ui_widget.data.scheme}</h4>
                              <p className="text-sm text-blue-600 font-medium mb-4">Standard: {msg.ui_widget.data.standard}</p>
                              <div className="space-y-2 mb-5">
                                {msg.ui_widget.data.checklist && msg.ui_widget.data.checklist.map((step, idx) => (
                                  <label key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" /> 
                                    <span className="text-sm text-slate-700">{step.title}</span>
                                  </label>
                                ))}
                              </div>
                              <button 
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all text-white ${
                                  savedWidgets.has(index) ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                                onClick={() => handleSaveProject(msg.ui_widget.data, index)}
                                disabled={savedWidgets.has(index)}
                              >
                                {savedWidgets.has(index) ? 'Project Saved ✓' : 'Save to Workspaces'}
                              </button>
                            </div>
                          )}
                          {msg.ui_widget.type === "HALLMARK_GUIDE" && (
                            <div className="space-y-4">
                              <p className="text-slate-700">{msg.ui_widget.data.instruction}</p>
                              <div className="flex gap-2">
                                <input type="text" placeholder="e.g., AB1234" maxLength="6" className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase font-mono tracking-widest" />
                                <button className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">Verify HUID</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {msg.citations && msg.citations.length > 0 && (
                      <SourcesDropdown sources={msg.citations} />
                    )}
                    
                    {msg.role === 'assistant' && msg.intent && SUGGESTIONS[msg.intent] && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {SUGGESTIONS[msg.intent].map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(suggestion)}
                            className="text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Bot size={22} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3 text-slate-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm font-medium">Analyzing documents...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-4 relative">
            {apiError && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {apiError}
              </div>
            )}
            
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} id="main-chat-form" className="relative flex items-center shadow-sm border border-slate-200 rounded-2xl bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden p-1.5">
                <input
                  id="chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about BIS regulations, hallmarking, or standards..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder-slate-400 disabled:opacity-50"
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-colors ml-2 flex-shrink-0"
                >
                  <Send size={18} className={input.trim() && !isLoading ? 'ml-0.5' : ''} />
                </button>
              </form>
              <div className="text-center mt-3 text-xs text-slate-400">
                AI-generated information for BIS Hackathon MVP. Always verify with official documents.
              </div>
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
    <div className="w-full mt-1">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <FileText size={14} className="text-blue-500" />
        <span>View {sources.length} Sources</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      
      {isOpen && (
        <div className="mt-2 space-y-2">
          {sources.map((src, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 border-l-2 border-l-blue-500 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="mb-1 flex justify-between items-start">
                <button 
                  onClick={() => openProtectedPdf(src.standard || src.source).catch(() => toast.error('Failed to open source document.'))}
                  className="text-left font-semibold text-blue-700 hover:text-blue-800 hover:underline flex items-start gap-1.5 text-sm"
                >
                  <FileText size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{src.standard || src.source || "Unknown Document"}</span>
                </button>
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await axios.post('http://localhost:8000/api/v1/bookmarks', {
                        standard_ref: src.standard || src.source || "Unknown Document",
                        clause_text: src.clause || src.snippet || "Relevant section",
                        pdf_path: src.standard || src.source,
                        page_number: src.page ? parseInt(src.page) : null
                      });
                      toast.success("Standard saved to Bookmarks!");
                    } catch(err) {
                      toast.error("Failed to save bookmark");
                    }
                  }}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  title="Bookmark this standard"
                >
                  <Bookmark size={14} />
                </button>
              </div>
              <div className="flex gap-3 text-xs text-slate-500 font-medium ml-5">
                <span>{src.clause || `Page: ${src.page}`}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
