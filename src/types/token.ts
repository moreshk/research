export type SortField = 'price' | 'price_change_24h' | 'market_cap' | 'breakout_score' | 'cyberIndex' | null;
export type SortDirection = 'asc' | 'desc';
export type FilterType = 'all' | 'agent' | 'framework' | 'application' | 'meme' | 'kol' | 'defi';

export interface Token {
  id: number;
  name: string;
  symbol: string;
  type?: string;
  contract_address: string;
  chain: string;
  ecosystem: string;
  price?: number | null;
  price_change_24h?: number | null;
  market_cap?: number | null;
  breakout_score: number;
  is_agent: boolean;
  is_framework: boolean;
  is_application: boolean;
  is_meme: boolean;
  image_url?: string;
  project_desc?: string;
  github_url?: string;
  twitter_url?: string;
  dexscreener_url?: string;
  price_score: number | null;
  volume_score: number | null;
  buy_sell_score: number | null;
  wallet_score: number | null;
  trade_score: number | null;
  is_kol: boolean;
  is_defi: boolean;
  [key: string]: any;
}

export interface TokensResponse {
  tokens: Token[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  cached: boolean;
  timestamp: number;
} 