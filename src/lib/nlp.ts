import { KOREAN_STOPWORDS } from './constants';
import { WordFrequency } from '../types/database';

/**
 * Extracts and cleans Korean word tokens from reasons, removing stopwords and particles.
 */
export function extractTopKeywords(
  texts: (string | null | undefined)[],
  limit: number = 8
): WordFrequency[] {
  const wordCounts = new Map<string, number>();
  let totalValidTokens = 0;

  const validTexts = texts.filter((t): t is string => Boolean(t && t.trim().length > 0));

  for (const text of validTexts) {
    // 1. Remove special characters and clean
    const cleaned = text
      .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const rawTokens = cleaned.split(' ');

    for (const token of rawTokens) {
      if (!token || token.length < 2) continue;

      // 2. Strip standard trailing particles (조사 분리 및 제거)
      let word = token;
      const particles = [
        '에서의', '에서도', '에서는', '에게는', '으로는', '으로써', '이지만',
        '에서', '에게', '으로', '로서', '로써', '이며', '이나', '에도', '에는',
        '하고', '마다', '까지', '부터', '조차', '마저',
        '은', '는', '이', '가', '을', '를', '의', '에', '로', '와', '과', '도', '만'
      ];

      for (const p of particles) {
        if (word.length > p.length + 1 && word.endsWith(p)) {
          word = word.slice(0, -p.length);
          break;
        }
      }

      // 3. Check stopwords and length
      if (word.length < 2) continue;
      if (KOREAN_STOPWORDS.has(word)) continue;

      // Count occurrence
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      totalValidTokens++;
    }
  }

  // Sort descending by count
  const sorted = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return sorted.map(([word, count]) => ({
    word,
    count,
    percentage: totalValidTokens > 0 ? Math.round((count / totalValidTokens) * 100) : 0,
  }));
}
