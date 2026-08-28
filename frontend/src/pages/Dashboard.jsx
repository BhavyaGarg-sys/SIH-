import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, FolderKanban, CheckCircle, Loader2, Rocket } from 'lucide-react';
import './Dashboard.css';

import AppHeader from '../components/AppHeader';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [user, navigate]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/projects');
      setProjects(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartCertification = async (e) => {
    e.preventDefault();
    const product = e.target.product.value;
    const role = e.target.role.value;
    if(!product) return;
    
    setIsGenerating(true);
    try {
      const res = await axios.post('http://localhost:8000/api/v1/projects/generate', { product, role });
      if(res.data.project_id) {
         navigate(`/project/${res.data.project_id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create workspace");
      setIsGenerating(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main className="dashboard-content" style={{ display: 'flex', gap: '30px', padding: '30px 40px', flex: 1 }}>
        
        {/* Left Side: Create New Workspace */}
        <div style={{ flex: '0 0 350px', background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
           <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <PlusCircle size={20} color="#2563eb" /> Create Workspace
           </h2>
           <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Generate a new compliance project workspace.</p>
           
           <form onSubmit={handleStartCertification}>
             <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Product Category</label>
             <select name="product" required style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
               <option value="">Select Product...</option>
               <option value="LED Bulbs">LED Bulbs</option>
               <option value="Helmets">Two-Wheeler Helmets</option>
               <option value="Smartwatches">Smartwatches</option>
               <option value="Steel Tubes">Steel Tubes</option>
             </select>
             
             <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Your Role</label>
             <select name="role" style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
               <option value="Domestic Manufacturer">Domestic Manufacturer</option>
               <option value="Foreign Manufacturer">Foreign Manufacturer</option>
               <option value="Importer">Importer</option>
             </select>
             
             <button type="submit" disabled={isGenerating} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
               {isGenerating ? <Loader2 className="spinner" size={18} /> : <Rocket size={18} />} 
               {isGenerating ? 'Generating Workspace...' : 'Start Certification'}
             </button>
           </form>
        </div>

        {/* Right Side: Active Workspaces */}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
            <FolderKanban size={24} color="#1e293b" /> Your Active Workspaces
          </h2>
          
          {projects.length === 0 ? (
            <div className="empty-projects" style={{ background: 'white', padding: '60px 40px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px auto' }}>
                <FolderKanban size={28} color="#94a3b8" />
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>No Active Workspaces</h3>
              <p style={{ color: '#64748b', margin: 0 }}>Use the form on the left to generate your first compliance roadmap.</p>
            </div>
          ) : (
            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {projects.map((proj) => (
                <div 
                  key={proj.project_id} 
                  className="project-card" 
                  onClick={() => navigate(`/project/${proj.project_id}`)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: 'white' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <h3 style={{ color: '#2563eb', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderKanban size={18} /> {proj.title}
                  </h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#475569' }}><strong>Standard:</strong> {proj.standard_id}</p>
                  <div className="progress-bar-container" style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden', margin: '0 0 8px 0' }}>
                    <div className="progress-bar" style={{ width: `${proj.progress_percentage}%`, background: '#10b981', height: '100%', transition: 'width 0.3s' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="progress-text" style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 'bold' }}>{proj.progress_percentage}% Complete</p>
                    {proj.progress_percentage === 100 && <CheckCircle size={14} color="#10b981" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
