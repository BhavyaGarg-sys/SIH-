import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function PublicLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-blue-200 selection:text-blue-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="m-0 text-slate-900 text-2xl font-bold tracking-tight">MānaK AI</h1>
        </div>
        
        <nav className="flex gap-6 items-center">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Home
          </Link>
          <Link 
            to="/how-it-works" 
            className={`text-sm font-semibold transition-colors ${location.pathname === '/how-it-works' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            How It Works
          </Link>
          <button 
            onClick={() => navigate('/login')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md ml-2"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-8">
          <div className="flex-1 max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
              <h2 className="m-0 text-white text-2xl font-bold tracking-tight">MānaK AI</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Absolute compliance resolution across the entire database of Indian Standards. Built for the SIH Hackathon MVP.
            </p>
          </div>
          
          <div className="flex gap-16 md:gap-24">
            <div>
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <div className="flex flex-col gap-4 text-sm">
                <Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <div className="flex flex-col gap-4 text-sm">
                <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
                <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div>© {new Date().getFullYear()} MānaK AI. All rights reserved.</div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
            <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
