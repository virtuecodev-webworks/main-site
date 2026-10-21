/**
 * Template 3 — Newsletter Subscription Confirmed
 * Triggered: After POST /api/newsletter adds a verified subscriber
 */
import * as React from 'react'
import { Shell, EyebrowLabel, Heading, BodyText, Divider, GoldButton } from './base/shell'
import { GOLD, EMERALD, WELL, BORDER_INNER, TEXT, TEXT_MUTED, TEXT_DIM, PHOTO_STUDIO, SITE, UNSUBSCRIBE } from './base/tokens'
import { AGENCY } from '@/lib/constants'

export function NewsletterConfirmEmail({ email }: { email?: string }) {
  return (
    <Shell
      preheader="You're subscribed. Studio Insights lands in your inbox every week."
      badge="SUBSCRIBED"
      badgeColor="emerald"
    >
      {/* ── Studio Photo Banner ── */}
      <div style={{ margin: '-40px -36px 32px' }}>
        <img src={PHOTO_STUDIO} width="100%" alt="Virtue & Co. Studio" style={{ display: 'block', width: '100%', height: 180, objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ height: 2, background: `linear-gradient(90deg,${GOLD} 0%,${EMERALD} 100%)` }} />
      </div>

      <EyebrowLabel>STUDIO DISPATCH</EyebrowLabel>
      <Heading>You're in.</Heading>
      <BodyText>
        Welcome to <strong style={{ color: TEXT }}>Virtue &amp; Co. Studio Insights</strong> —
        our weekly editorial dispatch covering web engineering, design systems,
        performance benchmarks, and the business of building high-quality digital products.
      </BodyText>

      <Divider />

      {/* ── What you'll receive ── */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>
        WHAT YOU'LL RECEIVE
      </div>

      {([
        ['📐', 'Engineering Deep-Dives', 'Architecture decisions, performance wins, and technical case studies from real projects.'],
        ['📊', 'Business Impact Analysis', 'How website quality directly affects revenue, retention, and brand credibility.'],
        ['🎨', 'Design &amp; UX Insights', 'UI patterns, typography choices, and visual decisions that move conversion needles.'],
        ['🚀', 'Studio Project Launches', 'Behind-the-scenes looks at new client builds, features, and milestones.'],
      ] as [string, string, string][]).map(([icon, title, body]) => (
        <table key={title} role="presentation" width="100%" cellPadding={0} cellSpacing={0}
          style={{ marginBottom: 10 }}>
          <tbody>
            <tr>
              <td style={{ width: 40, verticalAlign: 'top', paddingTop: 2 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
              </td>
              <td style={{ verticalAlign: 'top' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 3 }} dangerouslySetInnerHTML={{ __html: title }} />
                <div style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>{body}</div>
              </td>
            </tr>
          </tbody>
        </table>
      ))}

      <Divider />

      {/* ── First issue teaser ── */}
      <div style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', color: EMERALD, textTransform: 'uppercase', marginBottom: 8 }}>
          COMING UP IN YOUR FIRST ISSUE
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 6, lineHeight: 1.3 }}>
          Architecting for Zero-Layout-Shift in Next.js 16
        </div>
        <div style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>
          How precision CSS containment and server components eliminate visual instability and
          achieve a perfect 100/100 Core Web Vitals score.
        </div>
      </div>

      <GoldButton href={`${SITE}/blog`}>Read the Studio Blog</GoldButton>

      <p style={{ margin: '20px 0 0', fontSize: 11.5, color: TEXT_DIM, lineHeight: 1.65, textAlign: 'center' }}>
        {email && <>Subscribed as <strong style={{ color: '#94A3B8' }}>{email}</strong>. </>}
        <a href={UNSUBSCRIBE} style={{ color: TEXT_DIM, textDecoration: 'underline' }}>Unsubscribe at any time</a>
        {' · '}
        <a href={`${SITE}/privacy`} style={{ color: TEXT_DIM, textDecoration: 'underline' }}>Privacy Policy</a>
      </p>
    </Shell>
  )
}

export default NewsletterConfirmEmail
