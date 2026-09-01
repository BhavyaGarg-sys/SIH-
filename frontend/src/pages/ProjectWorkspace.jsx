import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReportLinkWidget from '../components/chat/widgets/ReportLinkWidget';
import ComparisonLinkWidget from '../components/chat/widgets/ComparisonLinkWidget';
import axios from 'axios';
import { Send, Loader2, FileText, Bot, User, CheckCircle2, Circle, Trash2, Plus, MessageSquare, ChevronRight, Printer, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/workspace/ShareModal';
import { Share2 } from 'lucide-react';

import { toast } from 'sonner';

const generateId = () => 'sess_' + Math.random().toString(36).substr(2, 9);

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const userRole = project?.my_role || "OWNER";
  const isViewer = userRole === "VIEWER";


  const scrollToBottom = () => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!user || !id) return;
    
    const fetchWorkspaceData = async () => {
      try {
        const projRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${id}`);
        setProject(projRes.data);
        
        const sessionsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/project/${id}/sessions`);
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

  useEffect(() => {
    if (!activeSessionId) return;
    const fetchHistory = async () => {
      try {
        const chatRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/history/${activeSessionId}`);
        setMessages(chatRes.data);
      } catch (err) {
        console.error("Failed to fetch chat history");
      }
    };
    fetchHistory();
  }, [activeSessionId]);

  const handleNewChat = () => {
    setActiveSessionId(generateId());
    setMessages([]);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this entire workspace? This cannot be undone.")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${id}`);
      toast.success("Project deleted successfully");
      navigate('/dashboard');
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  const toggleStep = async (stepId, currentStatus) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${id}/checklist/${stepId}`, {
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

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${id}`, { status: newStatus });
      setProject(prev => ({ ...prev, status: newStatus }));
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/message`, {
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

      
        if (data.ui_widget && (data.ui_widget.type === 'REPORT_LINK' || data.ui_widget.type === 'report_link') && data.ui_widget.data.report_id) {
           navigate(`/report/${data.ui_widget.data.report_id}`);
        }
        
        if (data.ui_widget && (data.ui_widget.type === 'COMPARISON_LINK' || data.ui_widget.type === 'comparison_link') && data.ui_widget.data.comparison_id) {
           navigate(`/report/${data.ui_widget.data.comparison_id}`);
        }
        
        setMessages((prev) => [...prev, assistantMessage]);

      
      if (isNewSession) {
         const sessionsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/project/${id}/sessions`);
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

  const handleExportPdf = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${id}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `roadmap_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF Exported Successfully!");
    } catch (err) {
      toast.error("Failed to export PDF");
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        <div className="text-slate-600 font-medium">Loading Workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane: Compliance Checklist */}
        <div className="hidden lg:flex w-96 bg-white border-r border-slate-200 flex-col flex-shrink-0 z-10 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{project.title}</h2>
                <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                  Standard: <span className="text-slate-800 font-bold">{project.standard_id}</span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleExportPdf}
                  className="p-1.5 text-slate-500 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-100 hidden sm:block"
                  title="Export to PDF"
                >
                  <Printer size={16} />
                </button>
                <select 
                  value={project.status || 'PLANNING'} 
                  onChange={handleStatusChange}
                  className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                    project.status === 'IN_PROGRESS' ? 'bg-brand-50 border-brand-200 text-brand-700' :
                    project.status === 'SUBMITTED' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    project.status === 'CERTIFIED' ? 'bg-green-50 border-green-200 text-green-700' :
                    project.status === 'ON_HOLD' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="PLANNING">PLANNING</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="CERTIFIED">CERTIFIED</option>
                  <option value="ON_HOLD">ON HOLD</option>
                </select>
                <button 
                  onClick={handleDelete}
                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete Workspace"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${project.progress_percentage === 100 ? 'bg-green-500' : 'bg-brand-600'}`}
                style={{ width: `${project.progress_percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm font-bold text-slate-600">
                {project.progress_percentage}% Complete
              </div>
              {project.progress_percentage === 100 && (
                <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Ready
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Action Items</h3>
            
            <div className="space-y-3 mb-6">
              {project.steps.length === 0 && (
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                   <h4 className="font-bold text-slate-700 mb-1">Checklist is empty</h4>
                   <p className="text-slate-500 text-sm">AI generates steps automatically, or add your own.</p>
                </div>
              )}
              {[...project.steps]
                .sort((a, b) => {
                  const today = new Date().toISOString().split('T')[0];
                  const aOverdue = a.status !== 'COMPLETED' && a.due_date && a.due_date < today;
                  const bOverdue = b.status !== 'COMPLETED' && b.due_date && b.due_date < today;
                  if (aOverdue && !bOverdue) return -1;
                  if (!aOverdue && bOverdue) return 1;
                  return 0;
                })
                .map(step => (
                <div 
                  key={step.id} 
                  className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all shadow-sm ${
                    step.status === 'COMPLETED' 
                      ? 'bg-green-50/50 border-green-200' 
                      : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-md'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0 cursor-pointer" onClick={() => toggleStep(step.id, step.status)}>
                    {step.status === 'COMPLETED' 
                      ? <CheckCircle2 className="text-green-500" size={20} /> 
                      : <Circle className="text-slate-300 group-hover:text-brand-400 transition-colors" size={20} />
                    }
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span 
                      className={`text-sm leading-snug transition-colors cursor-pointer ${
                        step.status === 'COMPLETED' 
                          ? 'text-green-700 line-through opacity-70' 
                          : 'text-slate-700 font-medium group-hover:text-slate-900'
                      }`}
                      onClick={() => toggleStep(step.id, step.status)}
                    >
                      {step.title}
                    </span>
                    <input 
                      type="date"
                      value={step.due_date || ''}
                      onChange={async (e) => {
                        const newDate = e.target.value;
                        try {
                          await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${id}/checklist/${step.id}`, { due_date: newDate });
                          setProject(prev => ({ ...prev, steps: prev.steps.map(s => s.id === step.id ? { ...s, due_date: newDate } : s) }));
                        } catch (err) {
                          toast.error("Failed to update date");
                        }
                      }}
                      className={`mt-1.5 text-xs px-2 py-0.5 rounded border outline-none w-max ${
                        step.status !== 'COMPLETED' && step.due_date && step.due_date < new Date().toISOString().split('T')[0]
                          ? 'bg-red-50 border-red-200 text-red-600 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    />
                  </div>
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if(!window.confirm("Delete this task?")) return;
                      try {
                        const res = await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${id}/checklist/${step.id}`);
                        setProject(prev => ({
                          ...prev,
                          steps: prev.steps.filter(s => s.id !== step.id),
                          progress_percentage: res.data.new_progress
                        }));
                      } catch (err) {
                        toast.error("Failed to delete task");
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all -m-1.5"
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
                const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${id}/checklist`, { title });
                setProject(prev => ({
                  ...prev,
                  steps: [...prev.steps, res.data.step],
                  progress_percentage: res.data.new_progress
                }));
                e.target.reset();
                toast.success("Task added");
              } catch (err) {
                toast.error("Failed to add task");
              }
            }}>
              <input 
                type="text" 
                name="newTask" 
                placeholder="+ Add a custom task..." 
                className="w-full px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-solid focus:border-brand-500 transition-all hover:bg-slate-100"
              />
            </form>
          </div>
        </div>

        {/* Middle Pane: Chat Threads */}
        <div className="hidden md:flex w-64 bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 z-0">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <span className="font-bold text-slate-800 text-sm">Chat Threads</span>
            <button 
              onClick={handleNewChat}
              className="p-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors"
              title="New Thread"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {sessions.map(sess => (
              <div 
                key={sess.session_id}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeSessionId === sess.session_id 
                    ? 'bg-brand-600 shadow-md shadow-brand-500/20' 
                    : 'hover:bg-white hover:shadow-sm border border-transparent'
                }`}
                onClick={() => setActiveSessionId(sess.session_id)}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <MessageSquare size={16} className={`flex-shrink-0 ${activeSessionId === sess.session_id ? 'text-brand-200' : 'text-slate-400 group-hover:text-brand-500 transition-colors'}`} />
                  <span className={`text-sm truncate font-medium ${activeSessionId === sess.session_id ? 'text-white' : 'text-slate-600'}`}>
                    {sess.title || 'New Discussion'}
                  </span>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if(!window.confirm("Delete this thread?")) return;
                    try {
                      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/session/${sess.session_id}`);
                      const sessionsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/project/${id}/sessions`);
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
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${activeSessionId === sess.session_id ? 'text-brand-200 hover:text-white hover:bg-brand-500' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-sm flex flex-col items-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-700 mb-1">Nothing here yet</h4>
                <p>Ask M─ünaK anything about BIS standards or certification.</p>
                <button onClick={handleNewChat} className="mt-3 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg font-medium hover:bg-brand-100 transition-colors">New Chat</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Dedicated AI Chat */}
        <main className="flex-1 flex flex-col relative bg-white min-w-0 md:min-w-[400px]">
          <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center gap-3 shadow-sm z-10 sticky top-0">
            <div className="p-2 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg text-white shadow-sm">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">Project AI Co-Pilot</h3>
              <p className="text-xs font-medium text-slate-500">Expert on {project.standard_id}</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50/50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mb-6 border border-brand-100 shadow-sm relative">
                  <Bot size={40} className="text-brand-600" />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">I'm ready to assist</h3>
                <p className="text-slate-500">Ask me any technical questions about the requirements for certifying your {project.title.replace(' Certification', '')} under standard {project.standard_id}.</p>
              </div>
            )}
            
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
              {messages.map((msg, index) => (
                  <div key={msg.id || index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white'
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
                      
                      {msg.ui_widget && (msg.ui_widget.type === 'report_link' || msg.ui_widget.type === 'REPORT_LINK') && (
                        <div className="mt-4">
                          <ReportLinkWidget data={msg.ui_widget.data} />
                        </div>
                      )}
                      
                      {msg.ui_widget && (msg.ui_widget.type === 'comparison_link' || msg.ui_widget.type === 'COMPARISON_LINK') && (
                        <div className="mt-4">
                          <ComparisonLinkWidget data={msg.ui_widget.data} />
                        </div>
                      )}
                    </div>
                    
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {msg.citations.map((cit, idx) => (
                          <div key={idx} className="flex items-center bg-brand-50 border border-brand-200 rounded-full overflow-hidden shadow-sm group">
                            <button 
                              onClick={() => {
                                const filename = cit.standard.split('/').pop().split('\\').pop();
                                setPdfViewerUrl(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:8000'}/pdfs/${filename}`);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
                              title={`Open ${cit.standard}`}
                            >
                              <FileText size={12} className="group-hover:scale-110 transition-transform" />
                              <span className="truncate max-w-[150px]">{cit.standard}</span>
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/bookmarks`, {
                                    standard_ref: cit.standard,
                                    clause_text: cit.clause || cit.snippet || "Relevant section",
                                    pdf_path: cit.standard,
                                    page_number: cit.page ? parseInt(cit.page) : null
                                  });
                                  toast.success("Standard saved to Bookmarks!");
                                } catch(err) {
                                  toast.error("Failed to save bookmark");
                                }
                              }}
                              className="px-2 py-1.5 border-l border-brand-200 text-brand-400 hover:bg-brand-100 hover:text-brand-600 transition-colors"
                              title="Bookmark this standard"
                            >
                              <Bookmark size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Bot size={22} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3 text-slate-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm font-medium">Analyzing standard {project.standard_id}...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-4 relative z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            {apiError && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {apiError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-center shadow-sm border border-slate-200 rounded-2xl bg-white focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all overflow-hidden p-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask a question about certifying ${project.title.replace(' Certification', '')}...`}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder-slate-400 disabled:opacity-50"
                autoComplete="off"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:bg-slate-100 disabled:text-slate-400 transition-colors ml-2 flex-shrink-0"
              >
                <Send size={18} className={input.trim() && !isLoading ? 'ml-0.5' : ''} />
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewerUrl && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[1000] flex flex-col p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl px-6 py-4 flex justify-between items-center shadow-lg mx-auto w-full max-w-6xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 text-brand-400 rounded-lg">
                <FileText size={20} />
              </div>
              <h3 className="m-0 text-white font-bold text-lg">Document Viewer</h3>
            </div>
            <button 
              onClick={() => setPdfViewerUrl(null)} 
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              Close Γ£ò
            </button>
          </div>
          <div className="flex-1 bg-white mx-auto w-full max-w-6xl rounded-b-2xl overflow-hidden shadow-2xl border-x border-b border-slate-800">
            <iframe src={pdfViewerUrl} className="w-full h-full border-none" title="PDF Viewer" />
          </div>
        </div>
      )}

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        projectId={id}
        currentUserId={user?.id}
      />
    </div>
  );
}
