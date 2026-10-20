import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { AGENCY } from '@/lib/constants'

export const alt = `${AGENCY.name} - Web Design & Development`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** The font is read with `node:fs`, so this route must run on Node.js. */
export const runtime = 'nodejs'

const FONT_PATH = join(process.cwd(), 'public', 'fonts', 'gropled-bold.otf')

/**
 * Default social card. Generated once per locale at build time; every page
 * inherits it unless it sets its own `openGraph.images`.
 *
 * Deliberately flat: one near-black field, the wordmark with its gold ampersand,
 * a gold rule and clean type. No gradients or blooms.
 *
 * This card now sets the real display face. The earlier compromise existed
 * because satori cannot read the WOFF2 files Google serves for a hosted font —
 * but it reads the OTF we self-host without complaint, so the social card and the
 * website are finally the same typeface.
 */
export default async function OpengraphImage() {
  // Copied into a fresh ArrayBuffer: a Node Buffer is usually a view into a
  // shared pool, and handing satori the whole pool would be wrong.
  const font = new Uint8Array(await readFile(FONT_PATH))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0C0C0D',
          fontFamily: 'Gropled',
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: -2,
            color: '#F2F2F3',
          }}
        >
          Virtue
          <span style={{ color: '#C5A059' }}> &amp; </span>
          Co.
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 16,
            color: '#8A8A93',
          }}
        >
          WEBWORKS
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 44,
            height: 3,
            width: 420,
            backgroundColor: '#C5A059',
          }}
        />

        <div
          style={{
            display: 'flex',
            marginTop: 44,
            fontSize: 30,
            color: '#C9C9D1',
            textAlign: 'center',
          }}
        >
          Websites that look great and work even better
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Gropled',
          data: font.buffer as ArrayBuffer,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  )
}
