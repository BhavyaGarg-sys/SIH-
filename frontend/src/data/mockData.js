export const TRUSTED_ORGANIZATIONS = [
  { name: "Ministry of Commerce & Industry", category: "Govt. of India", icon: "Landmark" },
  { name: "NITI Aayog", category: "National Policy", icon: "Building2" },
  { name: "IIT Delhi", category: "Academic Research", icon: "GraduationCap" },
  { name: "Tata Steel", category: "Heavy Industry", icon: "Factory" },
  { name: "Reliance Industries", category: "Energy & Infrastructure", icon: "ShieldCheck" },
  { name: "L&T Construction", category: "EPC & Civil", icon: "HardHat" }
];

export const FEATURES = [
  {
    id: "ai-search",
    icon: "Search",
    title: "AI-Powered Search",
    description: "Perform advanced semantic queries on raw tables, clauses, and obscure annexures. Find intent, not just keyword matches.",
    tag: "Vector NLP",
    accent: "from-blue-500/10 to-indigo-500/10"
  },
  {
    id: "doc-intel",
    icon: "FileText",
    title: "Document Intelligence",
    description: "Instantly parse complex standard PDFs. Extract equations, grade variables, and technical conditions in plain English.",
    tag: "OCR & AST",
    accent: "from-cyan-500/10 to-blue-500/10"
  },
  {
    id: "cross-ref",
    icon: "Network",
    title: "Cross-Reference Engine",
    description: "Trace regulatory dependency trees across thousands of documents. See which standards amend, supersede, or citation-link each other.",
    tag: "Graph Neural",
    accent: "from-indigo-500/10 to-purple-500/10"
  },
  {
    id: "compliance",
    icon: "ShieldCheck",
    title: "Compliance Checker",
    description: "Upload technical sheets or material blueprints to verify total alignment against active BIS safety and testing guidelines.",
    tag: "Automated Audit",
    accent: "from-emerald-500/10 to-teal-500/10"
  }
];

export const WORKFLOW_STEPS = [
  {
    step: "01",
    name: "Search",
    title: "Semantic Discovery",
    description: "Type natural questions, standard numbers, or key steel grades into our semantic search engine with multi-lingual parsing."
  },
  {
    step: "02",
    name: "Analyze",
    title: "Contextual Extraction",
    description: "Our models map references, extract tables, and summarize contextual engineering requirements on-the-fly."
  },
  {
    step: "03",
    name: "Verify",
    title: "Deterministic Validation",
    description: "Ensure active standing, check cross-references, and confirm testing methodologies with absolute regulatory clarity."
  }
];

export const STATS = [
  { value: "20,000+", label: "Standards Tracked", sub: "Live BIS & ISO mapping" },
  { value: "500+", label: "Industries Mapped", sub: "Civil, Metallurgical, Chemical" },
  { value: "99.7%", label: "AI Answer Accuracy", sub: "Deterministic citation backing" },
  { value: "50ms", label: "Query Latency", sub: "Edge-accelerated vector index" }
];

export const TESTIMONIALS = [
  {
    quote: "BIS Intelligence saved us weeks of engineering compliance checks. Finding the exact cross-reference between seismic codes used to be manual scavenger hunts.",
    author: "Rajesh Kumar",
    role: "Head of Infrastructure, Delhi Metro Rail Corp",
    avatar: "RK",
    badge: "Public Infrastructure"
  },
  {
    quote: "The semantic AI analysis of grade variations in steel was incredibly accurate. This tool is a fundamental upgrade for building compliance in India.",
    author: "Dr. Ananya Sen",
    role: "Principal Structural Consultant & Bureau Advisor",
    avatar: "AS",
    badge: "Structural Eng."
  }
];

export const PRICING_TIERS = [
  {
    name: "Basic Search",
    target: "For individual researchers & students",
    priceMonthly: 0,
    priceAnnual: 0,
    period: "forever",
    popular: false,
    cta: "Start Free Research",
    features: [
      "10 semantic searches / day",
      "Standard active code status checker",
      "Basic document viewer & table reader",
      "Community support forum access",
      "Public standard summaries"
    ]
  },
  {
    name: "Professional",
    target: "For compliance experts & civil consultants",
    priceMonthly: 4999,
    priceAnnual: 3999,
    period: "per month",
    popular: true,
    badge: "MOST POPULAR",
    cta: "Start 14-Day Pro Trial",
    features: [
      "Unlimited semantic searches & queries",
      "Deep Cross-Reference Dependency Map",
      "AI Clause summaries & formula explainer",
      "Excel / CSV table extractors & export",
      "Comparative Synthesis Studio (Diff engine)",
      "Priority email & technical support"
    ]
  },
  {
    name: "Enterprise",
    target: "For complete industrial firms & EPC agencies",
    priceMonthly: null,
    priceAnnual: null,
    priceCustom: "Custom",
    period: "tailored billing",
    popular: false,
    cta: "Schedule Enterprise Demo",
    features: [
      "Full programmatic REST & GraphQL API",
      "Dedicated technical architect support",
      "Upload & verify private internal specs",
      "SSO / SAML 2.0 team login & audit logs",
      "Custom on-premise vector deployment",
      "99.99% SLA guaranteed uptime"
    ]
  }
];

export const COMPARISON_REPORT = {
  query: "Compare earthquake resistance requirements between IS 1893:2016 and IS 13920:2016",
  status: "SYNTHESIS REPORT",
  executionTime: "1.4s",
  title: "Comparative Analysis: Earthquake Resistance Standards",
  subtitle: "Cross-code regulatory synthesis between design loading and ductile detailing criteria.",
  executiveSummary: "This report provides a granular comparison of seismic parameters and detailing instructions outlined in IS 1893 (Part 1):2016 [1] (load calculations and zone structures) and IS 13920:2016 [2] (ductile construction specifications for RC members). Together, they form the core regulatory framework governing earthquake safety in severe seismic zones across India. Understanding the hand-shake between design forces and structural reinforcement details is crucial for high-rise compliance.",
  differences: [
    {
      aspect: "Primary Scope & Mandate",
      code1: "Seismic design force criteria, zone mapping (Zone II to V), and dynamic building loads calculation [1].",
      code2: "Ductile design, detailing rules, and spatial limits for concrete structural frames & shear walls [2].",
      delta: "IS 1893 specifies 'Loads & Forces', IS 13920 mandates 'Member Detailing'."
    },
    {
      aspect: "Ductility & Response Factors",
      code1: "Prescribes general Response Reduction Factors (R = 3 to 5) to modify elastic seismic forces based on framing type.",
      code2: "Enforces micro-detailing rules (closely spaced hoops, joint constraints, minimum confining steel) to achieve the assumed R-factor.",
      delta: "Direct coupling: You cannot use R=5 without IS 13920 compliance."
    },
    {
      aspect: "Member Dimension Limits",
      code1: "Defines minimum lateral stiffness limits and inter-storey drift ratio <= 0.004 h.",
      code2: "Mandates minimum column width >= 300mm (or 20x dia of largest longitudinal bar in beam) and beam width/depth ratio >= 0.3.",
      delta: "IS 13920 introduces stringent physical geometry minimums."
    },
    {
      aspect: "Beam-Column Joint Shear",
      code1: "Recommends general performance evaluation of lateral load resisting moment frames.",
      code2: "Mandates strong-column weak-beam ratio: sum of design moment resistances of columns >= 1.4x sum of beams.",
      delta: "IS 13920 establishes explicit 1.4x capacity design inequality."
    }
  ],
  citingSources: [
    {
      id: "1",
      code: "IS 1893 (Pt 1): 2016",
      title: "Criteria for Earthquake Resistant Design of Structures - General Provisions & Buildings",
      relevance: 99,
      category: "Seismic Design",
      status: "Active"
    },
    {
      id: "2",
      code: "IS 13920: 2016",
      title: "Ductile Detailing of Reinforced Concrete Structures Subjected to Seismic Forces",
      relevance: 98,
      category: "Ductile Detailing",
      status: "Active"
    },
    {
      id: "3",
      code: "IS 456: 2000",
      title: "Plain and Reinforced Concrete — Code of Practice (Fourth Revision)",
      relevance: 94,
      category: "Structural Concrete",
      status: "Active"
    },
    {
      id: "4",
      code: "SP 16: 1980",
      title: "Design Aids for Reinforced Concrete to IS: 456-1978 Handbook",
      relevance: 72,
      category: "Design Handbook",
      status: "Special Pub."
    }
  ],
  followUpQuestions: [
    "What are the Response Reduction factors (R) for ductile RC shear walls?",
    "How does IS 13920 define a weak-beam strong-column ratio?",
    "What are the minimum confining hoop spacing rules in high seismic Zone V?",
    "Can Grade Fe 550D steel be used in seismic ductile detailing under IS 13920?"
  ]
};

export const USER_DASHBOARD_DATA = {
  user: {
    name: "Dr. Sharma",
    role: "Chief Compliance Officer & Structural Fellow",
    avatar: "DS",
    institution: "National Infrastructure Advisory"
  },
  systemStatus: {
    date: "Tuesday, March 12, 2026",
    healthText: "Your API endpoints are healthy (99.98% uptime)",
    activeNode: "ap-south-1 (Mumbai Gateway)"
  },
  metrics: [
    {
      id: "standards",
      title: "Standards Accessed",
      value: "1,247",
      trend: "+24 codes this week",
      trendPositive: true,
      icon: "BookOpen"
    },
    {
      id: "reports",
      title: "Research Reports",
      value: "38",
      trend: "4 active workspaces",
      trendPositive: true,
      icon: "FileSpreadsheet"
    },
    {
      id: "alerts",
      title: "Active Alerts",
      value: "5",
      trend: "2 pending amendments",
      trendPositive: false,
      isWarning: true,
      icon: "BellRing"
    },
    {
      id: "api_calls",
      title: "API Calls",
      value: "12.4K",
      trend: "Last 30 days summary",
      trendPositive: true,
      icon: "Cpu"
    }
  ],
  recentActivity: [
    {
      standard: "IS 800:2007",
      title: "General Construction in Steel",
      action: "Viewed seismic provisions & tensile table",
      date: "Today, 10:24 AM",
      status: "Active",
      type: "Steel & Metallurgy"
    },
    {
      standard: "IS 1893:2016",
      title: "Earthquake Design Criteria",
      action: "Compared with IS 13920 ductile detailing",
      date: "Yesterday",
      status: "Active",
      type: "Civil & Seismic"
    },
    {
      standard: "IS 456:2000",
      title: "Plain & Reinforced Concrete",
      action: "Downloaded concrete grade spec sheet",
      date: "Mar 10, 2026",
      status: "Active",
      type: "Structural"
    },
    {
      standard: "SP 16:1980",
      title: "Design Aids Handbook",
      action: "Copied steel reinforcement chart",
      date: "Mar 08, 2026",
      status: "Active",
      type: "Handbook"
    },
    {
      standard: "IS 13920:2016",
      title: "Ductile Detailing of RC",
      action: "Generated AI cross-comparison summary",
      date: "Mar 05, 2026",
      status: "Active",
      type: "Structural"
    }
  ],
  savedCollections: [
    {
      id: "col-1",
      title: "Structural Steel Standards",
      count: "24 Items",
      updated: "Updated 2 days ago",
      tag: "Civil Infra",
      color: "blue"
    },
    {
      id: "col-2",
      title: "Earthquake Resistance Codes",
      count: "18 Items",
      updated: "Updated 5 hours ago",
      tag: "Seismic Safety",
      color: "emerald"
    },
    {
      id: "col-3",
      title: "Quality Management Manuals",
      count: "31 Items",
      updated: "Updated 1 week ago",
      tag: "QA / Audit",
      color: "indigo"
    }
  ],
  complianceAlerts: [
    {
      id: "alt-1",
      title: "Draft Amendment 3 to IS 1893:2016",
      desc: "Proposed modifications to zone factor map in Himalayan tectonic zones.",
      date: "Issued 3 days ago",
      severity: "high"
    },
    {
      id: "alt-2",
      title: "IS 800 Section 12 Detailing Update",
      desc: "Clarification on hot-rolled beam-to-column bolted moment connections.",
      date: "Issued 1 week ago",
      severity: "medium"
    }
  ]
};

export const STANDARD_DETAIL = {
  code: "IS 800:2007",
  status: "Active Standard",
  title: "General Construction in Steel — Code of Practice",
  subtitle: "Third Revision (Published Dec 2007, Reaffirmed 2022)",
  breadcrumbs: ["Home", "Standards", "Civil Engineering", "IS 800:2007"],
  metadata: {
    pages: "135 Pages",
    division: "Structural Engineering",
    icsNo: "77.140.10",
    committee: "CED 7 (Structural Engineering and Structural Sections)"
  },
  toc: [
    { id: "s1", label: "1. Scope", clauses: 3 },
    { id: "s2", label: "2. References & Normative Standards", clauses: 12 },
    { id: "s3", label: "3. Terms, Symbols & Definitions", clauses: 24 },
    { id: "s4", label: "4. General Material Requirements", clauses: 8, active: true },
    { id: "s5", label: "5. Design of Tension Members", clauses: 15 },
    { id: "s6", label: "6. Design of Compression Members", clauses: 22 },
    { id: "s7", label: "7. Design of Flexural Members", clauses: 18 },
    { id: "s8", label: "8. Connections & Detailing", clauses: 31 }
  ],
  activeSection: {
    number: "4.",
    heading: "General Material Requirements",
    lead: "All structural steel sections, plates, and other components used in design configurations shall conform strictly to the mechanical properties listed under standard grade criteria. For earthquake-resistant structures (designs within seismic zones III, IV, and V), plastic design capacity requires distinct yield-to-ultimate stress differentials.",
    table: {
      title: "TABLE 1 : TENSILE PROPERTIES OF STRUCTURAL STEEL GRADES",
      caption: "Mechanical properties and elongation limits conforming to IS 2062 Grade Specifications",
      headers: ["Grade Designation", "Min. Yield Stress (fy)", "Ultimate Tensile (fu)", "Min. Elongation %"],
      rows: [
        { grade: "Fe 410", fy: "250 MPa", fu: "410 MPa", el: "23%" },
        { grade: "Fe 440", fy: "290 MPa", fu: "440 MPa", el: "21%" },
        { grade: "Fe 490", fy: "350 MPa", fu: "490 MPa", el: "20%" },
        { grade: "Fe 540", fy: "410 MPa", fu: "540 MPa", el: "18%" }
      ]
    },
    clauseNote: "As referenced in Clause 2.2.1.1, structural members that are designed to absorb seismic energy through plastic deformation must utilize grade structures matching or exceeding the structural bounds of Fe 410."
  },
  aiCopilot: {
    question: "What is the minimum yield stress for Fe 490?",
    response: "According to Clause 2.2.1 Table 1, the minimum yield stress (fy) for grade Fe 490 is 350 MPa for member thicknesses under 20mm, with an ultimate tensile strength (fu) of 490 MPa and 20% minimum elongation.",
    citationLink: "View Clause 2.2.1 Table 1"
  },
  relatedCodes: [
    { code: "IS 1893", name: "Earthquake resistant design criteria", relation: "Cross-referenced in Section 12" },
    { code: "IS 13920", name: "Ductile concrete frame detailing", relation: "Composite interface code" },
    { code: "IS 456", name: "Plain & reinforced concrete code", relation: "Composite foundations" }
  ]
};

export const DESIGN_SYSTEM_TOKENS = {
  colors: [
    { name: "Navy Primary", hex: "#0A192F", text: "text-white", bg: "bg-[#0A192F]", desc: "Hero, dark bars & heavy contrast" },
    { name: "Blue Brand", hex: "#2563EB", text: "text-white", bg: "bg-[#2563EB]", desc: "Primary actions, accents & links" },
    { name: "Electric Cyan", hex: "#06B6D4", text: "text-slate-900", bg: "bg-[#06B6D4]", desc: "AI syntheses & glowing vectors" },
    { name: "Slate Dark", hex: "#1E293B", text: "text-white", bg: "bg-[#1E293B]", desc: "Secondary cards & dark panels" },
    { name: "Slate Light", hex: "#64748B", text: "text-white", bg: "bg-[#64748B]", desc: "Muted borders & meta text" },
    { name: "Success Green", hex: "#10B981", text: "text-white", bg: "bg-[#10B981]", desc: "Active & verified standards" },
    { name: "Warning Amber", hex: "#F59E0B", text: "text-slate-900", bg: "bg-[#F59E0B]", desc: "Superseded or draft revisions" },
    { name: "Danger Red", hex: "#EF4444", text: "text-white", bg: "bg-[#EF4444]", desc: "Withdrawn or non-compliant" }
  ],
  typography: [
    { level: "Display (48px)", size: "text-3xl md:text-5xl font-extrabold tracking-tight", text: "BIS Code AI Search Studio" },
    { level: "H1 Heading (32px)", size: "text-2xl md:text-3xl font-bold tracking-tight", text: "Structural Integrity Standards" },
    { level: "H2 Subheading (24px)", size: "text-xl md:text-2xl font-semibold", text: "IS 800 Steel Detailing Protocols" },
    { level: "Body Large (16px)", size: "text-base text-slate-700 font-normal", text: "Ductile Detailing of Earthquake Resistant Structures" },
    { level: "Body Regular (14px)", size: "text-sm text-slate-600 font-normal", text: "Perform advanced semantic queries on raw tables, formulas, and annexures." },
    { level: "Caption / Mono (12px)", size: "text-xs font-mono uppercase tracking-wider text-slate-500", text: "UPDATED 5 HOURS AGO • REVISED 2026" }
  ],
  badges: [
    { label: "Active Code", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Superseded", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Withdrawn", color: "bg-rose-50 text-rose-700 border-rose-200" },
    { label: "Civil / Structural", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Special Pub.", color: "bg-purple-50 text-purple-700 border-purple-200" }
  ]
};
