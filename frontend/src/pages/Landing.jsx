import { useNavigate } from 'react-router-dom';
import { Search, ListChecks, FileText, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{ padding: '100px 20px', textAlign: 'center', background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '30px' }}>
            🎉 SIH 2024 Winner Prototype
          </div>
          <h1 style={{ fontSize: '64px', color: '#0f172a', margin: '0 0 24px 0', letterSpacing: '-2px', lineHeight: '1.1' }}>
            Demystifying BIS Standards with AI.
          </h1>
          <p style={{ fontSize: '22px', color: '#475569', margin: '0 auto 40px auto', lineHeight: '1.6', maxWidth: '650px' }}>
            Instantly search the Bureau of Indian Standards database, generate compliance checklists, and track your certification journey in one place.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/login')} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#2563eb', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', transition: 'background 0.2s', boxShadow: '0 4px 14px 0 rgb(37 99 235 / 39%)' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              Start Free Trial <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 20px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '36px', color: '#0f172a', margin: '0 0 16px 0', letterSpacing: '-1px' }}>Everything you need for compliance.</h2>
            <p style={{ fontSize: '18px', color: '#64748b' }}>A complete suite of tools to help manufacturers navigate the legal maze.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '50px', height: '50px', background: '#dbeafe', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                <Search size={24} color="#2563eb" />
              </div>
              <h3 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 12px 0' }}>Semantic RAG Search</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                Don't read 500-page PDFs. Just ask our AI. It instantly retrieves exact clauses and citations from official guidelines.
              </p>
            </div>
            
            <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '50px', height: '50px', background: '#dcfce7', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                <ListChecks size={24} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 12px 0' }}>Project Workspaces</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                Automatically generate customized testing and certification roadmaps. Track your progress with interactive checklists.
              </p>
            </div>
            
            <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '50px', height: '50px', background: '#fef3c7', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                <FileText size={24} color="#d97706" />
              </div>
              <h3 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 12px 0' }}>Native PDF Viewer</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                Every AI answer includes clickable citations. Open the exact official PDF directly within your workspace modal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
