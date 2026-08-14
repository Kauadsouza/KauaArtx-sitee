const CHANNEL_URL = 'https://www.youtube.com/@KauartX';
const CHANNEL_CACHE_SECONDS = 60 * 60 * 24;
const FEED_CACHE_SECONDS = 60 * 15;

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export type LatestYouTubeState =
  | { status: 'video'; channelUrl: string; video: YouTubeVideo }
  | { status: 'empty'; channelUrl: string }
  | { status: 'unavailable'; channelUrl: string };

function decodeXml(value: string): string {
  return value
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function tagValue(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : null;
}

function findChannelId(html: string): string | null {
  const patterns = [
    /<meta\s+itemprop=["']channelId["']\s+content=["'](UC[A-Za-z0-9_-]{22})["']/i,
    /["']channelId["']\s*:\s*["'](UC[A-Za-z0-9_-]{22})["']/i,
    /["']externalId["']\s*:\s*["'](UC[A-Za-z0-9_-]{22})["']/i,
    /feeds\/videos\.xml\?channel_id=(UC[A-Za-z0-9_-]{22})/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function parseLatestVideo(feed: string): YouTubeVideo | null {
  const entry = feed.match(/<entry>([\s\S]*?)<\/entry>/i)?.[1];
  if (!entry) return null;

  const id = tagValue(entry, 'yt:videoId');
  const title = tagValue(entry, 'title');
  const publishedAt = tagValue(entry, 'published');

  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id) || !title || !publishedAt) {
    return null;
  }

  return {
    id,
    title,
    publishedAt,
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

async function resolveChannelId(): Promise<string | null> {
  const response = await fetch(CHANNEL_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; KauaArtxSite/1.0; +https://kauaartx.vercel.app)',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    },
    next: { revalidate: CHANNEL_CACHE_SECONDS },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) return null;
  return findChannelId(await response.text());
}

export async function getLatestYouTubeVideo(): Promise<LatestYouTubeState> {
  try {
    const channelId = await resolveChannelId();
    if (!channelId) return { status: 'unavailable', channelUrl: CHANNEL_URL };

    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      {
        next: { revalidate: FEED_CACHE_SECONDS },
        signal: AbortSignal.timeout(8_000),
      }
    );

    if (!response.ok) return { status: 'unavailable', channelUrl: CHANNEL_URL };

    const feed = await response.text();
    const video = parseLatestVideo(feed);
    if (!video) return { status: 'empty', channelUrl: CHANNEL_URL };

    return { status: 'video', channelUrl: CHANNEL_URL, video };
  } catch {
    // A home continua útil mesmo se o YouTube bloquear ou atrasar a resposta.
    return { status: 'unavailable', channelUrl: CHANNEL_URL };
  }
}

