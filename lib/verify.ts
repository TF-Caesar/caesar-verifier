export type Verdict = 'VERIFIED' | 'UNSUPPORTED' | 'NEEDS_CONTEXT';
export interface VerifyResult { verdict: Verdict; matchedTerms: string[]; matchedHardToken?: string; }

const STOPWORDS = new Set([
  'the','a','an','of','to','in','on','and','or','is','are','was','were','be','by','for','with',
  'at','as','that','this','it','its','from','has','have','had','first','time',
]);

export function keyTerms(claim: string): string[] {
  return (claim.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [])
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * "Hard" tokens are SPECIFIC evidence a passage must echo to confirm a claim,
 * beyond mere term overlap: numbers/dates/money/percentages, and ALL-CAPS
 * acronyms (NIF, GPT). Title-case words (The, National) are deliberately NOT
 * hard tokens — they overlap with key terms and give no independent confirmation,
 * so a claim with no number/date/acronym honestly tops out at NEEDS_CONTEXT.
 */
export function hardTokens(claim: string): string[] {
  const tokens: string[] = [];
  for (const m of claim.matchAll(/\$?\d[\d,]*(?:\.\d+)?%?/g)) tokens.push(m[0]);
  for (const m of claim.matchAll(/\b[A-Z]{2,}\b/g)) tokens.push(m[0]);
  return tokens;
}

function passageHas(passage: string, term: string): boolean {
  return passage.toLowerCase().includes(term.toLowerCase());
}

export function verifyClaim({ claim, passage }: { claim: string; passage: string | null | undefined }): VerifyResult {
  if (!passage) return { verdict: 'UNSUPPORTED', matchedTerms: [] };
  const terms = keyTerms(claim);
  const matchedTerms = terms.filter((t) => passageHas(passage, t));
  const coverage = terms.length ? matchedTerms.length / terms.length : 0;
  const matchedHardToken = hardTokens(claim).find((h) => passageHas(passage, h));
  if (coverage >= 0.6 && matchedHardToken) return { verdict: 'VERIFIED', matchedTerms, matchedHardToken };
  if (coverage >= 0.6 || (matchedHardToken && coverage >= 0.3)) return { verdict: 'NEEDS_CONTEXT', matchedTerms, matchedHardToken };
  return { verdict: 'UNSUPPORTED', matchedTerms };
}
