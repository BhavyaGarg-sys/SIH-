import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Clock, 
  FolderLock, 
  Bookmark, 
  Bell, 
  ShieldCheck, 
  Key, 
  Settings,
  BookOpen,
  FileSpreadsheet,
  Cpu,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Folder,
  ExternalLink,
  UploadCloud,
  Loader2
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function DashboardView({ setCurrentView }) {
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [activitySearch, setActivitySearch] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/dashboard/`);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  const handleStartCertification = async (e) => {
    e.preventDefault();
    const product = e.target.product.value;
    const role = e.target.role.value;
    if(!product) return;
    
    setIsGenerating(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/generate`, { product, role });
      if(res.data.project_id) {
         setIsGenerating(false);
         navigate(`/workspace/${res.data.project_id}`);
      }
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      alert("Failed to create workspace");
    }
  };

  const sidebarLinks = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderLock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const metricIcons = {
    standards: BookOpen,
    reports: FileSpreadsheet,
    alerts: Bell,
    api_calls: Cpu,
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const filteredActivity = dashboardData.recentActivity.filter(item =>
    item.standard.toLowerCase().includes(activitySearch.toLowerCase()) ||
    item.action.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-20">
            <div className="flex items-center gap-3 px-3 py-3 pb-4 mb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {dashboardData.user.avatar}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-900 text-sm truncate">{dashboardData.user.name}</h4>
                <p className="text-[11px] text-slate-500 truncate">{dashboardData.user.role}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeSidebarTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSidebarTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/80 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition">
                <UploadCloud className="w-4 h-4" />
                Upload Proprietary Standard
              </button>
            </div>
          </div>

          {/* Main Dashboard Canvas */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Good morning, {dashboardData.user.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Your API endpoints are healthy (99.98% uptime)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Code</span>
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-500/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Workspace</span>
                </button>
              </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">Start Certification</h2>
                      <p className="text-xs text-slate-500 mt-1">Generate a compliance roadmap for your product.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition p-2">
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleStartCertification} className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Product Name or Category</label>
                      <input 
                        name="product" 
                        placeholder="e.g. Steel Rebar, LED Bulbs, Cement" 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" 
                        required 
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Your Role</label>
                      <select name="role" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none">
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="Importer">Importer</option>
                        <option value="Foreign Manufacturer">Foreign Manufacturer</option>
                        <option value="Quality Consultant">Quality Consultant</option>
                      </select>
                    </div>
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-xl font-bold shadow-sm shadow-brand-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        {isGenerating ? 'Generating Roadmap...' : 'Create AI Workspace'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 4 Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {dashboardData.metrics.map((metric) => {
                const Icon = metricIcons[metric.id] || BookOpen;
                return (
                  <div 
                    key={metric.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-brand-300 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500">{metric.title}</span>
                      <div className={`p-1.5 rounded-lg ${metric.isWarning ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                      {metric.value}
                    </div>
                    <div className={`text-[11px] font-medium flex items-center gap-1 ${metric.isWarning ? 'text-amber-600' : 'text-slate-500'}`}>
                      {metric.trend}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-6">
              
              {/* Activity Table (Full Width) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-500" />
                    Recent Activity Feed
                  </h3>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Search className="h-3 w-3 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Filter activity..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="block w-48 pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Document</th>
                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Action Taken</th>
                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredActivity.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-slate-500 text-sm">No activity found.</td>
                        </tr>
                      ) : (
                        filteredActivity.map((row, rIdx) => (
                          <tr 
                            key={rIdx}
                            onClick={() => {
                              if (row.type === 'Workspace') window.location.href = `/workspace/${row.projectId}`;
                            }}
                            className="hover:bg-slate-50 cursor-pointer transition group"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-brand-700 group-hover:underline text-xs">
                              {row.standard}
                            </td>
                            <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate text-xs">
                              <span className="font-semibold block mb-0.5">{row.title}</span>
                              <span className="text-[11px] text-slate-500">{row.action}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {row.date}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>


            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
