import type { WorkExperience, ConsultingEngagement, Project, Certification, Award, Education } from '../types'

export const workExperience: WorkExperience[] = [
  {
    id: 'merkle-dentsu',
    company: 'Merkle',
    companyDescription: 'Dentsu Group — global digital experience agency',
    role: 'Senior Software Engineer',
    period: 'April 2025 – Present',
    location: 'Remote',
    current: true,
    bullets: [
      'Rebuilding the web platform for Leading Hotels of the World (LHW) from the ground up — new codebase, fresh UX, expanded feature set. Sole engineer responsible for the full technical stack while other engineers focused on single domains.',
      'Architected the frontend in Next.js and TypeScript on a Contentful CMS — multilingual support, component architecture, and automated content authoring workflows.',
      'Integrated a multi-system backend across AWS AppSync, a property management system (PMS), and SynXis for real-time pricing and availability data.',
      'Designed Cloudinary-based Digital Asset Management workflows with Contentful content delivery, deployed on Vercel.',
      'Owned GTM implementation and full analytics instrumentation alongside frontend and backend delivery.',
      'Selected as part of a small global group identifying AI agent use-cases across the software development lifecycle.',
    ],
  },
  {
    id: 'tech-mahindra-microsoft',
    company: 'Tech Mahindra',
    companyDescription: 'Microsoft — Bing Ads platform',
    role: 'Senior Software Engineer',
    period: 'September 2023 – March 2025',
    location: 'Remote',
    bullets: [
      'Worked on the React frontend for risk and enforcement modules within Microsoft\'s Bing Ads platform — a large-scale, high-traffic adtech system serving millions of advertisers globally.',
      'Cut first-load time by 40% through strategic code-splitting and lazy loading.',
      'Reduced CI pipeline build times by 20% through build configuration improvements.',
      'Introduced Husky pre-commit hooks and full TypeScript coverage for the Redux layer, enforcing type safety across the team codebase.',
    ],
  },
  {
    id: 'pwc',
    company: 'PwC India',
    companyDescription: 'Global professional services firm',
    role: 'Technology Consultant',
    period: 'September 2021 – September 2023',
    location: 'Remote',
    bullets: [
      'Led frontend development across D2C, B2C, and B2B e-commerce platforms for a major Indian retail conglomerate, and a suite of government digitization projects.',
      'Led a team delivering Next.js storefronts with device-specific experiences across web and mobile.',
      'Built and shipped cross-platform iOS and Android apps using React Native.',
      'Designed an optimistic update strategy for cart interactions, eliminating concurrency bugs and enabling real-time cross-device sync.',
      'Engineered a custom NextAuth.js integration to meet enterprise authentication requirements.',
      'Mentored four junior engineers and served as primary technical liaison with senior stakeholders.',
    ],
  },
  {
    id: 'infosys',
    company: 'Infosys',
    companyDescription: 'Global IT services firm',
    role: 'System Engineer',
    period: 'November 2020 – August 2021',
    location: 'Hybrid',
    bullets: [
      'Developed automation scripts for the Finacle Treasury banking platform.',
    ],
  },
]

export const consultingEngagements: ConsultingEngagement[] = [
  {
    id: 'wohana',
    client: 'Wohana',
    clientDescription: 'Early-stage startup digitizing the rental market in Vienna, Austria',
    location: 'Vienna, Austria (Remote)',
    period: 'October 2024 – Present',
    ongoing: true,
    bullets: [
      'Sole technical owner — responsible for system design, implementation, and end-to-end delivery.',
      'Integrated Sproof e-signature workflows to enable legally binding digital tenancy contracts across jurisdictions.',
      'Built document handling pipelines and automated contract generation from scratch.',
    ],
  },
  {
    id: 'raisematters',
    client: 'RaiseMatters',
    clientDescription: 'Defence sector technology consultancy',
    location: 'Remote',
    period: 'September 2023 – July 2024',
    ongoing: false,
    bullets: [
      'Built fullstack products for defence industry clients operating in low-connectivity field environments.',
      'Engineered an offline-first PWA using IndexedDB for local storage with background sync to a Node.js/MySQL backend — ensuring zero data loss during network intermittency.',
      'Built live system monitoring dashboards and digitized field form-capture workflows for mission-critical operations.',
    ],
  },
]

export const projects: Project[] = [
  {
    id: 'moebius',
    name: 'Moebius',
    description: 'AI-powered project historian for codebases. An MCP server + VS Code extension that generates versioned, queryable documentation by observing file changes and AI chat sessions in real time. Captures not just what changed but why — using the prompts developers already write. Built on MCP protocol before it was widely adopted.',
    githubUrl: 'https://github.com/Manku27',
    tech: ['Node.js', 'MCP', 'VS Code Extension API', 'TypeScript'],
  },
  {
    id: 'pk-chai',
    name: 'PK Chai',
    description: 'Ordering system for a Kolkata eatery handling midnight delivery across 4 college hostels. Mobile-first admin panel with 30-minute slot batching and hostel-block grouping. Real users, real revenue.',
    url: 'https://pk-chai.vercel.app/',
    tech: ['Next.js', 'Neon DB', 'Tailwind CSS'],
  },
  {
    id: 'vishuddha-comics',
    name: 'Vishuddha Comics',
    description: 'A free, frictionless platform for discovering comics — built because it needed to exist. Not monetized. Not trying to be. This is a value made into a product: the platform I would have wanted to find.',
    url: 'https://vishuddha-comics.vercel.app/',
    tech: ['Next.js', 'Neon', 'Cloudinary'],
  },
  {
    id: 'eslint-plugin-redux-tsc',
    name: 'eslint-plugin-redux-tsc',
    description: 'Enforces typed Redux hooks for IntelliSense and type safety across a codebase.',
    url: 'https://www.npmjs.com/package/eslint-plugin-redux-tsc',
    tech: ['ESLint', 'TypeScript', 'Node.js'],
    highlights: ['250+ downloads'],
  },
  {
    id: 'eslint-plugin-contentful-migrations',
    name: 'eslint-plugin-contentful-migrations',
    description: 'Enforces GraphQL resolver annotations on Contentful + Cloudinary migration scripts.',
    url: 'https://www.npmjs.com/package/eslint-plugin-contentful-migrations',
    tech: ['ESLint', 'TypeScript'],
    highlights: ['75+ downloads'],
  },
  {
    id: 'hotel-reception-ocr',
    name: 'Hotel Reception OCR',
    description: 'Digitizes hotel guest check-in by extracting structured data from ID cards via OCR.',
    githubUrl: 'https://github.com/Manku27/hotel-admin',
    tech: ['OCR', 'Node.js', 'TypeScript'],
  },
  {
    id: 'gemini-sheets-whatsapp',
    name: 'Gemini + Sheets + WhatsApp Bot',
    description: 'Order management and inventory for a bakery — operated entirely via WhatsApp, no app required. Powered by Gemini for natural language understanding.',
    githubUrl: 'https://github.com/Manku27/sheets-gemini-js-poc',
    tech: ['Gemini API', 'Google Sheets API', 'WhatsApp Business API', 'Node.js'],
  },
]

export const certifications: Certification[] = [
  { id: 'contentful', name: 'Contentful Certified Professional', issuer: 'Contentful' },
  { id: 'cloudinary', name: 'Cloudinary Certified Implementation Specialist', issuer: 'Cloudinary' },
  { id: 'azure', name: 'Microsoft Azure Fundamentals', issuer: 'Microsoft' },
]

export const awards: Award[] = [
  { id: 'pwc-aab', name: 'Above and Beyond', issuer: 'PwC India' },
  { id: 'pwc-spot', name: 'Spot Award', issuer: 'PwC India' },
  { id: 'tm-aab', name: 'Above and Beyond', issuer: 'Tech Mahindra' },
]

export const education: Education[] = [
  {
    id: 'jadavpur',
    institution: 'Jadavpur University',
    institutionDescription: 'One of India\'s top public engineering universities',
    degree: 'Bachelor of Engineering — Electrical Engineering',
    period: '2016 – 2020',
    location: 'Kolkata, India',
  },
]
