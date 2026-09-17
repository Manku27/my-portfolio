import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface BookRequestEmailProps {
  bookTitle: string
  siteUrl: string
  /** content_id of the inline-attached header banner (see app/api/book-request/route.ts) —
   *  CID embedding renders reliably across clients (incl. Outlook desktop, which doesn't
   *  support base64 data-URI images, and privacy proxies that block remote image fetches). */
  headerCid: string
}

const colors = {
  bg: '#050a0a',
  card: '#0a1512',
  border: 'rgba(220, 195, 110, 0.25)',
  gold: '#dcc36e',
  text: '#d7e6e0',
  dim: '#8fa79c',
}

export default function BookRequestEmail({
  bookTitle,
  siteUrl,
  headerCid,
}: BookRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your copy of &quot;{bookTitle}&quot; is attached</Preview>
      <Body style={{ backgroundColor: colors.bg, margin: 0, padding: '32px 12px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
        <Container style={{ maxWidth: 480, margin: '0 auto', backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <Img
            src={`cid:${headerCid}`}
            width="480"
            alt="Mayank Jhunjhunwala"
            style={{ width: '100%', display: 'block' }}
          />

          <Section style={{ padding: '28px 32px 8px' }}>
            <Text style={{ color: colors.gold, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
              {bookTitle}
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: '24px', margin: '0 0 12px' }}>
              Thanks for your interest — your copy is attached to this email as a PDF.
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: '24px', margin: '0 0 12px' }}>
              Hope you enjoy it. If anything in there resonates (or you spot something worth arguing about), just reply — I read every one.
            </Text>
          </Section>

          <Hr style={{ borderColor: colors.border, margin: '8px 32px' }} />

          <Section style={{ padding: '8px 32px 28px' }}>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: '22px', margin: '0 0 2px' }}>
              — Mayank
            </Text>
            <Text style={{ color: colors.dim, fontSize: 12.5, lineHeight: '20px', margin: '0 0 14px' }}>
              Senior Fullstack Engineer
            </Text>
            <Text style={{ fontSize: 12.5, margin: 0 }}>
              <Link href={siteUrl} style={{ color: colors.gold, textDecoration: 'none' }}>
                {siteUrl.replace(/^https?:\/\//, '')}
              </Link>
              <span style={{ color: colors.dim }}> · </span>
              <Link href="https://www.linkedin.com/in/mayankc137/" style={{ color: colors.gold, textDecoration: 'none' }}>
                LinkedIn
              </Link>
              <span style={{ color: colors.dim }}> · </span>
              <Link href="https://github.com/Manku27" style={{ color: colors.gold, textDecoration: 'none' }}>
                GitHub
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
