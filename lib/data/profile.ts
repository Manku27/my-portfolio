import type { Profile } from '../types'

export const profile: Profile = {
  name: 'Mayank Jhunjhunwala',
  title: 'Senior Fullstack Engineer',
  tagline: 'I build things because they need to exist.',
  location: 'Kolkata, India',
  email: 'jjmayank98@gmail.com',
  shortBio: 'Senior Fullstack Engineer · 5 years · React, Next.js, TypeScript, Node.js · Contentful Certified · Currently at Merkle (Dentsu) · Open to international remote roles.',
  bio: `I'm a Senior Fullstack Engineer based in Kolkata with five years of experience across adtech, hospitality, e-commerce, defence, and real estate. I currently rebuild the web platform for Leading Hotels of the World at Merkle, and independently consult for international product startups.

I started at 3.5 LPA and grew 7x in five years — not through a plan, but by consistently shipping things that mattered and staying curious enough to keep learning.

I write technical content, publish open-source tooling with real adoption, and build side products that solve real problems. I'm looking for international remote roles or contracts where I'm treated as a peer, not cheap labour.`,
  availability: 'Open to international remote roles and contracts·',
  socials: [
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/mayankc137/',
      handle: 'mayankc137',
    },
    {
      platform: 'GitHub',
      url: 'https://github.com/Manku27',
      handle: 'Manku27',
    },
    {
      platform: 'Gmail',
      url: 'mailto:jjmayank98@gmail.com',
      handle: 'jjmayank98@gmail.com',
    },
    {
      platform: 'YouTube',
      url: 'https://www.youtube.com/@mankuDevJS',
      handle: '@mankuDevJS',
    },
    {
      platform: 'Medium',
      url: 'https://medium.com/@jjmayank98',
      handle: '@jjmayank98',
    },
    {
      platform: 'WhatsApp',
      url: 'https://wa.me/917477367506',
      handle: '+91 7477367506',
    },
    {
      platform: 'Discord',
      url: 'https://discord.com/users/mank.you',
      handle: 'mank.you',
    },
  ],
  skills: [
    {
      category: 'Languages',
      items: ['TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3'],
    },
    {
      category: 'Frameworks & Libraries',
      items: ['React', 'Next.js', 'Redux Toolkit', 'Node.js', 'React Native'],
    },
    {
      category: 'CMS & Cloud',
      items: ['Contentful', 'Cloudinary', 'AWS (AppSync, serverless)', 'Vercel', 'Azure'],
    },
    {
      category: 'Tooling',
      items: ['ESLint (custom plugins)', 'Husky', 'CI/CD', 'IndexedDB', 'PWA architecture'],
    },
  ],
}
