import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, FolderKanban, CheckCircle, Loader2, Rocket, Clock, ArrowRight, Copy } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showProfileBanner, setShowProfileBanner] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProjects();
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/auth/profile');
      setProfile(response.data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const data = {
      company_name: e.target.company.value,
      industry_sector: e.target.sector.value,
      state: e.target.state.value
    };
    try {
      await axios.patch('http://localhost:8000/api/v1/auth/profile', data);
      toast.success("Profile updated!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/v1/projects');
      setProjects(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
         toast.success("Workspace created!");
         navigate(`/project/${res.data.project_id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create workspace");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {profile && !profile.profile_complete && showProfileBanner && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-amber-800">Complete your profile</h3>
              <p className="text-sm text-amber-700 mt-1 mb-3">Add your industry details to get personalized compliance answers from MānaK AI.</p>
              <form className="flex flex-wrap gap-3 items-end" onSubmit={handleProfileSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Company</label>
                  <input name="company" className="px-3 py-1.5 border border-amber-200 rounded-lg text-sm focus:ring-amber-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Sector</label>
                  <select name="sector" className="px-3 py-1.5 border border-amber-200 rounded-lg text-sm bg-white focus:ring-amber-500 outline-none" required>
                    <option value="">Select...</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Import/Export">Import/Export</option>
                    <option value="MSME">MSME</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Startup">Startup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">State</label>
                  <input name="state" className="px-3 py-1.5 border border-amber-200 rounded-lg text-sm focus:ring-amber-500 outline-none" required />
                </div>
                <button type="submit" className="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">Save</button>
              </form>
            </div>
            <button onClick={() => setShowProfileBanner(false)} className="text-amber-600 hover:text-amber-800 p-1 font-bold text-xl leading-none">&times;</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

        
        {/* Left Side: Create New Workspace */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <PlusCircle size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">New Workspace</h2>
            </div>
            <p className="text-slate-500 text-sm mb-8">Generate a personalized compliance roadmap for your product.</p>
            
            <form onSubmit={handleStartCertification} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Category</label>
                <div className="relative">
                  <select 
                    name="product" 
                    required 
                    className="block w-full pl-4 pr-10 py-3 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select a product...</option>
                    <option value="LED Bulbs">LED Bulbs</option>
                    <option value="Helmets">Two-Wheeler Helmets</option>
                    <option value="Smartwatches">Smartwatches</option>
                    <option value="Steel Tubes">Steel Tubes</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Role</label>
                <div className="relative">
                  <select 
                    name="role" 
                    className="block w-full pl-4 pr-10 py-3 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Domestic Manufacturer">Domestic Manufacturer</option>
                    <option value="Foreign Manufacturer">Foreign Manufacturer</option>
                    <option value="Importer">Importer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isGenerating} 
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />} 
                {isGenerating ? 'Generating...' : 'Start Certification'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Active Workspaces */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <FolderKanban className="text-slate-700" size={28} /> 
              Active Workspaces
            </h2>
            <div className="text-sm font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-200 shadow-sm">
               <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex justify-center items-center mb-4">
                <FolderKanban className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Workspaces</h3>
              <p className="text-slate-500 max-w-sm">Use the form to generate your first compliance roadmap and start tracking your certification journey.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div 
                  key={proj.project_id} 
                  onClick={() => navigate(`/project/${proj.project_id}`)}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent -z-10 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 pr-4">
                      {proj.title}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        proj.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        proj.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                        proj.status === 'CERTIFIED' ? 'bg-green-100 text-green-700' :
                        proj.status === 'ON_HOLD' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {proj.status ? proj.status.replace('_', ' ') : 'PLANNING'}
                      </span>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res = await axios.post(`http://localhost:8000/api/v1/projects/${proj.project_id}/duplicate`);
                            toast.success("Workspace duplicated!");
                            navigate(`/project/${res.data.project_id}`);
                          } catch (err) {
                            toast.error("Failed to duplicate workspace");
                          }
                        }}
                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicate Workspace"
                      >
                        <Copy size={16} />
                      </button>
                      <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
                    <div className="px-2.5 py-1 bg-slate-100 rounded-md font-medium font-mono text-xs">
                      {proj.standard_id}
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Updated recently
                    </span>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">Progress</span>
                      <span className="text-sm font-bold text-blue-600">{proj.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${proj.progress_percentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: `${proj.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
