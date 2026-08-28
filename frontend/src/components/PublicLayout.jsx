import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, Zap } from 'lucide-react';

export default function PublicLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
      {/* Navbar */}
      <header style={{ padding: '20px 40px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <ShieldCheck size={28} color="#2563eb" />
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px', letterSpacing: '-0.5px' }}>MānaK AI</h1>
        </div>
        
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Home</Link>
          <Link to="/how-it-works" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>How It Works</Link>
          <button 
            onClick={() => navigate('/login')} 
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 40px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <ShieldCheck size={24} color="#3b82f6" />
              <h2 style={{ margin: 0, color: 'white', fontSize: '20px' }}>MānaK AI</h2>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Absolute compliance resolution across the entire database of Indian Standards. Built for the SIH Hackathon MVP.
            </p>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ color: 'white', margin: '0 0 15px 0' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <Link to="/how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }}>How it Works</Link>
              <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Sign In</Link>
            </div>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ color: 'white', margin: '0 0 15px 0' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #334155', marginTop: '40px', paddingTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          © 2026 MānaK AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
