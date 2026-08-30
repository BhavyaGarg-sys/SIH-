import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Users, UserPlus, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareModal({ isOpen, onClose, projectId, currentUserId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EDITOR');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${projectId}/collaborators`);
      setMembers(res.data);
    } catch (err) {
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    try {
      setInviting(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${projectId}/collaborators`, {
        email: inviteEmail,
        role: inviteRole
      });
      setMembers([...members, res.data.member]);
      setInviteEmail('');
      toast.success('Collaborator added!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add collaborator');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (targetId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${projectId}/collaborators/${targetId}`);
      setMembers(members.filter(m => m.user_id !== targetId));
      toast.success('Collaborator removed');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove collaborator');
    }
  };

  const handleChangeRole = async (targetId, newRole) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/${projectId}/collaborators/${targetId}`, {
        role: newRole
      });
      setMembers(members.map(m => m.user_id === targetId ? { ...m, role: newRole } : m));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update role');
    }
  };

  if (!isOpen) return null;

  // Determine if the current user is OWNER
  const currentUserMember = members.find(m => m.user_id === currentUserId) || {};
  // For backwards compatibility, if no one is explicitly OWNER in the array yet (due to legacy), we just assume OWNER if they can see it. But the backend handles it.
  const isOwner = currentUserMember.role === 'OWNER' || members.length === 0;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Share Workspace
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Invite Form */}
          {isOwner ? (
            <form onSubmit={handleInvite} className="mb-6 flex gap-2">
              <input 
                type="email" 
                placeholder="colleague@example.com" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                required
              />
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="text-sm px-2 py-2 border border-slate-200 rounded-lg outline-none cursor-pointer"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button 
                type="submit"
                disabled={inviting || !inviteEmail}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Invite
              </button>
            </form>
          ) : (
            <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                You are a <b>{currentUserMember.role}</b> in this workspace. Only the Owner can invite new members or change roles.
              </p>
            </div>
          )}

          {/* Members List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Collaborators</h3>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {member.email.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {member.email} {member.user_id === currentUserId && <span className="text-slate-400 font-normal">(You)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Joined {new Date(member.added_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isOwner && member.role !== 'OWNER' && member.user_id !== currentUserId ? (
                        <select 
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.user_id, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded-md outline-none cursor-pointer"
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          member.role === 'OWNER' ? 'bg-amber-100 text-amber-700' :
                          member.role === 'EDITOR' ? 'bg-brand-50 text-brand-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {member.role}
                        </span>
                      )}
                      
                      {isOwner && member.role !== 'OWNER' && member.user_id !== currentUserId && (
                        <button 
                          onClick={() => handleRemove(member.user_id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition ml-1"
                          title="Remove Access"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
