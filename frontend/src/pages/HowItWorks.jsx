import { FileText, Bot, FolderKanban, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <FileText size={32} className="text-blue-600" />,
      bg: "bg-blue-50",
      border: "border-blue-100",
      title: '1. Ingest Guidelines',
      desc: 'Our engine has processed millions of pages of BIS Standards, Act Rules, and Quality Control Orders into a searchable vector space.'
    },
    {
      icon: <Bot size={32} className="text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      title: '2. AI Co-Pilot',
      desc: 'You ask questions in natural language. The AI instantly scans the database, extracts exact clauses, and generates step-by-step roadmaps.'
    },
    {
      icon: <FolderKanban size={32} className="text-amber-600" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      title: '3. Create Workspaces',
      desc: 'Convert any compliance roadmap into a dedicated Project Workspace. Your chat history, action items, and documents are securely saved.'
    },
    {
      icon: <CheckCircle size={32} className="text-purple-600" />,
      bg: "bg-purple-50",
      border: "border-purple-100",
      title: '4. Track to Completion',
      desc: 'Use the interactive progress tracker. Complete your checklists and instantly launch the official BIS application portals.'
    }
  ];

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto w-full flex-1 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10"></div>

      <div className="text-center mb-20">
        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-full text-sm mb-6 border border-blue-100">
          The Process
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">How MānaK AI Works</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From raw legal documents to an actionable project workspace in seconds. Here is the magic under the hood.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {/* Connecting line for desktop */}
        <div className="hidden lg:block absolute top-12 left-24 right-24 h-0.5 bg-slate-200 -z-10"></div>
        
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 text-center relative hover:-translate-y-2 transition-transform duration-300">
            <div className={`w-24 h-24 mx-auto rounded-2xl flex justify-center items-center mb-8 ${step.bg} border border-white shadow-inner transform -rotate-3 hover:rotate-0 transition-transform`}>
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
