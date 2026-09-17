import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { after } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'
import BookRequestEmail from '@/emails/BookRequestEmail'

const BOOK_SLUG = 'what-runs-when'
const BOOK_TITLE = 'What Runs When'
const BOOK_PATH = path.join(process.cwd(), 'content', 'books', 'what-runs-when.pdf')
const HEADER_PATH = path.join(process.cwd(), 'app', 'opengraph-image.png')
const HEADER_CID = 'mayank-header'
const SITE_URL = 'https://manku27.dev'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function sql() {
  return neon(process.env.DATABASE_URL!)
}

function resend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(req: Request) {
  let body: { email?: unknown; company?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Honeypot — real users never fill a field named "company" hidden off-screen.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return Response.json({ ok: true })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const db = sql()
  await db`
    INSERT INTO book_requests (email, book_slug)
    VALUES (${email}, ${BOOK_SLUG})
    ON CONFLICT (email, book_slug) DO NOTHING
  `

  // Fire-and-forget — the request only waits on the DB write above. `after()`
  // keeps the function alive for this work post-response instead of racing
  // the platform tearing it down the moment we return (a bare un-awaited
  // promise isn't guaranteed to finish on serverless).
  after(async () => {
    try {
      const [pdf, header] = await Promise.all([readFile(BOOK_PATH), readFile(HEADER_PATH)])
      const { error } = await resend().emails.send({
        from: `Mayank Jhunjhunwala <book@${process.env.RESEND_EMAIL_DOMAIN}>`,
        to: [email],
        subject: `Your copy of "${BOOK_TITLE}"`,
        react: BookRequestEmail({ bookTitle: BOOK_TITLE, siteUrl: SITE_URL, headerCid: HEADER_CID }),
        text: `Thanks for your interest — your copy of "${BOOK_TITLE}" is attached as a PDF.\n\nHope you enjoy it. If anything in there resonates, just reply — I read every one.\n\n— Mayank\nSenior Fullstack Engineer\n${SITE_URL}`,
        attachments: [
          {
            filename: 'what-runs-when.pdf',
            content: pdf,
          },
          {
            filename: 'header.png',
            content: header,
            contentId: HEADER_CID,
          },
        ],
      })
      if (error) throw new Error(error.message)

      await db`
        UPDATE book_requests SET sent_at = now(), send_error = NULL
        WHERE email = ${email} AND book_slug = ${BOOK_SLUG}
      `
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      await db`
        UPDATE book_requests SET send_error = ${message}
        WHERE email = ${email} AND book_slug = ${BOOK_SLUG}
      `
    }
  })

  return Response.json({ ok: true })
}
