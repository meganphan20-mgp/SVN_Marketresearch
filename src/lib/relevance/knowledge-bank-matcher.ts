import { SOJITZ_VIETNAM_DIVISIONS, SojitzDivision } from '@/lib/ai/knowledge/sojitz-context';
import { ArticleExtractionRecord } from '@/types/extraction';
import { MatchedCompanyRef, MatchedSectorRef } from '@/types/relevance';
import { getPostgresPool } from '@/lib/database/postgres';

export interface KnowledgeBankMatchResult {
  matchedDivisions: Array<{ code: string; name: string }>;
  matchedAssets: string[];
  matchedCompetitors: string[];
  matchedPriorities: string[];
  matchedCompanies: MatchedCompanyRef[];
  primarySector: MatchedSectorRef | null;
  secondarySectors: MatchedSectorRef[];
}

// Known Sojitz Assets and Key Joint Ventures in Vietnam
const SOJITZ_ASSETS = [
  { name: 'Long Đức Industrial Park', division: 'INFRA_LOGISTICS', regex: /(?:Long Đức|Long Duc|KCN Long Đức|KCN Long Duc)/i },
  { name: 'Phú Mỹ 3 BOT Power Plant', division: 'ENERGY', regex: /(?:Phú Mỹ 3|Phu My 3)/i },
  { name: 'Hương Thủy Distribution (Huong Thuy)', division: 'FOOD_RETAIL', regex: /(?:Hương Thủy|Huong Thuy)/i },
  { name: 'Vinabeef Meat Processing', division: 'FOOD_RETAIL', regex: /(?:Vinabeef|Vilico.*bò|Vilico.*thịt bò)/i },
  { name: 'Japan Vietnam Fertilizer (JVF)', division: 'CHEMICALS', regex: /(?:JVF|Japan Vietnam Fertilizer|Phân bón Việt Nhật)/i },
  { name: 'Ministop Vietnam', division: 'FOOD_RETAIL', regex: /(?:Ministop)/i },
  { name: 'Sojitz Plastics Vietnam', division: 'CHEMICALS', regex: /(?:Sojitz Plastics)/i },
];

// Major Japanese Sogo Shosha (Direct Competitors)
const JAPANESE_SOGO_SHOSHA = [
  { name: 'Mitsubishi Corporation', regex: /(?:Mitsubishi Corporation|Tập đoàn Mitsubishi)/i },
  { name: 'Mitsui & Co.', regex: /(?:Mitsui & Co|Tập đoàn Mitsui)/i },
  { name: 'Sumitomo Corporation', regex: /(?:Sumitomo Corporation|Tập đoàn Sumitomo)/i },
  { name: 'Itochu Corporation', regex: /(?:Itochu Corporation|Tập đoàn Itochu)/i },
  { name: 'Marubeni Corporation', regex: /(?:Marubeni Corporation|Tập đoàn Marubeni)/i },
  { name: 'Toyota Tsusho', regex: /(?:Toyota Tsusho)/i },
];

/**
 * Matches extracted facts and entities against Sojitz Vietnam Knowledge Bank,
 * active sectors, and watchlist companies.
 */
export async function matchKnowledgeBank(
  extraction: ArticleExtractionRecord,
  title?: string
): Promise<KnowledgeBankMatchResult> {
  const titleText = (title || '').toLowerCase();
  const fullText = `${titleText}\n${extraction.source_url}\n${extraction.geographies.join(' ')}\n${extraction.entities.map(e => e.name).join(' ')}\n${extraction.verified_facts.map(f => typeof f === 'string' ? f : (f?.claim_text || '')).join(' ')}\n${extraction.explicit_company_statements.map(f => typeof f === 'string' ? f : (f?.claim_text || '')).join(' ')}`;

  const matchedAssets: string[] = [];
  const matchedCompetitors: string[] = [];
  const matchedPriorities: string[] = [];
  const matchedDivCodes = new Set<string>();

  // 1. Asset Matching
  for (const asset of SOJITZ_ASSETS) {
    if (asset.regex.test(fullText)) {
      matchedAssets.push(asset.name);
      matchedDivCodes.add(asset.division);
    }
  }

  // 2. Competitor Matching
  for (const comp of JAPANESE_SOGO_SHOSHA) {
    if (comp.regex.test(fullText)) {
      matchedCompetitors.push(comp.name);
    }
  }

  // 3. Division & Priority Matching
  for (const div of SOJITZ_VIETNAM_DIVISIONS) {
    let divMatches = false;

    // Check strategic priorities keywords
    for (const prio of div.strategicPriorities) {
      const keywords = prio.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matches = keywords.filter(kw => fullText.toLowerCase().includes(kw));
      if (matches.length >= 2) {
        matchedPriorities.push(`${div.name}: ${prio}`);
        divMatches = true;
      }
    }

    // Check target partners
    for (const partner of div.targetPartners) {
      if (new RegExp(`\\b${partner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(fullText)) {
        matchedPriorities.push(`Partner Link: ${partner} (${div.name})`);
        divMatches = true;
      }
    }

    // Check specific event type affinity
    if (div.code === 'ENERGY' && (extraction.primary_event_type === 'ENERGY_PROJECT' || extraction.secondary_event_types.includes('ENERGY_PROJECT') || fullText.toLowerCase().includes('dppa'))) {
      divMatches = true;
    }
    if (div.code === 'INFRA_LOGISTICS' && (extraction.primary_event_type === 'LOGISTICS_PROJECT' || extraction.primary_event_type === 'NEW_FACTORY' || fullText.toLowerCase().includes('long đức') || fullText.toLowerCase().includes('khu công nghiệp'))) {
      divMatches = true;
    }
    if (div.code === 'FOOD_RETAIL' && (fullText.toLowerCase().includes('thực phẩm') || fullText.toLowerCase().includes('cà phê') || fullText.toLowerCase().includes('coffee') || fullText.toLowerCase().includes('fmcg') || fullText.toLowerCase().includes('bán lẻ') || fullText.toLowerCase().includes('retail') || fullText.toLowerCase().includes('f&b') || fullText.toLowerCase().includes('agri-processing') || fullText.toLowerCase().includes('nestlé') || fullText.toLowerCase().includes('nestle'))) {
      divMatches = true;
    }

    if (divMatches) {
      matchedDivCodes.add(div.code);
    }
  }

  const matchedDivisions = SOJITZ_VIETNAM_DIVISIONS
    .filter(d => matchedDivCodes.has(d.code))
    .map(d => ({ code: d.code, name: d.name }));

  // 4. Match Companies against Database public.companies
  const pool = getPostgresPool();
  const matchedCompanies: MatchedCompanyRef[] = [];

  try {
    const compRes = await pool.query(`
      SELECT id, name, origin, aliases 
      FROM public.companies 
      WHERE is_active = true;
    `);

    for (const comp of compRes.rows) {
      const namesToTest = [comp.name, ...(comp.aliases || [])];
      for (const alias of namesToTest) {
        if (alias.length >= 3 && new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(fullText)) {
          // Identify role from extraction entities if available
          const foundEnt = extraction.entities.find(e => e.name.toLowerCase() === alias.toLowerCase() || e.name.toLowerCase() === comp.name.toLowerCase());
          matchedCompanies.push({
            company_id: comp.id,
            name: comp.name,
            origin: comp.origin,
            role: foundEnt ? foundEnt.role_in_event : 'SUBJECT',
          });
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error matching companies from database:', err);
  }

  // 5. Match Sectors against Database public.sectors
  let primarySector: MatchedSectorRef | null = null;
  const secondarySectors: MatchedSectorRef[] = [];

  try {
    const secRes = await pool.query(`
      SELECT id, name, slug, priority, keywords 
      FROM public.sectors 
      WHERE is_active = true 
      ORDER BY display_order ASC;
    `);

    const sectorsWithScore: Array<{ sector: MatchedSectorRef; score: number }> = [];

    for (const sec of secRes.rows) {
      let score = 0;
      const secKeywords = [sec.name, sec.slug, ...(sec.keywords || [])];

      for (const kw of secKeywords) {
        if (kw.length >= 3) {
          const kwRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (titleText && kwRegex.test(titleText)) {
            score += 25; // Keywords in title indicate the primary subject of the story
          } else if (kwRegex.test(fullText)) {
            score += 5;
          }
        }
      }

      // Extraction sector name match
      if (extraction.sectors.some(s => s.toLowerCase() === sec.name.toLowerCase())) {
        score += 15;
      }

      if (score > 0) {
        sectorsWithScore.push({
          sector: {
            sector_id: sec.id,
            name: sec.name,
            slug: sec.slug,
            priority: sec.priority,
          },
          score,
        });
      }
    }

    sectorsWithScore.sort((a, b) => b.score - a.score);

    if (sectorsWithScore.length > 0) {
      primarySector = sectorsWithScore[0].sector;
      for (let i = 1; i < Math.min(4, sectorsWithScore.length); i++) {
        secondarySectors.push(sectorsWithScore[i].sector);
      }
    }
  } catch (err) {
    console.error('Error matching sectors from database:', err);
  }

  return {
    matchedDivisions,
    matchedAssets,
    matchedCompetitors,
    matchedPriorities,
    matchedCompanies,
    primarySector,
    secondarySectors,
  };
}
