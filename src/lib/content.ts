import 'server-only'

import { unstable_cache } from 'next/cache'
import { PHOTOS } from '@/lib/photos'
import { createSupabasePublicClient } from '@/lib/supabase/admin'
import { publicMediaUrl } from '@/lib/supabase/env'

/** Serialisable view model handed to the blog grid and related strips. */
export interface BlogPostCard {
  slug: string
  title: string
  excerpt: string
  coverUrl: string | null
  tags: string[]
  author: string
  readingMinutes: number
  publishedAt: string
}

/** Full post, including the Markdown body, used on the article route. */
export interface BlogPostFull extends BlogPostCard {
  body: string
  published: boolean
}

/** Raw `posts` row shape (columns mirror the Postgres migration exactly). */
interface PostRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  cover_image_path: string | null
  tags: string[] | null
  author: string | null
  reading_minutes: number | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

const DEFAULT_AUTHOR = 'Virtue & Co. Webworks'
const WORDS_PER_MINUTE = 200

/** Rough, dependency-free reading estimate. Never returns less than a minute. */
export function estimateReadingMinutes(text: string): number {
  const words = text
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/[#>*_-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

/** Project a full post down to the lightweight card view model. */
export function toPostCard(post: BlogPostFull): BlogPostCard {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverUrl: post.coverUrl,
    tags: post.tags,
    author: post.author,
    readingMinutes: post.readingMinutes,
    publishedAt: post.publishedAt,
  }
}

/**
 * A parsed block of light Markdown. Rendering lives in the page so this module
 * can stay free of JSX and the output never goes near `dangerouslySetInnerHTML`.
 */
export type MarkdownBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }

/**
 * Minimal Markdown reader: paragraphs, `##` / `###` headings and `-` bullet
 * lists. Deliberately tiny — the article body is authored by the studio, not by
 * untrusted users, so only the structures we actually write are supported.
 */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const lines = source.replace(/\r\n/g, '\n').split('\n')

  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ').trim() })
      paragraph = []
    }
  }

  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'list', items: list })
      list = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()

    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      flushParagraph()
      flushList()
      blocks.push({
        type: 'heading',
        level: heading[1].length >= 3 ? 3 : 2,
        text: heading[2].trim(),
      })
      continue
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      flushParagraph()
      list.push(bullet[1].trim())
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()

  return blocks
}

function fromRow(row: PostRow): BlogPostFull {
  const body = row.body ?? ''

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    body,
    coverUrl: publicMediaUrl(row.cover_image_path),
    tags: row.tags ?? [],
    author: row.author ?? DEFAULT_AUTHOR,
    readingMinutes: row.reading_minutes ?? estimateReadingMinutes(body),
    publishedAt: row.published_at ?? row.created_at,
    published: row.published,
  }
}

/**
 * Demo articles rendered when Supabase isn't configured yet, so the blog is
 * never an empty void on a fresh clone. Copy is written to be genuinely useful
 * and deliberately avoids invented statistics, client names or testimonials.
 */
export const PLACEHOLDER_POSTS: BlogPostFull[] = [
  {
    slug: 'shipping-a-100-lighthouse-score-on-a-content-site',
    title: 'Shipping a 100 Lighthouse score on a content site',
    excerpt:
      'Lighthouse is a budget, not a badge. How we keep a content site near-perfect without making the editorial team wait.',
    coverUrl: PHOTOS.blog.performance,
    tags: ['Performance', 'Core Web Vitals', 'Next.js'],
    author: DEFAULT_AUTHOR,
    readingMinutes: 5,
    publishedAt: '2026-09-18T09:00:00.000Z',
    published: true,
    body: `## Treat the score as a budget, not a badge
A Lighthouse run is a snapshot, not a finish line. We pick a small set of budgets - largest contentful paint, total blocking time, layout shift - and hold every change to them in review. When a score drops, that is a signal to look at what shipped, not a reason to chase points.

- Set budgets for images, fonts and third-party scripts before design starts
- Fail the build when the bundle grows past the agreed ceiling
- Test on a mid-range phone profile, not a fast desktop

## Images are usually the whole story
On a content site the hero image and the article cover dominate the timeline. We serve them through the framework image component so they arrive at the size the viewport actually needs, in a modern format, with explicit dimensions so nothing jumps as the page paints.

- Ask for the largest source you can get, then let the optimiser downgrade
- Give every image a width and a height, even when it is fluid
- Lazy-load anything below the fold and leave the cover eager

## Ship less JavaScript
Content does not need a client bundle. We keep pages on the server, move interaction into the few components that genuinely need it, and pass serialisable data down instead of letting the browser fetch it later.

- Prefer server components for anything that only renders text
- Delay third-party embeds until a reader interacts with them
- Audit the dependency graph before adding a library

## Make it a habit
The score holds when the constraints are part of the workflow rather than a one-off clean-up. We review performance in the same pull request as the feature, so nobody has to schedule a rescue later.`,
  },
  {
    slug: 'taking-online-payments-without-the-pain',
    title: 'Taking online payments without the pain',
    excerpt:
      'Declines, duplicated webhooks and reconciliation headaches. How we wire a checkout so the books stay honest.',
    coverUrl: PHOTOS.blog.payments,
    tags: ['Payments', 'Stripe', 'E-commerce'],
    author: DEFAULT_AUTHOR,
    readingMinutes: 6,
    publishedAt: '2026-08-27T09:00:00.000Z',
    published: true,
    body: `## Start from the ledger, not the button
Checkout is the easy part. The hard part is proving, weeks later, that every payment that left a customer's account landed in yours exactly once. We design the flow around a payment record we own and treat the provider as a source of truth we reconcile against.

- Create your own reference before you call the provider
- Store the amount and currency you expect alongside the reference
- Never treat a redirect alone as proof of payment

## Treat webhooks as the source of truth
A customer can close the tab before the redirect lands, so the redirect is a nicety and the webhook is the contract. We verify the signature, look up our own record by reference, and apply the state change idempotently, so a retried delivery cannot double-credit an order.

- Verify the signature before parsing the body
- Ignore a webhook that arrives out of order or after the fact
- Log the raw payload so disputes are answerable

## Handle the decline paths
A decline is normal, not exceptional. Some cards fail on international transactions, some banks time out, and some customers simply run out of patience. The checkout should explain what happened and offer a clear next step instead of a dead end.

- Show a specific reason where the provider gives one
- Offer a retry without re-entering the whole form
- Keep a support reference the customer can quote

## Reconcile on a schedule
We run a daily job that pulls settled transactions and compares them to our records, flagging anything missing on either side. Small studios do not need a finance team to sleep at night; they need a check that runs without being asked.

- Match on the reference you generated, not the provider's id
- Surface mismatches in a dashboard a human actually reads
- Keep the audit trail immutable`,
  },
  {
    slug: 'choosing-a-cms-you-will-not-regret-in-two-years',
    title: 'Choosing a CMS you will not regret in two years',
    excerpt:
      'The editor experience you pick today becomes the migration you pay for tomorrow. A short guide to choosing deliberately.',
    coverUrl: PHOTOS.blog.cms,
    tags: ['CMS', 'WordPress', 'Architecture'],
    author: DEFAULT_AUTHOR,
    readingMinutes: 6,
    publishedAt: '2026-07-30T09:00:00.000Z',
    published: true,
    body: `## Start with the people who publish
The best CMS is the one your team will actually use on a Tuesday afternoon, not the one with the cleanest demo. Before comparing tools, write down who edits, how often they publish, and what they expect to do without calling a developer.

- List the content types and how often each one changes
- Note who drafts versus who is allowed to publish
- Decide what genuinely must be editable in place

## Match the tool to the content model
A blog and a product catalogue are different problems. If your content is structured and reused across pages, you want a model you can query. If it is a handful of long-form pages, a visual builder may serve the team better than a bespoke schema.

- Prefer structured content when the same data appears in several places
- Prefer a page builder when editors compose one-off layouts
- Avoid any model you cannot export cleanly

## Weigh the exit, not just the entrance
Every tool is pleasant on day one. The question is what happens when you outgrow it, when the pricing changes, or when you want to render the content somewhere new. Content you can export as plain data is content you can take with you.

- Check that content exports in a format you can re-import
- Confirm the API is documented and stable
- Avoid lock-in dressed up as convenience

## Keep the rendering yours
We separate the content from how it is displayed, so the platform can change without rewriting the site. Markdown and structured fields travel well, and they render the same whether a page is served by one framework or another.

- Store prose as portable text, not as one provider's secret format
- Keep templates in your own codebase
- Version the content model alongside the code

## Decide, then document
Whatever you choose, write the decision down. A short note on why the tool was picked saves the next person from relitigating it, and it turns the eventual migration into a project instead of a crisis.`,
  },
  {
    slug: 'how-we-scope-a-project-at-a-small-studio',
    title: 'How we scope a project at a small studio',
    excerpt:
      'Fixed prices only work when the scope is honest. The process we use to scope work we can actually deliver.',
    coverUrl: PHOTOS.blog.studio,
    tags: ['Studio', 'Process', 'Scoping'],
    author: DEFAULT_AUTHOR,
    readingMinutes: 5,
    publishedAt: '2026-06-12T09:00:00.000Z',
    published: true,
    body: `## Understand the goal before the features
A brief full of features usually hides one or two real goals. We start by asking what changes for the business if the project succeeds, then work backwards to the smallest set of features that gets there.

- Write the outcome in one sentence
- Separate must-haves from nice-to-haves with the client in the room
- Agree what success looks like before anyone designs a screen

## Price the work you can see
A fixed price is only fair when the scope is knowable. We break the build into phases, price the phase we understand, and treat anything discovered along the way as a new decision rather than a silent overrun.

- Estimate in ranges, then commit a number once the unknowns are closed
- Put the assumptions in writing next to the price
- Reserve a contingency that the client can see

## Quote the dependencies too
Timelines slip for reasons that have nothing to do with code. Content, copy, photography and third-party access all gate the launch, so we make them part of the plan instead of the excuse.

- Name who owns each piece of content and by when
- Line up accounts and domain access up front
- Set a cut-off after which a launch moves to the next slot

## Keep the loop short
Long silences are where projects go wrong. We work in weekly increments, show something real every week, and adjust the plan while it is still cheap to change.

- Ship to a staging link from the first week
- Review in the same slot each week
- Put every change of scope in one place, in writing

## Say no clearly
Scoping well sometimes means declining work that cannot be done properly at the budget on offer. A clear no early is kinder than a discount that ends in a rushed launch and a difficult conversation.`,
  },
]

/** Cache tag invalidated after a write, mirroring `PROJECTS_TAG`. */
export const POSTS_TAG = 'posts'

async function fetchPublishedPosts(): Promise<BlogPostFull[]> {
  // Cookie-free client: safe inside `unstable_cache`, and RLS already limits
  // the anon role to published rows.
  const supabase = createSupabasePublicClient()
  if (!supabase) return PLACEHOLDER_POSTS

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .returns<PostRow[]>()

  if (error) {
    console.warn('[content] published posts failed:', error.message)
    return PLACEHOLDER_POSTS
  }

  const posts = (data ?? []).map(fromRow)
  return posts.length ? posts : PLACEHOLDER_POSTS
}

/**
 * Published articles, newest first. Cached for 5 minutes. Falls back to the
 * placeholder set when Supabase isn't configured or returns no rows.
 */
export const getPublishedPosts = () =>
  unstable_cache(fetchPublishedPosts, ['published-posts'], {
    revalidate: 300,
    tags: [POSTS_TAG],
  })()

/** Single published article by slug, falling back to the placeholder set. */
export async function getPostBySlug(slug: string): Promise<BlogPostFull | null> {
  const supabase = createSupabasePublicClient()

  if (supabase) {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle<PostRow>()

    if (data) return fromRow(data)
  }

  return PLACEHOLDER_POSTS.find((post) => post.slug === slug) ?? null
}
