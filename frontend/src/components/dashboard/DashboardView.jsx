import React, { useState } from 'react';
import { USER_DASHBOARD_DATA } from '../../data/mockData';
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
  UploadCloud
} from 'lucide-react';

export default function DashboardView({ setCurrentView }) {
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [activitySearch, setActivitySearch] = useState('');

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

  const filteredActivity = USER_DASHBOARD_DATA.recentActivity.filter(item =>
    item.standard.toLowerCase().includes(activitySearch.toLowerCase()) ||
    item.action.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Sidebar Navigation (~2.5-3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-20">
            <div className="flex items-center gap-3 px-3 py-3 pb-4 mb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {USER_DASHBOARD_DATA.user.avatar}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-900 text-sm truncate">{USER_DASHBOARD_DATA.user.name}</h4>
                <p className="text-[11px] text-slate-500 truncate">{USER_DASHBOARD_DATA.user.role}</p>
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
                      <span className="bg-amber-500 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentView('reader')}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open IS 800 Reader</span>
              </button>
            </div>
          </div>

          {/* Main Dashboard Space (~9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header Greeting & System Status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Good morning, {USER_DASHBOARD_DATA.user.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{USER_DASHBOARD_DATA.systemStatus.date}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {USER_DASHBOARD_DATA.systemStatus.healthText}
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
              {USER_DASHBOARD_DATA.metrics.map((metric) => {
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

            {/* Bottom Split Layout: Recent Activity (Left) + Saved Collections / Alerts (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Activity Table (~7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>Recent Activity</span>
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter codes..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 w-28 sm:w-36 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-500 font-bold border-b border-slate-100">
                        <th className="pb-2.5">Standard</th>
                        <th className="pb-2.5">Action</th>
                        <th className="pb-2.5">Date</th>
                        <th className="pb-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredActivity.map((row, rIdx) => (
                        <tr 
                          key={rIdx}
                          onClick={() => {
                            if (row.standard.includes('800')) setCurrentView('reader');
                            if (row.standard.includes('1893')) setCurrentView('comparison');
                          }}
                          className="hover:bg-slate-50 cursor-pointer transition group"
                        >
                          <td className="py-3 font-mono font-bold text-brand-700 group-hover:underline">
                            {row.standard}
                          </td>
                          <td className="py-3 text-slate-700 max-w-[150px] truncate">
                            {row.action}
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">
                            {row.date}
                          </td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Saved Collections & Compliance Alerts (~5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Saved Collections */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Folder className="w-4 h-4 text-brand-600" />
                      <span>Saved Collections</span>
                    </h3>
                    <button 
                      onClick={() => alert("Create New Collection modal opened.")}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      + New
                    </button>
                  </div>

                  <div className="space-y-3">
                    {USER_DASHBOARD_DATA.savedCollections.map((col) => (
                      <div
                        key={col.id}
                        onClick={() => setCurrentView('reader')}
                        className="p-3 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-slate-50/70 transition flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                            <Folder className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs group-hover:text-brand-700 transition">
                              {col.title}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {col.count} • {col.updated}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Compliance Alerts */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Real-time Compliance Alerts</span>
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  </div>

                  <div className="space-y-3">
                    {USER_DASHBOARD_DATA.complianceAlerts.map((alertItem) => (
                      <div 
                        key={alertItem.id}
                        className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                          <span>{alertItem.title}</span>
                          <span className="text-[10px] text-amber-700 font-mono font-normal">{alertItem.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {alertItem.desc}
                        </p>
                      </div>
                    ))}
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
