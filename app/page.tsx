import { GameCanvas } from '@/components/game/GameCanvas'
import {
  profile,
  workExperience,
  projects,
  certifications,
  education,
} from '@/lib/data/index'

export default function Home() {
  return (
    <>
      {/* Crawlable content layer — visually hidden, readable by search engines.
          sr-only keeps it in the DOM flow without display:none/visibility:hidden,
          both of which cause crawlers to ignore the content. */}
      <main className="sr-only">
        <h1>{profile.name} — {profile.title}</h1>
        <p>{profile.tagline}</p>
        <p>{profile.location}</p>
        <p>{profile.bio}</p>
        <p>{profile.availability}</p>

        <nav aria-label="Social links">
          <ul>
            {profile.socials.map((s) => (
              <li key={s.platform}>
                <a href={s.url} rel="noopener noreferrer">{s.platform}: {s.handle}</a>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="skills-heading">
          <h2 id="skills-heading">Skills</h2>
          {profile.skills.map((group) => (
            <article key={group.category}>
              <h3>{group.category}</h3>
              <ul>
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </section>

        <section aria-labelledby="work-heading">
          <h2 id="work-heading">Work Experience</h2>
          {workExperience.map((w) => (
            <article key={w.id}>
              <h2>{w.company}</h2>
              <h3>{w.role}</h3>
              <p>{w.period} · {w.location}</p>
              <p>{w.companyDescription}</p>
              <ul>
                {w.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </article>
          ))}
        </section>

        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading">Projects</h2>
          {projects.map((p) => (
            <article key={p.id}>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              {p.tech && (
                <ul>
                  {p.tech.map((t) => <li key={t}>{t}</li>)}
                </ul>
              )}
              {p.url && <a href={p.url} rel="noopener noreferrer">{p.url}</a>}
              {p.githubUrl && <a href={p.githubUrl} rel="noopener noreferrer">{p.githubUrl}</a>}
            </article>
          ))}
        </section>

        <section aria-labelledby="certs-heading">
          <h2 id="certs-heading">Certifications</h2>
          <ul>
            {certifications.map((c) => (
              <li key={c.id}>{c.name} — {c.issuer}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="education-heading">
          <h2 id="education-heading">Education</h2>
          {education.map((e) => (
            <article key={e.id}>
              <h3>{e.institution}</h3>
              <p>{e.degree}</p>
              <p>{e.period} · {e.location}</p>
            </article>
          ))}
        </section>
      </main>

      <GameCanvas />
    </>
  )
}
