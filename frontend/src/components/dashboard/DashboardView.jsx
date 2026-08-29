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

export default function DashboardView({ setCurrentView }) {
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [activitySearch, setActivitySearch] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/dashboard/');
        setDashboardData(response.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recent', label: 'Recent Documents', icon: Clock },
    { id: 'collections', label: 'Collections', icon: FolderLock },
    { id: 'summaries', label: 'Saved Summaries', icon: Bookmark },
    { id: 'alerts', label: 'Alerts & Updates', icon: Bell, badge: '5' },
    { id: 'checker', label: 'Compliance Checker', icon: ShieldCheck },
    { id: 'api', label: 'API Keys', icon: Key },
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
                  onClick={() => setCurrentView('comparison')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-500/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Research</span>
                </button>
              </div>
            </div>

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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Activity Table (2 Cols) */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
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

              {/* Sidebar Modules (1 Col) */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* Saved Collections */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FolderLock className="w-4 h-4 text-slate-400" />
                      Saved Collections
                    </h3>
                    <button className="text-[10px] font-bold text-brand-600 hover:text-brand-700 px-2 py-1 rounded bg-brand-50">
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-slate-50/70 transition flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          <Folder className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs group-hover:text-brand-700 transition">
                            Seismic Design Pack
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            3 Codes • Today
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </div>

                {/* Compliance Alerts */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-slate-900 text-sm">Regulatory Alerts</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>IS 1893 Part 1 Amendment</span>
                        <span className="text-[10px] text-amber-700 font-mono font-normal">Pending</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Draft amendment regarding torsional irregularity is currently under public review.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
