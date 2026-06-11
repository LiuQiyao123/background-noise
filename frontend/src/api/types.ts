export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatarUrl: string | null;
  defaultVisibility?: 'PRIVATE' | 'PUBLIC_TO_SHOW';
  createdAt?: string;
  expressionPersona?: string | null;
}

export interface VibeDistribution {
  [key: string]: number;
}

export interface ShowStats {
  publicRepoCount: number;
  wantToSeeCount: number;
  attendedCount: number;
  avgVibe: {
    band: number | null;
    sound: number | null;
    atmosphere: number | null;
  };
  vibeDistribution?: {
    band: VibeDistribution;
    sound: VibeDistribution;
    atmosphere: VibeDistribution;
  };
}

export interface Show {
  id: string;
  artistName: string;
  venueName: string;
  showDate: string;
  city: string | null;
  description: string | null;
  stats?: ShowStats;
  coverUrl?: string | null;
  myInterests?: ('WANT_TO_SEE' | 'ATTENDED')[];
}

export interface RepoMedia {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  sortOrder: number;
  tags?: string[];
}

export interface RepoUser {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

export interface Repo {
  id: string;
  userId: string;
  showId: string;
  body: string | null;
  memoryHook: string;
  memoryTemplate?: string | null;
  memoryHookLikeCount?: number;
  memoryHookLikedByMe?: boolean;
  vibeBand: number;
  vibeSound: number;
  vibeAtmosphere: number;
  visibility: 'PRIVATE' | 'PUBLIC';
  likeCount: number;
  commentCount: number;
  sameShowLikesCount?: number;
  createdAt: string;
  user?: RepoUser;
  show?: Pick<Show, 'id' | 'artistName' | 'venueName' | 'showDate' | 'city'>;
  media?: RepoMedia[];
  likedByMe?: boolean;
}

export interface MemoryWallItem {
  memoryHook: string;
  count: number;
}

export interface CommentReply {
  id: string;
  body: string;
  createdAt: string;
  user: RepoUser;
  isSameShowUser?: boolean;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: RepoUser;
  isSameShowUser?: boolean;
  replies?: CommentReply[];
}

export interface DiscoverFeed {
  upcoming: Show[];
  hotShows: Show[];
  recentRepos: Repo[];
  blindBox?: BlindBox | null;
  matches?: MatchCard[];
}

export interface UserStats {
  attendedShows: number;
  wantToSeeCount: number;
  uniqueVenues: number;
  repoCount: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ─── v0.2 新类型 ───

export interface MatchCard {
  id: string;
  matchLevel: number;
  similarityScore: number | null;
  show: { id: string; artistName: string; venueName: string; showDate: string };
  otherUser: RepoUser;
  otherMemoryHook: string;
  matchedAt: string;
  status: 'PENDING' | 'CONNECTED' | 'DISMISSED';
}

export interface BlindBox {
  id: string;
  matchLevel: number;
  show: { artistName: string; venueName: string; showDate: string };
  memoryHook: string;
}

export interface MatchList {
  items: MatchCard[];
  total: number;
  page: number;
  limit: number;
}

export interface AiExpandResult {
  versions: { style: string; preview: string }[];
}

export interface AiTagResult {
  tags: string[];
}
