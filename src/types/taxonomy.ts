export type SectorPriority = 'PRIORITY_1' | 'PRIORITY_2' | 'MONITORING';

export type CompanyOrigin = 'VIETNAM' | 'JAPANESE_TRADING_HOUSE' | 'GLOBAL_OTHER';

export interface Sector {
  id: string;
  name: string;
  slug: string;
  priority: SectorPriority;
  description?: string;
  keywords?: string[];
  isActive: boolean;
  displayOrder: number;
  storyCount?: number;
}

export interface WatchlistCompany {
  id: string;
  name: string;
  ticker?: string;
  slug: string;
  origin: CompanyOrigin;
  aliases: string[];
  industryId?: string;
  industryName?: string;
  description?: string;
  websiteUrl?: string;
  isActive: boolean;
  storyCount?: number;
}

export interface NewsSourceConfig {
  id: string;
  name: string;
  domain: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'DISCOVERY';
  description?: string;
  trustWeight?: number;
  rssUrl?: string;
  allowedDomains?: string[];
  isOfficialIr: boolean;
  isActive: boolean;
  lastScrapedAt?: string;
  articleCount?: number;
}
