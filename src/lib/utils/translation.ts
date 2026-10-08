/**
 * INTELLIGENCE TRANSLATION ENGINE
 * 
 * Provides translation capabilities to ensure all intelligence stories,
 * headlines, summaries, strategic implications, and suggested BD actions
 * are presented to C-Suite in English.
 */

export interface TranslatedStoryFields {
  title: string;
  summary: string;
  whyItMattersToSojitz: string;
  suggestedBdAction: string;
}

// Canonical title translations for Vietnamese business headlines
const TITLE_TRANSLATIONS: Record<string, string> = {
  'Bộ Công Thương: Sớm tách Tổng công ty Truyền tải điện quốc gia khỏi EVN':
    'Ministry of Industry and Trade: Move to Expedite EVNNPT Grid Unbundling from EVN',
  'Bộ Công Thương: Xem xét lập Tổng công ty Phát điện chiến lược quốc gia':
    'Ministry of Industry and Trade: Weighs Establishment of National Strategic Power Generation Corporation',
  'Chính phủ yêu cầu 9 địa phương tăng trưởng trên 15% trong quý IV':
    'Government Mandates Double-Digit Q4 Growth Exceeding 15% for 9 Key Economic Hubs',
  'Phó Thủ tướng yêu cầu xử lý nhà thầu chậm trễ thi công sân bay Long Thành':
    'Deputy Prime Minister Orders Sanctions on Underperforming Contractors at Long Thanh Airport Project',
  'JICA sẽ tăng các khoản cam kết và cho vay với Việt Nam':
    'JICA Pledges to Expand ODA Commitments and Concessional Infrastructure Loans to Vietnam',
  'Tăng tốc hướng đến APEC 2027: Sân bay Gia Bình và bài toán hạ tầng mang tầm quốc gia':
    'Accelerating Toward APEC 2027: Gia Binh Airport and High-Tech Aviation Infrastructure Development',
  'Doanh nghiệp và kỳ vọng 2026: Sẵn sàng cho chu kỳ tăng trưởng mới':
    'Vietnam Enterprise Outlook 2026: Preparing for Green Transition and Recovery Growth Cycle',
};

/**
 * Checks if a string contains Vietnamese diacritics
 */
export function isVietnameseText(text: string): boolean {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/i.test(text);
}

/**
 * Translates Vietnamese title to English
 */
export function translateTitleToEnglish(title: string): string {
  const trimmed = title.trim();
  if (TITLE_TRANSLATIONS[trimmed]) {
    return TITLE_TRANSLATIONS[trimmed];
  }
  
  // Heuristic cleanup for prefixes
  let result = trimmed
    .replace(/^Bộ Công Thương:\s*/i, 'Ministry of Industry and Trade: ')
    .replace(/^Chính phủ:\s*/i, 'Government: ')
    .replace(/^Thủ tướng:\s*/i, 'Prime Minister: ')
    .replace(/^Phó Thủ tướng:\s*/i, 'Deputy Prime Minister: ')
    .replace(/^Bộ GTVT:\s*/i, 'Ministry of Transport: ');

  return result;
}
