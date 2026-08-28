import { FileText, Bot, FolderKanban, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <FileText size={40} color="#2563eb" />,
      title: '1. Ingest Guidelines',
      desc: 'Our engine has processed millions of pages of BIS Standards, Act Rules, and Quality Control Orders into a searchable vector space.'
    },
    {
      icon: <Bot size={40} color="#10b981" />,
      title: '2. AI Co-Pilot',
      desc: 'You ask questions in natural language. The AI instantly scans the database, extracts exact clauses, and generates step-by-step roadmaps.'
    },
    {
      icon: <FolderKanban size={40} color="#f59e0b" />,
      title: '3. Create Workspaces',
      desc: 'Convert any compliance roadmap into a dedicated Project Workspace. Your chat history, action items, and documents are securely saved.'
    },
    {
      icon: <CheckCircle size={40} color="#8b5cf6" />,
      title: '4. Track to Completion',
      desc: 'Use the interactive progress tracker. Complete your checklists and instantly launch the official BIS application portals.'
    }
  ];

  return (
    <div style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto', flex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '48px', color: '#0f172a', margin: '0 0 20px 0', letterSpacing: '-1px' }}>How MānaK AI Works</h1>
        <p style={{ fontSize: '20px', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          From raw legal documents to an actionable project workspace in seconds. Here is the magic under the hood.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', position: 'relative' }}>
        {steps.map((step, idx) => (
          <div key={idx} style={{ background: 'white', padding: '40px 30px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              {step.icon}
            </div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '20px' }}>{step.title}</h3>
            <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
