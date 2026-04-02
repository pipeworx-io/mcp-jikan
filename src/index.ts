/**
 * Jikan MCP — wraps the Jikan v4 API (anime/manga data, free, no auth)
 *
 * Tools:
 * - search_anime: search anime by title
 * - get_anime: get full details for a specific anime by MAL ID
 * - top_anime: get top-ranked anime, optionally filtered by type
 * - search_characters: search anime/manga characters by name
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE = 'https://api.jikan.moe/v4';

// ── API Response Types ────────────────────────────────────────────────

type JikanPagination = {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: { count: number; total: number; per_page: number };
};

type AnimeImages = {
  jpg: { image_url: string; small_image_url: string; large_image_url: string };
  webp: { image_url: string; small_image_url: string; large_image_url: string };
};

type AnimeTitle = { type: string; title: string };

type AnimeEntry = {
  mal_id: number;
  url: string;
  images: AnimeImages;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  titles: AnimeTitle[];
  type: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  synopsis: string | null;
  year: number | null;
  genres: Array<{ mal_id: number; type: string; name: string }>;
};

type AnimeFullEntry = AnimeEntry & {
  background: string | null;
  season: string | null;
  studios: Array<{ mal_id: number; name: string }>;
  duration: string | null;
  rating: string | null;
};

type CharacterEntry = {
  mal_id: number;
  url: string;
  images: { jpg: { image_url: string }; webp: { image_url: string } };
  name: string;
  name_kanji: string | null;
  nicknames: string[];
  favorites: number;
  about: string | null;
};

type JikanListResponse<T> = {
  data: T[];
  pagination: JikanPagination;
};

type JikanSingleResponse<T> = {
  data: T;
};

// ── Tool Definitions ──────────────────────────────────────────────────

const tools: McpToolExport['tools'] = [
  {
    name: 'search_anime',
    description:
      'Search anime by title using MyAnimeList data. Returns title, score, type, episode count, status, synopsis, and genres.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Anime title to search for (e.g., "Fullmetal Alchemist")' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_anime',
    description:
      'Get full details for a specific anime by its MyAnimeList ID. Includes score, synopsis, genres, studios, episodes, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'MyAnimeList anime ID (e.g., 5114 for Fullmetal Alchemist: Brotherhood)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'top_anime',
    description:
      'Get the top-ranked anime from MyAnimeList, optionally filtered by type (tv, movie, ova, special, ona, music).',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Filter by anime type: tv, movie, ova, special, ona, music. Omit for all types.',
        },
      },
      required: [],
    },
  },
  {
    name: 'search_characters',
    description:
      'Search anime and manga characters by name. Returns name, nicknames, favorites count, and a brief biography.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Character name to search for (e.g., "Naruto")' },
      },
      required: ['query'],
    },
  },
];

// ── Tool Implementations ──────────────────────────────────────────────

function mapAnime(a: AnimeEntry) {
  return {
    mal_id: a.mal_id,
    title: a.title,
    title_english: a.title_english ?? null,
    title_japanese: a.title_japanese ?? null,
    type: a.type ?? null,
    source: a.source ?? null,
    episodes: a.episodes ?? null,
    status: a.status ?? null,
    airing: a.airing,
    score: a.score ?? null,
    scored_by: a.scored_by ?? null,
    rank: a.rank ?? null,
    popularity: a.popularity ?? null,
    synopsis: a.synopsis ?? null,
    year: a.year ?? null,
    genres: a.genres.map((g) => g.name),
    image_url: a.images.jpg.image_url,
    url: a.url,
  };
}

async function searchAnime(query: string) {
  const params = new URLSearchParams({ q: query, limit: '10' });
  const res = await fetch(`${BASE}/anime?${params}`);
  if (!res.ok) throw new Error(`Jikan anime search error: ${res.status}`);

  const data = (await res.json()) as JikanListResponse<AnimeEntry>;

  return {
    total: data.pagination.items.total,
    results: data.data.map(mapAnime),
  };
}

async function getAnime(id: number) {
  const res = await fetch(`${BASE}/anime/${id}/full`);
  if (res.status === 404) throw new Error(`Anime not found: MAL ID ${id}`);
  if (!res.ok) throw new Error(`Jikan anime error: ${res.status}`);

  const data = (await res.json()) as JikanSingleResponse<AnimeFullEntry>;
  const a = data.data;

  return {
    ...mapAnime(a),
    background: a.background ?? null,
    season: a.season ?? null,
    duration: a.duration ?? null,
    rating: a.rating ?? null,
    studios: a.studios.map((s) => s.name),
  };
}

async function topAnime(type?: string) {
  const params = new URLSearchParams({ limit: '10' });
  if (type) params.set('type', type);

  const res = await fetch(`${BASE}/top/anime?${params}`);
  if (!res.ok) throw new Error(`Jikan top anime error: ${res.status}`);

  const data = (await res.json()) as JikanListResponse<AnimeEntry>;

  return {
    results: data.data.map(mapAnime),
  };
}

async function searchCharacters(query: string) {
  const params = new URLSearchParams({ q: query, limit: '10' });
  const res = await fetch(`${BASE}/characters?${params}`);
  if (!res.ok) throw new Error(`Jikan character search error: ${res.status}`);

  const data = (await res.json()) as JikanListResponse<CharacterEntry>;

  return {
    total: data.pagination.items.total,
    results: data.data.map((c) => ({
      mal_id: c.mal_id,
      name: c.name,
      name_kanji: c.name_kanji ?? null,
      nicknames: c.nicknames,
      favorites: c.favorites,
      about: c.about ?? null,
      image_url: c.images.jpg.image_url,
      url: c.url,
    })),
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_anime':
      return searchAnime(args.query as string);
    case 'get_anime':
      return getAnime(args.id as number);
    case 'top_anime':
      return topAnime(args.type as string | undefined);
    case 'search_characters':
      return searchCharacters(args.query as string);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool } satisfies McpToolExport;
