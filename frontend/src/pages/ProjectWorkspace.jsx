import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Loader2, FileText, Bot, User, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

import AppHeader from '../components/AppHeader';

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [project, setProject] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load project details and chat sessions
  useEffect(() => {
    if (!user || !id) return;
    
    const fetchWorkspaceData = async () => {
      try {
        const projRes = await axios.get(`http://localhost:8000/api/v1/projects/${id}`);
        setProject(projRes.data);
        
        const sessionsRes = await axios.get(`http://localhost:8000/api/v1/chat/project/${id}/sessions`);
        setSessions(sessionsRes.data);
        if(sessionsRes.data.length > 0) {
          setActiveSessionId(sessionsRes.data[0].session_id);
        }
      } catch (err) {
        console.error("Failed to load workspace", err);
      }
    };
    
    fetchWorkspaceData();
  }, [user, id]);

  // Load specific chat history when active session changes
  useEffect(() => {
    if (!activeSessionId) return;
    const fetchHistory = async () => {
      try {
        const chatRes = await axios.get(`http://localhost:8000/api/v1/chat/history/${activeSessionId}`);
        setMessages(chatRes.data);
      } catch (err) {
        console.error("Failed to fetch chat history");
      }
    };
    fetchHistory();
  }, [activeSessionId]);

  const handleNewChat = () => {
    // Math.random for a client-side UUID fallback
    const newId = 'sess_' + Math.random().toString(36).substr(2, 9);
    setActiveSessionId(newId);
    setMessages([]);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this entire workspace? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/projects/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  const toggleStep = async (stepId, currentStatus) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await axios.patch(`http://localhost:8000/api/v1/projects/${id}/checklist/${stepId}`, {
        status: newStatus
      });
      
      setProject(prev => {
        const newSteps = prev.steps.map(s => s.id === stepId ? { ...s, status: newStatus } : s);
        return { ...prev, steps: newSteps, progress_percentage: res.data.new_progress };
      });
    } catch (err) {
      console.error("Failed to update step");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setApiError(null);

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    const isNewSession = messages.length === 0;

    try {
      const response = await axios.post('http://localhost:8000/api/v1/chat/message', {
        message: userMessage.content,
        interaction_mode: "guided_ui",
        session_id: activeSessionId,
        project_id: id 
      });

      const data = response.data;
      const assistantMessage = {
        role: 'assistant',
        content: data.ai_text,
        ui_widget: data.ui_widget,
        citations: data.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // If this was a new session, refresh the sessions list to show it
      if (isNewSession) {
         const sessionsRes = await axios.get(`http://localhost:8000/api/v1/chat/project/${id}/sessions`);
         setSessions(sessionsRes.data);
      }
    } catch (error) {
      console.error("Error querying API:", error);
      setApiError(error.message || 'Failed to fetch response. Please try again.');
      setTimeout(() => setApiError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Workspace...</div>;
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '100%' }}>
      <AppHeader />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#f8fafc' }}>
        
        {/* Left Pane: Compliance Checklist */}
        <div style={{ width: '400px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{project.title}</h2>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Standard: <strong>{project.standard_id}</strong> | Scheme: {project.scheme_id}</div>
            </div>
            <button 
              onClick={handleDelete}
              style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Delete Workspace"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div style={{ background: '#f1f5f9', height: '10px', borderRadius: '5px', marginBottom: '10px', overflow: 'hidden' }}>
             <div style={{ height: '100%', width: `${project.progress_percentage}%`, background: '#10b981', transition: 'width 0.3s' }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>
              {project.progress_percentage}% Complete
            </div>
            {project.progress_percentage === 100 && (
              <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                Ready for Application 🎉
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '15px' }}>Action Items</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {project.steps.map(step => (
              <div 
                key={step.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '12px', 
                  padding: '10px 15px', 
                  background: step.status === 'COMPLETED' ? '#f0fdf4' : 'white', 
                  border: step.status === 'COMPLETED' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  borderRadius: '8px', 
                  transition: 'all 0.2s'
                }}
              >
                <div 
                  onClick={() => toggleStep(step.id, step.status)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                >
                  {step.status === 'COMPLETED' ? <CheckCircle2 color="#10b981" size={20} /> : <Circle color="#94a3b8" size={20} />}
                  <span style={{ 
                    fontSize: '14px', 
                    color: step.status === 'COMPLETED' ? '#166534' : '#334155',
                    textDecoration: step.status === 'COMPLETED' ? 'line-through' : 'none',
                    fontWeight: step.status === 'COMPLETED' ? 'normal' : '500'
                  }}>
                    {step.title}
                  </span>
                </div>
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if(!window.confirm("Delete this task?")) return;
                    try {
                      const res = await axios.delete(`http://localhost:8000/api/v1/projects/${id}/checklist/${step.id}`);
                      setProject(prev => ({
                        ...prev,
                        steps: prev.steps.filter(s => s.id !== step.id),
                        progress_percentage: res.data.new_progress
                      }));
                    } catch (err) {
                      alert("Failed to delete task");
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const title = e.target.newTask.value;
            if(!title.trim()) return;
            try {
              const res = await axios.post(`http://localhost:8000/api/v1/projects/${id}/checklist`, { title });
              setProject(prev => ({
                ...prev,
                steps: [...prev.steps, res.data.step],
                progress_percentage: res.data.new_progress
              }));
              e.target.reset();
            } catch (err) {
              alert("Failed to add task");
            }
          }}>
            <input 
              type="text" 
              name="newTask" 
              placeholder="+ Add a custom task..." 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px dashed #cbd5e1', boxSizing: 'border-box' }}
            />
          </form>
        </div>

        {/* Middle Pane: Chat Threads */}
        <div style={{ width: '250px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Chat Threads</span>
            <button 
              onClick={handleNewChat}
              style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
            >
              + New
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sessions.map(sess => (
              <div 
                key={sess.session_id}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px', 
                  borderBottom: '1px solid #e2e8f0',
                  background: activeSessionId === sess.session_id ? '#eff6ff' : 'transparent',
                  borderLeft: activeSessionId === sess.session_id ? '3px solid #2563eb' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#334155'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.querySelector('.delete-thread-btn').style.opacity = 1;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.querySelector('.delete-thread-btn').style.opacity = 0;
                }}
              >
                <div 
                  onClick={() => setActiveSessionId(sess.session_id)}
                  style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {sess.title}
                </div>
                <button
                  className="delete-thread-btn"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if(!window.confirm("Delete this thread?")) return;
                    try {
                      await axios.delete(`http://localhost:8000/api/v1/chat/session/${sess.session_id}`);
                      const sessionsRes = await axios.get(`http://localhost:8000/api/v1/chat/project/${id}/sessions`);
                      setSessions(sessionsRes.data);
                      if (activeSessionId === sess.session_id) {
                         if(sessionsRes.data.length > 0) {
                           setActiveSessionId(sessionsRes.data[0].session_id);
                         } else {
                           handleNewChat();
                         }
                      }
                    } catch (err) {
                      console.error("Failed to delete thread", err);
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0, padding: '0 0 0 10px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                No chats yet
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Dedicated AI Chat */}
        <main className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', boxShadow: 'none' }}>
          <div style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={18} color="#2563eb" /> Project AI Co-Pilot
          </div>
          
          <div className="messages-area" style={{ background: '#f8fafc' }}>
            {messages.length === 0 && (
              <div className="empty-state">
                <Bot size={48} className="empty-icon" style={{ opacity: 0.5 }} />
                <p>I am your AI assistant for this certification project.</p>
                <p>Ask me technical questions about {project.standard_id}.</p>
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
                  
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="citations-container" style={{ marginTop: '10px' }}>
                      <div className="citations-list">
                        {msg.citations.map((cit, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => {
                              // If standard is an absolute file path or filename, we append it to /pdfs
                              const filename = cit.standard.split('/').pop().split('\\').pop();
                              setPdfViewerUrl(`http://localhost:8000/pdfs/${filename}`);
                            }}
                            style={{ 
                              fontSize: '11px', 
                              background: '#e2e8f0', 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              marginRight: '5px', 
                              color: '#2563eb',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                            title={`Open ${cit.standard}`}
                          >
                            <FileText size={10} style={{ display: 'inline', marginRight: '3px' }} />
                            {cit.standard} ({cit.clause})
                          </button>
                        ))}
                      </div>
                    </div>
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
                    Analyzing standards...
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
            <form onSubmit={handleSubmit} className="input-form" style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask a question about certifying ${project.title.replace(' Certification', '')}...`}
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
          </div>
        </main>
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewerUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
            <h3 style={{ margin: 0 }}>Document Viewer</h3>
            <button onClick={() => setPdfViewerUrl(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>Close ✕</button>
          </div>
          <iframe src={pdfViewerUrl} style={{ flex: 1, width: '100%', border: 'none' }} title="PDF Viewer" />
        </div>
      )}
    </div>
  );
}
