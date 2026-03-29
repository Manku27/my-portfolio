// lib/data/about.ts
//
// This is not a resume. This is the story behind the resume.
// Used for the /work page summary, the 3D hero text, and anywhere
// the site needs to communicate who Mayank is — not just what he's done.
//
// Written from conversation. Updated as the story evolves.
// ============================================================

export const about = {

  // One-line identity — used in hero, meta descriptions, OG tags
  headline: 'Senior Fullstack Engineer. 5 years. Kolkata. Remote-first.',

  // The honest tagline — not a marketing line
  tagline: 'I build things because they need to exist.',

  // Short version — for cards, previews, anywhere space is tight
  shortBio: `Senior Fullstack Engineer with 5 years across adtech, hospitality,
e-commerce, defence, and real estate. I build side projects that solve real
problems, publish open-source tooling people actually use, and write about
what I learn. Looking for international remote roles where I'm treated as a
peer, not cheap labour.`,

  // The full story — for /work, for anyone who wants to understand the person
  fullBio: `I grew up without much. Getting to Kota for JEE prep felt like a
victory — I believed then that a good college would fix everything. What I
found instead was a genuine love for physics, and an exam system that wasn't
built for how I think. I had a mental breakdown. I came back from it. Batman
and Spider-Man — not metaphorically, literally those characters — pulled me
back when I had nothing. I still read comics. That's not a casual detail.

I landed at Jadavpur University on cheap fees and a strong brand. Struggled
through Electrical Engineering. Multiple backlogs. Barely graduated. Covid
helped. I chose web development over physics for pragmatic reasons — it paid,
and I needed to pay. Started at 3.5 LPA.

What I didn't expect was to actually love it.

In five years I've grown 7x in salary, moved from automation scripts at
Infosys to leading the fullstack rebuild of a major international hospitality
platform at Merkle. The work speaks for itself.

The pattern I've noticed: I hit walls, I don't quit, I find a different way
through. This has worked every single time.`,

  // The pattern — the honest throughline
  pattern: `Hits walls. Doesn't quit. Finds a different way through.
This has worked every single time.`,

  // Comics — not a hobby section entry, a value statement
  comicsNote: `Comics are not a hobby. They rebuilt me at my lowest point.
Vishuddha Comics — a free, frictionless platform for discovering comics — is
that value made into a product. Not monetized. Not trying to be. I built the
platform I would have wanted to find.`,

  // Why he builds things
  whyIBuild: `I build things when I see a real gap. Not for portfolio. Not for
clout. Because the thing needed to exist. The ESLint plugins were gaps I
actually hit at work. PK Chai was for a real eatery with a real problem.
Vishuddha was a platform I wanted. Moebius was frustration with how codebases
lose their institutional memory. Every project has a reason.`,

  // On the Indian market vs. international
  onMarket: `Indian companies have put low ceilings on my head. I've noticed.
I'm right to notice. The international market values the same skills
significantly higher. The gap is positioning and visibility, not ability.
I'm fixing that.`,

  // What he's looking for
  lookingFor: `An international remote role or contract, in any model
— full-time, freelance, retainer. Work only on products I believe in. Clients
who treat me as a peer. Eventually, fully independent.`,

  // Life — the non-professional part
  life: {
    summary: `Comics, gaming, writing, music, fitness, physics. Marriage coming.
Family in a few years. High impact and visibility, but protected time for the
people and things that matter. Stability is a first-class constraint, not a
compromise.`,

    comics: `Active and regular. Identity-level, not casual. The reference for
this site's visual aesthetic is Hollow Knight — dark, atmospheric, beautifully
melancholic. That's not random.`,

    writing: `Story scripts and ideas. Wants to publish comics and novels. No
money motive — just wants to make things. Has thought through IP partnership
models and publisher pitches (Penguin). Not blocked forever — blocked on the
execution path.`,

    gaming: `Active. Hollow Knight, Elden Ring, Cyberpunk 2077, Hades.
Drawn to games with atmosphere, systems depth, and emotional weight.`,

    physics: `Wants to read more. Hasn't made time. Shows up in how he thinks —
systems, first principles, asking why before how.`,

    fitness: `Part of current life.`,

    people: `Recently started protecting time with his mother and girlfriend.
Not unproductive. This is the point.`,
  },

  // How he works
  howHeWorks: {
    learning: `Learns by building, not studying. Failed in structured exam
systems. Thrived with autonomy and real problems. Every real skill came from
doing, not curriculum.`,

    focus: `High curiosity, many interests. Struggles with repetitive
low-engagement work. Lights up on new problems. The variety of side projects
isn't scattered — it's consistent curiosity. These are different things.`,

    financially: `Financially pragmatic but not mercenary. Chose web dev for
money. But consistently picks work — paid and unpaid — that has genuine
purpose.`,
  },

  // Honest self-assessment
  strengths: [
    'Ships things consistently.',
    '7x salary growth in 5 years from a standing start with zero family advantage.',
    'Ships things consistently — side projects, open source, and full-time delivery in parallel.',
    'Certified in a niche but commercially valuable stack (Contentful + Cloudinary).',
    'Writes, teaches, and builds — rare combination at this level.',
    'International exposure — has worked across domains, geographies, and constraints.',
    'Adapts to any domain without losing depth.',
  ],

  gaps: [
    'Every career move so far has been reactive — push-driven, not pulled toward a destination.',
    'Wide interests risk spreading thin without channeling.',
    'Creative work (comics, novel) started but not finished. Pattern worth examining.',
    'Consulting pipeline has been sequential — needs to become parallel over time.',
    'Hasn\'t tested whether he can attract clients independently. All referrals so far.',
  ],

  // Salary trajectory — context for the 7x claim
  salaryTrajectory: [
    { company: 'Infosys', period: 'Nov 2020', ctc: '3.5 LPA', note: 'The beginning.' },
    { company: 'PwC India', period: 'Sep 2021', ctc: '8 LPA', note: 'Led Next.js + React Native. Underpaid for the scope.' },
    { company: 'Tech Mahindra', period: 'Sep 2023', ctc: '15 LPA', note: 'Microsoft Bing Ads. Contract-ended at 18 months.' },
    { company: 'Dentsu / Merkle', period: 'Apr 2025', ctc: '25 LPA', note: 'Sole fullstack on major US hospitality client.' },
  ],

}
