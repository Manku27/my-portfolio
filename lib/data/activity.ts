import type { ActivityItem, ActivityType, ActivityStatus } from '../types'

// Source: Popfeed (social.popfeed.*) records in the author's own atproto repo.
// Single-user site — DID/PDS are fixed constants, not resolved dynamically.
const PDS_HOST = 'https://bsky.social'
const DID = 'did:plc:tyzefiiu7z7buuh6etaltsec'

const LIST_ITEM_COLLECTION = 'social.popfeed.feed.listItem'
const REVIEW_COLLECTION = 'social.popfeed.feed.review'
const POST_COLLECTION = 'app.bsky.feed.post'

const POST_TITLE_MAX = 60

const REVALIDATE_SECONDS = 60 * 60 * 6 // 6h

interface AtRecord<T> {
  uri: string
  cid: string
  value: T
}

interface ListRecordsResponse<T> {
  records: AtRecord<T>[]
  cursor?: string
}

interface PopfeedListItemValue {
  title: string
  genres?: string[]
  posterUrl?: string
  backdropUrl?: string
  releaseDate?: string
  addedAt: string
  listType: string
  mainCredit?: string
  mainCreditRole?: string
  identifiers?: Record<string, string>
  creativeWorkType: ActivityType
}

interface PopfeedReviewValue {
  rating?: number
  text?: string
  identifiers?: Record<string, string>
  containsSpoilers?: boolean
}

interface BskyPostValue {
  text: string
  createdAt: string
  reply?: unknown // present only on replies — excluded, they read as conversation not activity
  embed?: {
    $type: string
    external?: { uri: string }
  }
}

async function listAllRecords<T>(collection: string): Promise<AtRecord<T>[]> {
  const records: AtRecord<T>[] = []
  let cursor: string | undefined
  const MAX_PAGES = 10 // safety cap — 500 records at 50/page

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(`${PDS_HOST}/xrpc/com.atproto.repo.listRecords`)
    url.searchParams.set('repo', DID)
    url.searchParams.set('collection', collection)
    url.searchParams.set('limit', '50')
    if (cursor) url.searchParams.set('cursor', cursor)

    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
    if (!res.ok) break

    const data: ListRecordsResponse<T> = await res.json()
    records.push(...data.records)

    if (!data.cursor || data.records.length === 0) break
    cursor = data.cursor
  }

  return records
}

// Ratings/reviews live in a separate collection with no back-reference to the
// listItem — join on whichever external identifier both records share.
const IDENTIFIER_JOIN_PRIORITY = ['imdbId', 'tmdbId', 'isbn13', 'steamId', 'igdbId']

function joinKey(identifiers?: Record<string, string>): string | undefined {
  if (!identifiers) return undefined
  for (const key of IDENTIFIER_JOIN_PRIORITY) {
    if (identifiers[key]) return `${key}:${identifiers[key]}`
  }
  return undefined
}

function rkeyFromUri(uri: string): string {
  return uri.split('/').pop() ?? uri
}

function statusFromListType(listType: string): ActivityStatus {
  return listType.startsWith('currently_') ? 'in_progress' : 'completed'
}

// Popfeed crossposts embed the source review's own at:// URI in the external
// link — e.g. "https://popfeed.social/review/at://did:.../social.popfeed.feed.review/{rkey}".
// Extract the rkey so crossposted reviews can be excluded from the raw post feed.
const CROSSPOST_REVIEW_RKEY = /social\.popfeed\.feed\.review\/([a-zA-Z0-9]+)/

function crosspostedReviewRkey(post: BskyPostValue): string | undefined {
  const uri = post.embed?.external?.uri
  if (!uri) return undefined
  return CROSSPOST_REVIEW_RKEY.exec(uri)?.[1]
}

function truncateTitle(text: string): string {
  const firstLine = text.split('\n')[0].trim()
  return firstLine.length > POST_TITLE_MAX
    ? `${firstLine.slice(0, POST_TITLE_MAX).trimEnd()}…`
    : firstLine
}

export async function getActivity(): Promise<ActivityItem[]> {
  try {
    const [listItems, reviews, posts] = await Promise.all([
      listAllRecords<PopfeedListItemValue>(LIST_ITEM_COLLECTION),
      listAllRecords<PopfeedReviewValue>(REVIEW_COLLECTION),
      listAllRecords<BskyPostValue>(POST_COLLECTION),
    ])

    const reviewsByKey = new Map<string, AtRecord<PopfeedReviewValue>>()
    const reviewRkeys = new Set<string>()
    for (const review of reviews) {
      const key = joinKey(review.value.identifiers)
      if (key) reviewsByKey.set(key, review)
      reviewRkeys.add(rkeyFromUri(review.uri))
    }

    const popfeedActivity: ActivityItem[] = listItems.map((item) => {
      const key = joinKey(item.value.identifiers)
      const review = key ? reviewsByKey.get(key) : undefined

      return {
        id: rkeyFromUri(item.uri),
        type: item.value.creativeWorkType,
        title: item.value.title,
        genres: item.value.genres ?? [],
        posterUrl: item.value.posterUrl,
        backdropUrl: item.value.backdropUrl,
        releaseDate: item.value.releaseDate,
        addedAt: item.value.addedAt,
        status: statusFromListType(item.value.listType),
        credit: item.value.mainCredit,
        creditRole: item.value.mainCreditRole,
        identifiers: item.value.identifiers,
        rating: review?.value.rating as ActivityItem['rating'],
        review: review?.value.text,
        containsSpoilers: review?.value.containsSpoilers,
      }
    })

    const postActivity: ActivityItem[] = posts
      .filter((post) => !post.value.reply)
      .filter((post) => {
        const rkey = crosspostedReviewRkey(post.value)
        return !rkey || !reviewRkeys.has(rkey)
      })
      .map((post) => ({
        id: rkeyFromUri(post.uri),
        type: 'post' as const,
        title: truncateTitle(post.value.text),
        genres: [],
        addedAt: post.value.createdAt,
        status: 'completed' as const,
        review: post.value.text,
      }))

    return [...popfeedActivity, ...postActivity].sort((a, b) =>
      b.addedAt.localeCompare(a.addedAt),
    )
  } catch {
    return []
  }
}
