// lib/data/index.ts
// Single import point for all data.
// When DB is wired, replace these exports with real data fetching calls.
// Nothing outside this directory should change.

export { about } from './about'
export { profile } from './profile'
export { workExperience, consultingEngagements, projects, certifications, awards, education } from './work'
export { timelineEntries } from './timeline'
export { getActivity } from './activity'
export { videos } from './videos'
