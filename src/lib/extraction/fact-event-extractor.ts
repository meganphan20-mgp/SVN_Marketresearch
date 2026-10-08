import { RawArticle } from '@/types/intelligence';
import { 
  ArticleExtractionRecord, 
  EventType, 
  EventStatus, 
  ExtractedEntity, 
  ExtractedNumericFact, 
  ExtractedClaim,
  NumericQualifier,
  EventRole,
  isValidEventType,
  isValidEventRole
} from '@/types/extraction';

/**
 * PHASE 2A.1 FACT & EVENT EXTRACTION ENGINE
 * 
 * Strict Principles:
 * - Factual extraction ONLY ("WHAT HAPPENED?").
 * - Does NOT answer: "WHY IT MATTERS", "IS THIS AN OPPORTUNITY", "WHAT BD SHOULD DO".
 * - Exactly ONE valid primary_event_type (no composite values).
 * - Entity classification separated from event role (controlled EventRole).
 * - Claim-level provenance (exact offsets, source IDs, raw article IDs).
 * - Numeric facts preserve qualifiers (UP_TO, APPROXIMATELY, etc.).
 * - event_date represents event occurrence only (never defaults to published_at).
 * - extraction_quality_score is null for non-events.
 */

// Known Vietnamese Provinces, Municipalities and Key Economic Zones
const KNOWN_GEOGRAPHIES = [
  'Hà Nội', 'Hanoi', 'TP.HCM', 'TP HCM', 'TP Hồ Chí Minh', 'Ho Chi Minh City', 'HCMC',
  'Đà Nẵng', 'Da Nang', 'Hải Phòng', 'Hai Phong', 'Cần Thơ', 'Can Tho',
  'Bình Dương', 'Binh Duong', 'Đồng Nai', 'Dong Nai', 'Bà Rịa - Vũng Tàu', 'Ba Ria - Vung Tau',
  'Long An', 'Bắc Ninh', 'Bac Ninh', 'Bắc Giang', 'Bac Giang', 'Quảng Ninh', 'Quang Ninh',
  'Thái Nguyên', 'Thai Nguyen', 'Hải Dương', 'Hai Duong', 'Hưng Yên', 'Hung Yen',
  'Vĩnh Phúc', 'Vinh Phuc', 'Nam Định', 'Thái Bình', 'Ninh Bình', 'Thanh Hóa', 'Nghệ An',
  'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Quảng Nam', 'Quảng Ngãi',
  'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Lâm Đồng',
  'Tây Ninh', 'Bình Phước', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long',
  'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau', 'Kiên Giang', 'An Giang', 'Đồng Tháp',
  'Việt Nam', 'Vietnam', 'Singapore', 'Mỹ', 'Hoa Kỳ', 'Mỹ (US)', 'US', 'USA', 'Nhật Bản', 'Japan',
  'Hàn Quốc', 'South Korea', 'Trung Quốc', 'China', 'Malaysia', 'Thái Lan', 'Thailand',
  'Indonesia', 'Ấn Độ', 'India', 'Châu Âu', 'EU', 'Đông Anh', 'Long Đức', 'Sentosa Cove'
];

// Government and Regulatory Entities
const GOVERNMENT_PATTERNS = [
  { name: 'Bộ Kế hoạch và Đầu tư (MPI)', subtype: 'MINISTRY', regex: /(?:Bộ Kế hoạch và Đầu tư|Ministry of Planning and Investment|\bMPI\b)/i },
  { name: 'Bộ Công Thương (MOIT)', subtype: 'MINISTRY', regex: /(?:Bộ Công Thương|Ministry of Industry and Trade|\bMOIT\b)/i },
  { name: 'Ngân hàng Nhà nước (SBV)', subtype: 'CENTRAL_BANK', regex: /(?:Ngân hàng Nhà nước|State Bank of Vietnam|\bSBV\b)/i },
  { name: 'Bộ Tài chính (MOF)', subtype: 'MINISTRY', regex: /(?:Bộ Tài chính|Ministry of Finance|\bMOF\b)/i },
  { name: 'Bộ Thương mại Mỹ (US DOC)', subtype: 'GOVERNMENT_DEPARTMENT', regex: /(?:Bộ Thương mại Mỹ|U\.?S\.? Department of Commerce|\bUS DOC\b)/i },
  { name: 'Bộ Giao thông Vận tải (MOT)', subtype: 'MINISTRY', regex: /(?:Bộ Giao thông Vận tải|Ministry of Transport|\bMOT\b)/i },
  { name: 'Chính phủ Việt Nam', subtype: 'GOVERNMENT', regex: /(?:Chính phủ|Thủ tướng Chính phủ|Phó Thủ tướng|Government of Vietnam)/i },
  { name: 'Ủy ban Chứng khoán Nhà nước (SSC)', subtype: 'SECURITIES_REGULATOR', regex: /(?:Ủy ban Chứng khoán|State Securities Commission|\bSSC\b)/i },
  { name: 'Tổng cục Thuế', subtype: 'TAX_AUTHORITY', regex: /(?:Tổng cục Thuế|General Department of Taxation)/i },
  { name: 'Tổng cục Hải quan', subtype: 'CUSTOMS_AUTHORITY', regex: /(?:Tổng cục Hải quan|General Department of Customs)/i },
  { name: 'UBND TP Hà Nội', subtype: 'MUNICIPAL_GOVERNMENT', regex: /(?:UBND TP Hà Nội|Hanoi People's Committee|UBND Hà Nội)/i },
  { name: 'UBND TP.HCM', subtype: 'MUNICIPAL_GOVERNMENT', regex: /(?:UBND TP\.HCM|HCMC People's Committee|UBND TP Hồ Chí Minh)/i },
];

/**
 * Determines primary event type and secondary types based strictly on textual evidence.
 * Enforces EXACTLY ONE valid primary_event_type (no composite values).
 */
export function detectEventTypes(title: string, body: string): {
  primary: EventType;
  secondary: EventType[];
  meaningfulEvent: boolean;
  detectionConfidence: number;
} {
  const text = `${title} \n ${body}`.toLowerCase();

  // Fail-safe check for non-commercial / home design articles
  const isLifestyleOrHomeDesign = 
    (text.includes('ngôi nhà') && text.includes('bán nguyệt') && text.includes('không gian')) ||
    (text.includes('nội thất') && text.includes('phòng khách') && !text.includes('doanh thu') && !text.includes('đầu tư')) ||
    (text.includes('công thức nấu') || text.includes('thời trang dạo phố'));

  if (isLifestyleOrHomeDesign) {
    return {
      primary: 'OTHER',
      secondary: [],
      meaningfulEvent: false,
      detectionConfidence: 95, // High confidence that this is NOT a commercial event
    };
  }

  const scores: Partial<Record<EventType, number>> = {};

  const addScore = (type: EventType, delta: number) => {
    scores[type] = (scores[type] || 0) + delta;
  };

  // Matchers with priority weighting
  // Policy / Regulation
  const isPolicyTitle = /(?:nghị định|thông tư|luật|chính sách|quy định|decree|circular|regulatory framework)\b/i.test(title);
  if (isPolicyTitle) addScore('POLICY_CHANGE', 20);
  if (/(?:nghị định|thông tư|luật|quy định mới|ban hành chính sách|decree|circular|statutory)/i.test(body) && !/(?:public policy|privacy policy)/i.test(body)) addScore('POLICY_CHANGE', 6);

  // Investment / Capex
  if (/(?:đầu tư|investment|rót vốn|capex|vốn đầu tư|capital expenditure)/i.test(title)) addScore('INVESTMENT', 15);
  if (/(?:đầu tư|investment|rót vốn|capex|vốn đầu tư|capital expenditure)/i.test(body)) addScore('INVESTMENT', 5);

  // New Factory / Plant
  if (/(?:nhà máy|factory|plant|cơ sở sản xuất|xây dựng nhà máy)/i.test(title)) addScore('NEW_FACTORY', 15);
  if (/(?:nhà máy|factory|plant|cơ sở sản xuất|xây dựng nhà máy)/i.test(body)) addScore('NEW_FACTORY', 5);

  // Expansion
  if (/(?:mở rộng|expansion|expand|nâng công suất|mở rộng quy mô)/i.test(title)) addScore('EXPANSION', 14);
  if (/(?:mở rộng|expansion|expand|nâng công suất)/i.test(body)) addScore('EXPANSION', 4);

  // M&A
  if (/(?:mua lại|sáp nhập|thâu tóm|chuyển nhượng cổ phần|m&a|acquisition|merger)/i.test(title)) addScore('M&A', 15);
  if (/(?:mua lại|sáp nhập|thâu tóm|chuyển nhượng cổ phần|m&a|acquisition|merger)/i.test(body)) addScore('M&A', 5);

  // Partnership / JV
  if (/(?:hợp tác|liên doanh|partnership|joint venture|ký kết thỏa thuận|bắt tay|cung cấp tàu metro|ties with|cooperation with)/i.test(title)) addScore('PARTNERSHIP', 14);
  if (/(?:hợp tác|liên doanh|partnership|joint venture|ký kết thỏa thuận|deepen.+partnership|expand cooperation)/i.test(body)) addScore('PARTNERSHIP', 5);

  // Financing / Bonds / Shares
  if (/(?:phát hành cổ phiếu|phát hành trái phiếu|gói tín dụng|tín dụng|vay vốn|financing|bond|credit|hoán đổi nợ)/i.test(title)) addScore('FINANCING', 16);
  if (/(?:phát hành cổ phiếu|phát hành trái phiếu|gói tín dụng|tín dụng|vay vốn|financing|bond|credit)/i.test(body)) addScore('FINANCING', 5);

  // Logistics
  if (/(?:cao tốc|thông tuyến|hạ tầng|cảng biển|logistics|kho bãi|giao thông|infrastructure)/i.test(title)) addScore('LOGISTICS_PROJECT', 12);
  if (/(?:cao tốc|thông tuyến|hạ tầng|cảng biển|logistics|kho bãi|giao thông)/i.test(body)) addScore('LOGISTICS_PROJECT', 4);

  // Energy
  if (/(?:điện gió|điện mặt trời|năng lượng|lng|lưới điện|power|solar|wind|energy|dppa)/i.test(title)) addScore('ENERGY_PROJECT', 12);
  if (/(?:điện gió|điện mặt trời|năng lượng|lng|lưới điện|power|solar|wind|energy|dppa)/i.test(body)) addScore('ENERGY_PROJECT', 4);

  // Product Launch
  if (/(?:ra mắt|xuất khẩu sang|bus điện|xe điện|product launch|cung cấp)/i.test(title)) addScore('PRODUCT_LAUNCH', 12);
  if (/(?:ra mắt|xuất khẩu sang|bus điện|xe điện|product launch)/i.test(body)) addScore('PRODUCT_LAUNCH', 4);

  // Real estate project
  if (/(?:dự án|nhà ở xã hội|bất động sản|căn hộ|khu đô thị|project)/i.test(title)) addScore('NEW_PROJECT', 10);
  if (/(?:dự án|nhà ở xã hội|bất động sản|căn hộ|khu đô thị)/i.test(body)) addScore('NEW_PROJECT', 3);

  // Land / property transaction
  if (/(?:put on sale|on sale|bungalow|biệt thự|luxury flat|record flat|bán đấu giá|tender|đấu giá đất|giao đất|land)/i.test(title)) addScore('LAND_TRANSACTION', 15);
  if (/(?:put on sale|on sale|bungalow|biệt thự|luxury flat|record flat|bán đấu giá|tender|đấu giá đất|giao đất|land)/i.test(body)) addScore('LAND_TRANSACTION', 5);

  // Macro / Other
  if (/(?:vn-index|chứng khoán|thị trường|nhập khẩu|xuất khẩu|lạm phát|gdp|kinh tế|record|high)/i.test(title)) addScore('OTHER', 8);

  const sorted = (Object.keys(scores) as EventType[]).sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

  if (sorted.length === 0 || (scores[sorted[0]] || 0) < 4) {
    return {
      primary: 'OTHER',
      secondary: [],
      meaningfulEvent: true,
      detectionConfidence: 80,
    };
  }

  // Exactly ONE enum for primary
  const primary = sorted[0];
  const secondary = sorted.slice(1, 4).filter(t => t !== primary && (scores[t] || 0) >= 4);

  // Strict check: primary must be a valid non-composite event type
  if (!isValidEventType(primary)) {
    throw new Error(`Extraction internal error: produced invalid primary_event_type "${primary}"`);
  }

  return {
    primary,
    secondary,
    meaningfulEvent: true,
    detectionConfidence: 90,
  };
}

/**
 * Determines exact event status strictly from textual evidence.
 */
function detectEventStatus(text: string): EventStatus {
  const lower = text.toLowerCase();

  // Strict distinctions:
  // "plans to" != "approved"
  // "considering" != "confirmed"
  // Check construction / groundbreaking before completion unless explicitly already completed
  if (/(?:khởi công|đang thi công|đang xây dựng|under construction|groundbreaking)/i.test(lower)) {
    return 'UNDER_CONSTRUCTION';
  }
  if (/(?:đã hoàn thành|đã thông tuyến|chính thức đi vào hoạt động|đã khánh thành|has completed|was inaugurated|officially opened)/i.test(lower)) {
    return 'COMPLETED';
  }
  if (/(?:đã phê duyệt|được chấp thuận|được cấp phép|approved|licensed|signed agreement|đã ký kết)/i.test(lower)) {
    return 'APPROVED';
  }
  if (/(?:dự kiến|lên kế hoạch|plans to|plan to|dự định|chuẩn bị)/i.test(lower)) {
    return 'PLANNED';
  }
  if (/(?:đề xuất|kiến nghị|xem xét|proposed|proposes|drafting|lấy ý kiến)/i.test(lower)) {
    return 'PROPOSED';
  }
  if (/(?:đưa ra thị trường|chính thức mở bán|launched|rolls out)/i.test(lower)) {
    return 'LAUNCHED';
  }
  if (/(?:hủy bỏ|dừng triển khai|cancelled|terminated)/i.test(lower)) {
    return 'CANCELLED';
  }
  if (/(?:đang diễn ra|tiếp tục|ongoing)/i.test(lower)) {
    return 'ONGOING';
  }

  return 'ANNOUNCED';
}

/**
 * Extracts entities explicitly mentioned in the text.
 * Strictly separates entity classification (entity_type, entity_subtype) from controlled event roles (role_in_event).
 */
function extractEntities(title: string, body: string, primaryEvent: EventType): ExtractedEntity[] {
  const fullText = `${title}\n${body}`;
  const entities: ExtractedEntity[] = [];
  const seenNames = new Set<string>();

  const addEntity = (
    name: string,
    entity_type: ExtractedEntity['entity_type'],
    entity_subtype: string | null,
    role: EventRole,
    aliases: string[] = []
  ) => {
    const clean = name.trim();
    if (!clean || seenNames.has(clean.toLowerCase()) || clean.length < 3) return;
    seenNames.add(clean.toLowerCase());

    if (!isValidEventRole(role)) {
      throw new Error(`Extraction internal error: invalid EventRole "${role}" for entity "${name}"`);
    }

    entities.push({
      name: clean,
      entity_type,
      entity_subtype,
      role_in_event: role,
      aliases_found: aliases,
    });
  };

  // 1. Government Agencies -> REGULATOR role
  for (const gov of GOVERNMENT_PATTERNS) {
    if (gov.regex.test(fullText)) {
      addEntity(gov.name, 'GOVERNMENT_AGENCY', gov.subtype, 'REGULATOR', []);
    }
  }

  // 2. Specific Known Corporate Enterprises
  const knownEnterprises: Array<{
    name: string;
    subtype: string;
    defaultRole: EventRole;
  }> = [
    { name: 'VinFast', subtype: 'AUTOMOTIVE_MANUFACTURER', defaultRole: 'SUPPLIER' },
    { name: 'Vingroup', subtype: 'CONGLOMERATE', defaultRole: 'PARTNER' },
    { name: 'Alstom', subtype: 'EQUIPMENT_MANUFACTURER', defaultRole: 'SUPPLIER' },
    { name: 'Novaland', subtype: 'REAL_ESTATE_DEVELOPER', defaultRole: 'SUBJECT' },
    { name: 'EVF (EVN Finance)', subtype: 'FINANCIAL_INSTITUTION', defaultRole: 'FINANCIER' },
    { name: 'Tổng công ty Thuốc lá (Vinataba)', subtype: 'STATE_OWNED_ENTERPRISE', defaultRole: 'SUBJECT' },
    { name: 'Sojitz Corporation', subtype: 'TRADING_HOUSE', defaultRole: primaryEvent === 'EXPANSION' || primaryEvent === 'INVESTMENT' ? 'INVESTOR' : 'PARTNER' },
    { name: 'Sumitomo Corporation', subtype: 'TRADING_HOUSE', defaultRole: 'INVESTOR' },
    { name: 'Mitsubishi Corporation', subtype: 'TRADING_HOUSE', defaultRole: 'INVESTOR' },
    { name: 'Mitsui & Co.', subtype: 'TRADING_HOUSE', defaultRole: 'INVESTOR' },
    { name: 'Becamex IDC', subtype: 'INDUSTRIAL_DEVELOPER', defaultRole: 'DEVELOPER' },
    { name: 'Masan Group', subtype: 'CONSUMER_CONGLOMERATE', defaultRole: 'SUBJECT' },
    { name: 'Hoa Phat Group', subtype: 'STEEL_MANUFACTURER', defaultRole: 'SUBJECT' },
    { name: 'FPT Corporation', subtype: 'TECHNOLOGY_COMPANY', defaultRole: 'SUPPLIER' },
    { name: 'Knight Frank', subtype: 'REAL_ESTATE_CONSULTANT', defaultRole: 'SUPPLIER' },
    { name: 'Google', subtype: 'TECHNOLOGY_COMPANY', defaultRole: 'INVESTOR' },
    { name: 'National Innovation Center (NIC)', subtype: 'GOVERNMENT_AGENCY', defaultRole: 'PARTNER' },
    { name: 'Nvidia', subtype: 'TECHNOLOGY_COMPANY', defaultRole: 'PARTNER' },
    { name: 'Samsung', subtype: 'CONGLOMERATE', defaultRole: 'INVESTOR' },
    { name: 'Apple', subtype: 'TECHNOLOGY_COMPANY', defaultRole: 'INVESTOR' },
    { name: 'Intel', subtype: 'SEMICONDUCTOR_MANUFACTURER', defaultRole: 'INVESTOR' },
    { name: 'Foxconn', subtype: 'ELECTRONICS_MANUFACTURER', defaultRole: 'INVESTOR' },
  ];

  for (const ent of knownEnterprises) {
    if (new RegExp(`\\b${ent.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(fullText)) {
      addEntity(ent.name, 'COMPANY', ent.subtype, ent.defaultRole, []);
    }
  }

  // 3. Extracted Corporate mentions by regex
  const corporateRegex = /(?:Tập đoàn|Tổng công ty|Công ty CP|Công ty Cổ phần|Công ty TNHH|Ngân hàng|Group|Corporation|Corp|JSC|Ltd|Co\.)\s+([A-ZÀ-Ỹ0-9][\wÀ-ỹ0-9\s.&-]+?)(?=[,.;\n]|\s+(?:cho biết|vừa|đã|sẽ|ký|thông báo|dự kiến|cho hay|báo cáo))/g;
  let corpMatch;
  while ((corpMatch = corporateRegex.exec(fullText)) !== null) {
    const name = corpMatch[0].replace(/\s+/g, ' ').trim();
    if (name.length > 5 && name.length < 60) {
      addEntity(name, 'COMPANY', 'ENTERPRISE', 'SUBJECT', []);
    }
  }

  // 4. Geographies -> SUBJECT role
  for (const geo of KNOWN_GEOGRAPHIES) {
    if (new RegExp(`\\b${geo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(fullText)) {
      addEntity(geo, 'LOCATION', 'TERRITORY', 'SUBJECT', []);
    }
  }

  // 5. Projects -> SUBJECT role
  const projectRegex = /(?:dự án|cao tốc|tuyến đường|khu đô thị|khu công nghiệp|nhà máy)\s+([A-ZÀ-Ỹ0-9][\wÀ-ỹ0-9\s-]+?)(?=[,.;\n]|\s+(?:có|được|với|đã|đang))/g;
  let projMatch;
  while ((projMatch = projectRegex.exec(fullText)) !== null) {
    const pName = projMatch[0].replace(/\s+/g, ' ').trim();
    if (pName.length > 8 && pName.length < 50) {
      addEntity(pName, 'PROJECT', 'INFRASTRUCTURE', 'SUBJECT', []);
    }
  }

  return entities;
}

/**
 * Extracts explicitly stated numeric facts with normalized numeric_value and qualifiers.
 */
function extractNumericFacts(body: string): ExtractedNumericFact[] {
  const numericFacts: ExtractedNumericFact[] = [];
  const seenFacts = new Set<string>();

  // Regex patterns for explicitly stated amounts, sizes, and percentages
  const patterns = [
    // Monetary amounts (USD, VND, tỷ, triệu, billion, million)
    {
      regex: /(?:khoảng|gần|hơn|tổng cộng|trị giá|quy mô|mức|lên tới|tối đa|up to)?\s*(\$?\d+(?:[.,]\d+)?)\s*(tỷ đồng|nghìn tỷ đồng|triệu đồng|tỷ|triệu|mln|bln|billion|million|USD|VND|EUR|JPY)/gi,
      type: 'TRANSACTION_OR_INVESTMENT_VALUE'
    },
    // Percentages
    {
      regex: /(?:khoảng|ước tính|tối đa|lên tới|hơn|khoảng chừng)?\s*(\d+(?:[.,]\d+)?)\s*(%|phần trăm)/gi,
      type: 'PERCENTAGE_OR_GROWTH'
    },
    // Physical capacity / count (căn, toa, xe, MW, GW, ha, m2, km)
    {
      regex: /(?:lên tới|tối đa|khoảng|hơn|dự kiến|up to)?\s*(\d+(?:[.,]\d+)?)\s*(căn nhà|căn hộ|toa tàu|xe bus|xe buýt|km|hecta|ha|m2|MW|GW|tấn|square feet|modern metro cars|metro cars|bungalows)/gi,
      type: 'PROJECT_CAPACITY_OR_VOLUME'
    }
  ];

  const sentences = body.split(/(?<=[.!?\n])\s+/);

  for (const sentence of sentences) {
    for (const pat of patterns) {
      let m;
      const r = new RegExp(pat.regex);
      while ((m = r.exec(sentence)) !== null) {
        const fullMatch = m[0].trim();
        const rawNumStr = m[1].replace('$', '').replace(/,/g, '.');
        const numVal = parseFloat(rawNumStr);
        const unit = m[2];
        const key = `${fullMatch}-${unit}`;

        if (!seenFacts.has(key) && sentence.length < 300) {
          seenFacts.add(key);

          // Detect Qualifier
          let qualifier: NumericQualifier = 'EXACT';
          const matchAndSurrounding = sentence.slice(Math.max(0, m.index - 20), m.index + fullMatch.length + 10).toLowerCase();

          if (/(?:up to|tối đa|lên tới|đến mức)/i.test(matchAndSurrounding)) {
            qualifier = 'UP_TO';
          } else if (/(?:approximately|khoảng|xấp xỉ|ước tính)/i.test(matchAndSurrounding)) {
            qualifier = 'APPROXIMATELY';
          } else if (/(?:at least|tối thiểu|ít nhất)/i.test(matchAndSurrounding)) {
            qualifier = 'AT_LEAST';
          } else if (/(?:more than|hơn|vượt|trên)/i.test(matchAndSurrounding)) {
            qualifier = 'MORE_THAN';
          } else if (/(?:less than|dưới|thấp hơn|ít hơn)/i.test(matchAndSurrounding)) {
            qualifier = 'LESS_THAN';
          } else if (/(?:expected|dự kiến|kỳ vọng)/i.test(matchAndSurrounding)) {
            qualifier = 'EXPECTED';
          } else if (/(?:target|mục tiêu)/i.test(matchAndSurrounding)) {
            qualifier = 'TARGET';
          }

          let currency: string | null = null;
          if (/usd|\$/i.test(unit) || /usd|\$/i.test(fullMatch)) currency = 'USD';
          else if (/đồng|vnd/i.test(unit)) currency = 'VND';
          else if (/eur/i.test(unit)) currency = 'EUR';
          else if (/jpy/i.test(unit)) currency = 'JPY';

          numericFacts.push({
            fact_type: pat.type,
            raw_value: fullMatch,
            numeric_value: isNaN(numVal) ? null : numVal,
            unit,
            currency,
            qualifier,
            source_text: sentence.trim(),
          });
        }
      }
    }
  }

  return numericFacts.slice(0, 15);
}

/**
 * Splits text into atomic claims with EXACT start/end offsets, strictly separating:
 * - verified_facts
 * - explicit_company_statements
 * - source_attributed_claims
 * - uncertainties
 */
function extractAndClassifyClaims(
  rawArticleId: string,
  sourceId: string,
  sourceUrl: string,
  body: string
): {
  verifiedFacts: ExtractedClaim[];
  explicitStatements: ExtractedClaim[];
  sourceAttributed: ExtractedClaim[];
  uncertainties: ExtractedClaim[];
} {
  const verifiedFacts: ExtractedClaim[] = [];
  const explicitStatements: ExtractedClaim[] = [];
  const sourceAttributed: ExtractedClaim[] = [];
  const uncertainties: ExtractedClaim[] = [];

  const sentences = body
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 350);

  let claimIdx = 1;

  for (const s of sentences) {
    const claimId = `claim-${claimIdx++}`;
    const startOffset = body.indexOf(s);
    const endOffset = startOffset >= 0 ? startOffset + s.length : null;
    const finalStart = startOffset >= 0 ? startOffset : null;

    // 1. Check for Uncertainties / Contingencies / Conditions / Risks
    if (
      /(?:chưa rõ|chưa thể khẳng định|nếu được|phụ thuộc vào|tiềm ẩn rủi ro|còn bỏ ngỏ|subject to|uncertain|unclear|if approved|potential risk|remains uncertain|contingent on)/i.test(s)
    ) {
      uncertainties.push({
        claim_id: claimId,
        claim_text: s,
        evidence_text: s,
        raw_article_id: rawArticleId,
        source_id: sourceId,
        source_url: sourceUrl,
        confidence: 85,
        evidence_start_offset: finalStart,
        evidence_end_offset: endOffset,
      });
      continue;
    }

    // 2. Check for Explicit Company Statements (quotes, company filings, executive remarks)
    if (
      /(?:cho biết|cho hay|phát biểu|khẳng định|nhấn mạnh|chia sẻ|đại diện.*cho biết|spokesperson said|representative said|executive stated|ceo.*said|said in a release|filing stated|management said)/i.test(s)
    ) {
      explicitStatements.push({
        claim_id: claimId,
        claim_text: s,
        evidence_text: s,
        raw_article_id: rawArticleId,
        source_id: sourceId,
        source_url: sourceUrl,
        confidence: 90,
        evidence_start_offset: finalStart,
        evidence_end_offset: endOffset,
      });
      continue;
    }

    // 3. Check for Source-Attributed Claims (analysts, external forecasts, reports, rumors)
    if (
      /(?:theo báo cáo|theo nguồn tin|theo số liệu|theo thống kê|theo đánh giá|chuyên gia.*cho rằng|analysts pointed out|analysts said|according to|cited by|reported by|sources say|forecasts)/i.test(s)
    ) {
      sourceAttributed.push({
        claim_id: claimId,
        claim_text: s,
        evidence_text: s,
        raw_article_id: rawArticleId,
        source_id: sourceId,
        source_url: sourceUrl,
        confidence: 85,
        evidence_start_offset: finalStart,
        evidence_end_offset: endOffset,
      });
      continue;
    }

    // 4. Objective Verified Facts (physical acts, metrics, established parameters)
    if (
      /(?:đã|đang|ký|khởi công|hoàn thành|đạt|chiếm|được thành lập|tổ chức|ban hành|vừa|chính thức|announced|commenced|entered into|placed on the market|appointed)/i.test(s) ||
      /\d+/.test(s)
    ) {
      if (verifiedFacts.length < 15) {
        verifiedFacts.push({
          claim_id: claimId,
          claim_text: s,
          evidence_text: s,
          raw_article_id: rawArticleId,
          source_id: sourceId,
          source_url: sourceUrl,
          confidence: 95,
          evidence_start_offset: finalStart,
          evidence_end_offset: endOffset,
        });
      }
    }
  }

  return {
    verifiedFacts,
    explicitStatements,
    sourceAttributed,
    uncertainties,
  };
}

/**
 * Extracts when the event actually occurred (or is scheduled to occur).
 * Never defaults to published_at.
 */
function detectEventDate(
  body: string
): {
  event_date: string | null;
  event_date_confidence: number | null;
  event_date_source: string | null;
} {
  // 1. Look for explicit dates in body: e.g. "ngày 15/11", "November 15", "ngày 6/10", "tháng 8", "Q3 2027", "2028"
  const tenderCloseMatch = /(?:tender closes on|hạn chót|đến ngày)\s+([A-Za-z]+\s+\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i.exec(body);
  if (tenderCloseMatch) {
    return {
      event_date: tenderCloseMatch[1].trim(),
      event_date_confidence: 85,
      event_date_source: 'EXPLICIT_BODY_DATE',
    };
  }

  const explicitDateMatch = /(?:vào ngày|hôm nay \(|diễn ra ngày|kể từ ngày)\s+(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i.exec(body);
  if (explicitDateMatch) {
    return {
      event_date: explicitDateMatch[1].trim(),
      event_date_confidence: 90,
      event_date_source: 'EXPLICIT_BODY_DATE',
    };
  }

  const monthMatch = /(?:trong tháng|tháng)\s+(\d{1,2}(?:\/\d{4})?)/i.exec(body);
  if (monthMatch) {
    return {
      event_date: `Tháng ${monthMatch[1].trim()}`,
      event_date_confidence: 75,
      event_date_source: 'TEMPORAL_REFERENCE',
    };
  }

  const futureDeliveryMatch = /(?:planned for|giao hàng vào năm|hoạt động từ)\s+(20\d\d|Q[1-4]\s+20\d\d)/i.exec(body);
  if (futureDeliveryMatch) {
    return {
      event_date: futureDeliveryMatch[1].trim(),
      event_date_confidence: 75,
      event_date_source: 'EVENT_TIMELINE',
    };
  }

  // Never default to published_at!
  return {
    event_date: null,
    event_date_confidence: null,
    event_date_source: null,
  };
}

/**
 * Computes Extraction Quality Score based on Section 9 Rubric:
 * Entity extraction quality:      25
 * Event extraction quality:       25
 * Fact traceability:              25
 * Numeric/date accuracy:          15
 * Uncertainty handling:           10
 * Total:                         100
 */
function computeExtractionQualityScore(params: {
  meaningfulEvent: boolean;
  hasEventType: boolean;
  hasEventStatus: boolean;
  entityCount: number;
  hasGeography: boolean;
  factsCount: number;
  numericCount: number;
  uncertaintiesHandled: boolean;
}): {
  score: number | null;
  breakdown: {
    entity_score: number;
    event_score: number;
    traceability_score: number;
    numeric_score: number;
    uncertainty_score: number;
  };
} {
  if (!params.meaningfulEvent) {
    // Score semantics: non-events do not have extraction quality score
    return {
      score: null,
      breakdown: { entity_score: 0, event_score: 0, traceability_score: 0, numeric_score: 0, uncertainty_score: 0 }
    };
  }

  // 1. Entity quality (max 25)
  let entity_score = 0;
  if (params.entityCount >= 3) entity_score = 25;
  else if (params.entityCount >= 2) entity_score = 20;
  else if (params.entityCount >= 1) entity_score = 15;
  else entity_score = 5;

  // 2. Event extraction quality (max 25)
  let event_score = 0;
  if (params.hasEventType && params.hasEventStatus && params.hasGeography) event_score = 25;
  else if (params.hasEventType && params.hasEventStatus) event_score = 20;
  else if (params.hasEventType) event_score = 15;
  else event_score = 5;

  // 3. Fact traceability (max 25)
  let traceability_score = 0;
  if (params.factsCount >= 3) traceability_score = 25;
  else if (params.factsCount >= 1) traceability_score = 20;
  else traceability_score = 5;

  // 4. Numeric & date accuracy (max 15)
  let numeric_score = 0;
  if (params.numericCount >= 2) numeric_score = 15;
  else if (params.numericCount >= 1) numeric_score = 12;
  else numeric_score = 10;

  // 5. Uncertainty handling (max 10)
  const uncertainty_score = params.uncertaintiesHandled ? 10 : 7;

  const total = entity_score + event_score + traceability_score + numeric_score + uncertainty_score;

  return {
    score: Math.min(100, Math.max(0, total)),
    breakdown: {
      entity_score,
      event_score,
      traceability_score,
      numeric_score,
      uncertainty_score,
    }
  };
}

/**
 * EXTRACTS STRUCTURED FACTS AND EVENTS FROM A VERIFIED RAW ARTICLE
 */
export function extractFactsAndEventFromRawArticle(
  article: RawArticle
): ArticleExtractionRecord {
  const title = article.title || '';
  const body = article.cleanedContent || '';

  // 1. Core Event Type Detection (strictly single enum for primary)
  const { 
    primary: primary_event_type, 
    secondary: secondary_event_types, 
    meaningfulEvent,
    detectionConfidence: event_detection_confidence
  } = detectEventTypes(title, body);

  // 2. Event Status
  const event_status = meaningfulEvent ? detectEventStatus(`${title}\n${body.slice(0, 1000)}`) : 'UNKNOWN';

  // 3. Entity Extraction (controlled role_in_event separated from entity_subtype)
  const entities = extractEntities(title, body, primary_event_type);

  // Geographies and Sectors
  const geographies = entities.filter(e => e.entity_type === 'LOCATION').map(e => e.name);
  const sectors: string[] = [];
  const sub_sectors: string[] = [];

  if (primary_event_type === 'ENERGY_PROJECT') sectors.push('Energy', 'Renewable Energy');
  if (primary_event_type === 'LOGISTICS_PROJECT') sectors.push('Logistics', 'Infrastructure');
  if (primary_event_type === 'NEW_FACTORY' || primary_event_type === 'EXPANSION') sectors.push('Manufacturing', 'Industrial Parks');
  if (primary_event_type === 'PRODUCT_LAUNCH') sectors.push('Automotive', 'Consumer');
  if (primary_event_type === 'FINANCING' || primary_event_type === 'M&A') sectors.push('Financial Services', 'Capital Markets');
  if (primary_event_type === 'POLICY_CHANGE' || primary_event_type === 'REGULATION') sectors.push('Macro Economy', 'Regulatory');
  if (primary_event_type === 'NEW_PROJECT' || primary_event_type === 'LAND_TRANSACTION') sectors.push('Real Estate', 'Infrastructure');

  // 4. Numeric Facts with Qualifiers and Normalized Numeric Values
  const numeric_facts = extractNumericFacts(body);

  // 5. Fact / Statement / Uncertainty Separation with Exact Offsets
  const { verifiedFacts, explicitStatements, sourceAttributed, uncertainties } = 
    extractAndClassifyClaims(article.id, article.sourceId, article.url, body);

  // 6. Event Date Detection (never defaults to published_at)
  const { event_date, event_date_confidence, event_date_source } = detectEventDate(body);

  // 7. Extraction Quality Scoring
  const quality = computeExtractionQualityScore({
    meaningfulEvent,
    hasEventType: Boolean(primary_event_type),
    hasEventStatus: event_status !== 'UNKNOWN',
    entityCount: entities.length,
    hasGeography: geographies.length > 0,
    factsCount: verifiedFacts.length,
    numericCount: numeric_facts.length,
    uncertaintiesHandled: true,
  });

  return {
    id: `ext-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    raw_article_id: article.id,
    source_url: article.url,
    publisher: article.publisher,
    published_at: article.publishedAt,
    meaningful_event_detected: meaningfulEvent,
    primary_event_type,
    secondary_event_types,
    event_date,
    event_date_confidence,
    event_date_source,
    event_status,
    sectors: Array.from(new Set(sectors)),
    sub_sectors: Array.from(new Set(sub_sectors)),
    geographies: Array.from(new Set(geographies)),
    entities,
    numeric_facts,
    verified_facts: verifiedFacts,
    explicit_company_statements: explicitStatements,
    source_attributed_claims: sourceAttributed,
    uncertainties,
    event_detection_confidence,
    extraction_quality_score: quality.score,
    extraction_metadata: quality.breakdown,
  };
}
