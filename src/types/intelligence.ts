export type SourceTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'DISCOVERY';

export type VerificationStatus = 
  | 'VERIFIED' 
  | 'PARTIALLY_VERIFIED' 
  | 'SINGLE_SOURCE' 
  | 'CONFLICTING' 
  | 'UNVERIFIED';

export type BusinessImpactType = 
  | 'OPPORTUNITY' 
  | 'PARTNERSHIP' 
  | 'MA_INVESTMENT' 
  | 'COMPETITOR_MOVEMENT' 
  | 'RISK' 
  | 'MARKET_INTELLIGENCE';

export interface ExtractedFacts {
  dealValueUsd?: number | null;
  dealValueText?: string | null;
  stakePercentage?: number | null;
  capacityOrSize?: string | null;
  location?: string | null;
  announcedTimeline?: string | null;
  keyPartners?: string[];
  keyQuotes?: string[];
}

export interface DetectedConflict {
  field: string;
  sourceA: { name: string; claim: string; url?: string };
  sourceB: { name: string; claim: string; url?: string };
  discrepancyNote: string;
}

export type SourceAuditStatus = 
  | 'VERIFIED'
  | 'VERIFIED_REDIRECT'
  | 'SOURCE_NOT_VERIFIED'
  | 'PARTIAL_MATCH'
  | 'CONTENT_MISMATCH'
  | 'NOT_FOUND'
  | 'REMOVED'
  | 'ACCESS_BLOCKED'
  | 'PAYWALL'
  | 'AUTH_REQUIRED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_URL';

export type LinkIntegrityStatus = 
  | SourceAuditStatus
  | 'VERIFIED_MATCH' 
  | 'UNREACHABLE' 
  | 'PENDING_AUDIT';

export type ClaimVerificationStatus =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'NOT_SUPPORTED'
  | 'CONTRADICTED'
  | 'NOT_CHECKABLE';

export interface ClaimAuditResult {
  claim: string;
  status: ClaimVerificationStatus;
  evidence: string;
}

export interface SourceLinkAuditOutput {
  source_name: string;
  original_url: string;
  final_url: string;
  canonical_url: string;

  http_status: number | null;

  audit_status: SourceAuditStatus;

  url_repaired: boolean;
  replacement_url: string | null;

  page_title: string;
  publication_date: string;

  title_match_score: number;
  entity_match_score: number;
  event_match_score: number;
  claim_match_score: number;
  date_match_score: number;

  content_alignment_score: number;

  claim_results: ClaimAuditResult[];

  counts_as_verified_source: boolean;

  failure_reason: string | null;

  audit_notes: string;
}

export type ArticlePublicationStatus = 
  | 'MULTI_SOURCE_VERIFIED' 
  | 'SINGLE_SOURCE_VERIFIED' 
  | 'NO_VERIFIED_SOURCE';

export interface CleanedSource {
  publisher: string;
  article_title: string;
  publication_date: string;
  access_url: string;
  canonical_url: string;
  http_status: number;
  content_alignment_score: number;
  status: 'VERIFIED';
}

export interface RemovedSourceLog {
  publisher: string;
  reason: string;
}

export interface ArticleSourceAuditAndCleanupResult {
  article_id: string;
  article_status: ArticlePublicationStatus;
  verified_source_count: number;
  sources: CleanedSource[];
  removed_sources: RemovedSourceLog[];
}

/**
 * SECTION 7 — SOURCE REQUIREMENT
 * Every validated source record MUST contain these fields.
 * validated_url must be a URL that was successfully opened and parsed.
 */
export interface ValidatedSourceRecord {
  source_id: string;
  publisher: string;
  source_title: string;
  published_at: string;
  validated_url: string;
  canonical_url: string;
  validation_timestamp: string;
  http_status: number;
  content_hash: string;
  article_body: string;
  word_count?: number;
  language?: string;
  source_tier?: SourceTier;
}

export interface StorySourceLink {
  id: string;
  sourceId?: string; // alias for source_id (Section 7)
  sourceName: string; // publisher (Section 7)
  publisher?: string;
  sourceTier: SourceTier;
  articleTitle: string; // source_title (Section 7)
  sourceTitle?: string;
  articleUrl: string; // validated_url (Section 7)
  validatedUrl?: string;
  canonicalUrl?: string; // canonical_url (Section 7)
  publishedAt: string; // published_at (Section 7)
  validationTimestamp?: string; // validation_timestamp (Section 7)
  httpStatus?: number; // http_status (Section 7)
  contentHash?: string; // content_hash (Section 7)
  articleBodySnippet?: string;
  accessUrl?: string; // direct public clickable link
  isPrimaryClaimSource?: boolean;
  
  // Cross-Check & Link Content Verification
  linkStatus?: LinkIntegrityStatus;
  isContentMatched?: boolean;
  contentMatchScore?: number; // 0 to 100
  matchedKeywords?: string[];
  claimSnippet?: string;
  editorReviewed?: boolean;
  auditedAt?: string;
  fullAuditOutput?: SourceLinkAuditOutput;

  // Phase 3.1 Strict Calendar-Date Gating
  sourcePublicationDateLocal?: string; // YYYY-MM-DD in Asia/Ho_Chi_Minh
  firstSeenAt?: string;

  // Phase 3.2 Source-Event Alignment & Role Classification
  sourceRole?: SourceRole; // 'PRIMARY' | 'CORROBORATING' | 'BACKGROUND'
  eventMatchScore?: number; // 0 to 100
  supportedCoreClaimIds?: string[];
  isUrlValid?: boolean;
  isEventMatched?: boolean;
  isCoreClaimSupported?: boolean;
}

export type SourceRole = 'PRIMARY' | 'CORROBORATING' | 'BACKGROUND';

export interface MentionedCompanyRef {
  id: string;
  name: string;
  slug: string;
  ticker?: string;
  origin: 'VIETNAM' | 'JAPANESE_TRADING_HOUSE' | 'GLOBAL_OTHER';
  role?: string;
}

export interface IntelligenceStory {
  id: string;
  title: string;
  slug: string;
  publicationDate: string; // ISO format YYYY-MM-DD
  storyDate: string;
  country: string;
  category: string;
  primarySectorId?: string;
  primarySectorName: string;
  primarySectorSlug: string;
  secondarySectors?: string[];
  companiesMentioned: MentionedCompanyRef[];
  
  // Executive AI Synthesis
  summary: string;
  whyItMattersToSojitz: string;
  businessImpact: BusinessImpactType;
  suggestedBdAction: string;
  relevanceScore: number; // 1 to 10
  
  // Source Verification Engine Outputs
  verificationStatus: VerificationStatus;
  confidenceScore: number; // 0 to 100
  verificationRationale: string;
  extractedFacts: ExtractedFacts;
  detectedConflicts: DetectedConflict[];
  
  // Linked Sources
  sources: StorySourceLink[];
  originalUrls: string[];
  
  // Meta & Editorial Review
  aiModelUsed: string;
  dateCollected: string;
  collectionTimestamp: string;
  aiAnalysisTimestamp: string;
    isHighPriority?: boolean;
  isEditorApproved?: boolean;
  editorNotes?: string;
  sourceAuditStatus?: 'AUDITED' | 'NEEDS_REVIEW' | 'FLAGGED';

  // Step 7 & 10 Publication & Cleanup Fields
  articleStatus?: ArticlePublicationStatus;
  verifiedSourceCount?: number;
  removedSourcesLog?: RemovedSourceLog[];
  isPublished?: boolean;
  isLegacy?: boolean;
  sourceGrounded?: boolean;
  ingestionPipelineVersion?: string;

  // Phase 3.1 Strict Calendar-Date Gating & Temporal Deduplication Fields
  sourcePublicationDateLocal?: string; // YYYY-MM-DD in Asia/Ho_Chi_Minh
  dailyBriefDate?: string;             // YYYY-MM-DD in Asia/Ho_Chi_Minh
  eventDate?: string;                  // YYYY-MM-DD actual event date
  firstSeenAt?: string;                // ISO timestamp
  lastVerifiedAt?: string;             // ISO timestamp
  eventFingerprint?: string;           // Semantic event hash
  materialUpdate?: boolean;            // true if today's source contains material new verified fact
  materialUpdateRationale?: string;   // Explanation of what material fact was updated

  // Phase 3.2 Canonical Event Cluster
  clusterId?: string;                  // Reference to public.event_clusters
}

export interface EventCluster {
  id: string;
  eventFingerprint: string;
  primaryEventType: string;
  primaryEntities: Array<{ name: string; role?: string }>;
  eventDate?: string;
  geography?: string;
  projectOrAsset?: string;
  canonicalCoreClaims: Array<{ id: string; claim: string; verified: boolean }>;
  rawArticleIds: string[];
  sourceIds: string[];
  canonicalStoryId?: string;
  materialUpdateVersion: number;
  firstSeenAt: string;
  latestUpdateAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardKpis {
  articlesScanned: number;
  intelligenceStories: number;
  highPriorityStories: number;
  opportunitiesCount: number;
  risksCount: number;
  maActivityCount: number;
  verifiedCount: number;
}

export interface StoryFilterParams {
  query?: string;
  category?: string;
  sectorSlug?: string;
  companySlug?: string;
  country?: string;
  impact?: BusinessImpactType;
  verificationStatus?: VerificationStatus;
  minRelevance?: number;
  timeframe?: 'today' | 'week' | 'month' | 'all';
  dailyBriefDate?: string;
}

export type FeedbackVote = 'USEFUL' | 'NOT_USEFUL';

export type NotUsefulReason = 
  | 'Not relevant to Sojitz'
  | 'Already known'
  | 'Too generic'
  | 'Too old'
  | 'Weak analysis'
  | 'Wrong sector/company'
  | 'Other';

export interface StoryFeedback {
  id: string;
  storyId: string;
  vote: FeedbackVote;
  reason?: NotUsefulReason;
  comment?: string;
  userId?: string;
  anonymousSessionId: string;
  timestamp: string;
}

export interface DiscoveredArticleCandidate {
  sourceId: string;
  sourceName: string;
  sourceTier: SourceTier;
  sourceDomain?: string;
  allowedDomains?: string[];
  discoveredUrl: string;
  discoveredTitle?: string;
  publishedAt?: string;
  discoveryMethod: 'RSS' | 'SECTION_SCRAPE' | 'API' | 'SITEMAP';
}

export interface ArticlePageValidationResult {
  isValidArticlePage: boolean;
  httpStatusOk: boolean;
  domainMatch: boolean;
  notSpecialPage: boolean; // not homepage, category, search, tag, login, error
  titleValid: boolean;
  wordCount: number;
  wordCountOk: boolean; // >= 150 words
  publicationMetadataFound: boolean;
  titleBodyConsistencyScore: number; // 0 to 100
  titleBodyConsistent: boolean;
  failureReasons: string[];
}

export type FreshnessBucket = 
  | 'TODAY'           // 0–24 hours
  | 'RECENT'          // >24–72 hours
  | 'WEEKLY_CONTEXT'  // >72 hours–7 days
  | 'BACKGROUND'      // >7–30 days
  | 'ARCHIVE';        // >30 days

export interface RawArticle {
  id: string;
  sourceId: string;
  source_id?: string;
  sourceCode?: string;
  publisher: string;
  title: string;
  originalTitle?: string;
  originalUrl: string;
  url: string;
  canonicalUrl?: string | null;
  finalUrl: string;
  httpStatus: number;
  publishedAt: string | null;
  fetchedAt: string;
  dateExtractionSource: 'OPEN_GRAPH' | 'JSON_LD' | 'RSS_PUBDATE' | 'HTML_TIME' | 'NONE';
  publishedAtDeltaHours: number | null;
  isTimestampSuspicious: boolean;
  articleAgeHours?: number | null;
  freshnessBucket?: FreshnessBucket;
  rawContent: string;
  rawContentBytes: number;
  rawContentTruncated: boolean;
  cleanedContent: string;
  contentHash: string;
  fetchStatus: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  fetchVerified: boolean;
  isArticlePage: boolean;
  validationDetails?: ArticlePageValidationResult;
  validationMetadata?: Record<string, any>;
  author?: string | null;
  clusterId?: string | null;
  createdAt?: string;

  // Phase 3.1 Strict Calendar-Date Gating
  sourcePublicationDateLocal?: string | null;
  firstSeenAt?: string;
}

