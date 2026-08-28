import { useNavigate } from 'react-router-dom';
import { Search, ListChecks, FileText, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:py-40 text-center bg-gradient-to-b from-slate-50 to-blue-50 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-4xl mx-auto z-10 relative">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm border border-blue-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            🎉 SIH 2024 Winner Prototype
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Demystifying BIS Standards <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">with AI</span>.
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Instantly search the Bureau of Indian Standards database, generate compliance checklists, and track your certification journey in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/login')} 
              className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Start Free Trial 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/how-it-works')} 
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-sm w-full sm:w-auto"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything you need for compliance.</h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">A complete suite of tools to help manufacturers navigate the legal maze.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex justify-center items-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                <Search className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Semantic RAG Search</h3>
              <p className="text-slate-600 leading-relaxed">
                Don't read 500-page PDFs. Just ask our AI. It instantly retrieves exact clauses and citations from official guidelines.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-green-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex justify-center items-center mb-6 group-hover:scale-110 group-hover:bg-green-600 transition-all duration-300">
                <ListChecks className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Project Workspaces</h3>
              <p className="text-slate-600 leading-relaxed">
                Automatically generate customized testing and certification roadmaps. Track your progress with interactive checklists.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex justify-center items-center mb-6 group-hover:scale-110 group-hover:bg-amber-600 transition-all duration-300">
                <FileText className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Native PDF Viewer</h3>
              <p className="text-slate-600 leading-relaxed">
                Every AI answer includes clickable citations. Open the exact official PDF directly within your workspace modal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Metrics Section */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="flex justify-center mb-4"><ShieldCheck className="w-10 h-10 text-blue-400" /></div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-slate-400">BIS Standards Indexed</div>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4"><Zap className="w-10 h-10 text-yellow-400" /></div>
              <div className="text-4xl font-bold mb-2">&lt; 2s</div>
              <div className="text-slate-400">Average Response Time</div>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4"><Search className="w-10 h-10 text-green-400" /></div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-slate-400">Retrieval Accuracy</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
